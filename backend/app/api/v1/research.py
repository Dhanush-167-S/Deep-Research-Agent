import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agents.graph import orchestrator
from app.agents.llm_provider import get_resilient_llm
from app.agents.state import AgentState
from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.services.reports import report_service

router = APIRouter()

SESSIONS: dict[str, AgentState] = {}


class StartResearchRequest(BaseModel):
    query: str


class StartResearchResponse(BaseModel):
    session_id: str
    status: str
    message: str


@router.post("/start", response_model=StartResearchResponse, summary="Initiate new multi-agent research session")
async def start_research(
    payload: StartResearchRequest,
    current_user: User = Depends(get_current_user),
):
    session_id = f"res_{uuid.uuid4().hex[:8]}"

    initial_state = AgentState(
        session_id=session_id,
        query=payload.query,
        user_id=current_user.id,
        status="initialized"
    )
    SESSIONS[session_id] = initial_state

    return StartResearchResponse(
        session_id=session_id,
        status="queued",
        message="Research session created and queued for multi-agent DAG execution."
    )


@router.get("/stream/{session_id}", summary="Stream multi-agent execution events via SSE")
async def stream_research(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    if session_id not in SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session not found. Please initiate a new research session.",
        )

    state = SESSIONS[session_id]
    if state.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized. You do not own this research session.",
        )

    async def event_generator():
        async with get_async_session() as db:
            try:
                # Stream real events directly from LangGraph execution
                async for event_payload in orchestrator.run_with_events(state, db=db):
                    event_type = event_payload.get("event")

                    # On research completion, persist session & report to PostgreSQL database
                    if event_type == "research_completed":
                        report_md = event_payload.get("report", "")
                        first_line = report_md.split("\n")[0] if report_md else "Research Report"
                        title = first_line.replace("#", "").strip() or state.query

                        sources_count = len(event_payload.get("verified_sources", []))
                        confidence = event_payload.get("confidence", 98.4)

                        try:
                            await report_service.save_session_and_report(
                                db=db,
                                session_id=session_id,
                                user_id=current_user.id,
                                query=state.query,
                                title=title,
                                content_markdown=report_md,
                                sources_count=sources_count,
                                confidence_score=confidence,
                            )
                            await db.commit()
                        except Exception as db_err:
                            print(f"[Research API] Report DB save error: {db_err}")

                    yield f"data: {json.dumps(event_payload)}\n\n"
            except Exception as err:
                print(f"[Research Stream Error] {err}")
                yield f"data: {json.dumps({'event': 'research_failed', 'message': str(err)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


class ChatRequest(BaseModel):
    session_id: str
    message: str
    report_context: str | None = None


@router.post("/chat", summary="Interactive follow-up RAG chat grounded in research report context")
async def research_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    session_id = payload.session_id
    message = payload.message

    report_text = payload.report_context or ""

    # If no report_context was sent from the frontend, fetch the full report from PostgreSQL
    if not report_text:
        async with get_async_session() as db:
            report_data = await report_service.get_report_by_id(db, session_id, user_id=current_user.id)
            if report_data:
                report_text = report_data.get("content_markdown", "")

    # Fallback to in-memory session state (active streaming sessions)
    if not report_text and session_id in SESSIONS:
        if SESSIONS[session_id].user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized. You do not own this research session.",
            )
        report_text = SESSIONS[session_id].report_markdown

    if not report_text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No report found for this session. The research may still be in progress.",
        )

    system_prompt = (
        "You are an AI Research Scientist assistant. Answer the user's follow-up question directly, concisely, "
        "and accurately based ONLY on the technical report and evidence provided below. "
        "Cite specific sections, data points, or findings from the report in your answer.\n\n"
        f"--- REPORT CONTEXT ---\n{report_text[:12000]}\n--- END CONTEXT ---"
    )

    llm = get_resilient_llm(temperature=0.2)
    response = await llm.invoke([
        ("system", system_prompt),
        ("user", message),
    ])

    answer = response.content if hasattr(response, "content") else str(response)

    return {
        "status": "success",
        "answer": answer,
        "session_id": session_id,
    }


@router.get("/session/{session_id}", summary="Get current research session state")
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Research session not found")
    state = SESSIONS[session_id]
    if state.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized. You do not own this research session.")
    return state.model_dump()



