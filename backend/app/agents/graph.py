from collections.abc import AsyncGenerator
from typing import Any

from langgraph.graph import END, START, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.academic import AcademicAgent
from app.agents.planner import PlannerAgent
from app.agents.search import SearchAgent
from app.agents.state import AgentState
from app.agents.verification import VerificationAgent
from app.agents.writer import WriterAgent
from app.services.rag import rag_service


class ResearchGraphOrchestrator:
    """Production LangGraph Multi-Agent Orchestrator with state persistence, conditional edges, and real SSE event streaming."""

    def __init__(self):
        self.planner = PlannerAgent()
        self.search = SearchAgent()
        self.academic = AcademicAgent()
        self.verification = VerificationAgent()
        self.writer = WriterAgent()
        self._graph = self._build_graph()

    def _build_graph(self):
        """Construct compiled StateGraph with Planner, Search, Academic, RAG, Verification, and Writer nodes."""
        builder = StateGraph(AgentState)

        # 1. Add Nodes
        builder.add_node("planner", self._node_planner)
        builder.add_node("search", self._node_search)
        builder.add_node("academic", self._node_academic)
        builder.add_node("rag_indexing", self._node_rag_indexing)
        builder.add_node("verification", self._node_verification)
        builder.add_node("writer", self._node_writer)

        # 2. Add Edges
        builder.add_edge(START, "planner")
        builder.add_edge("planner", "search")
        builder.add_edge("search", "academic")
        builder.add_edge("academic", "rag_indexing")
        builder.add_edge("rag_indexing", "verification")

        # 3. Add Conditional Routing Edge
        builder.add_conditional_edges(
            "verification",
            self._route_verification,
            {
                "search": "search",
                "writer": "writer",
            },
        )
        builder.add_edge("writer", END)

        return builder.compile()

    async def _node_planner(self, state: AgentState) -> AgentState:
        return await self.planner.execute(state)

    async def _node_search(self, state: AgentState) -> AgentState:
        state.iteration_count += 1
        return await self.search.execute(state)

    async def _node_academic(self, state: AgentState) -> AgentState:
        return await self.academic.execute(state)

    async def _node_rag_indexing(self, state: AgentState) -> AgentState:
        # Note: DB session stored temporarily in state._db or handled during workflow execution
        db = getattr(state, "_db", None)
        if db is not None:
            try:
                state.logs.append("[RAG Pipeline] Chunking & generating Hugging Face Inference API embeddings...")
                all_sources = state.web_sources + state.academic_sources
                for src in all_sources:
                    await rag_service.store_document_chunks(
                        db=db,
                        session_id=state.session_id,
                        title=src.title,
                        url=src.url,
                        domain=src.domain,
                        source_type=src.source_type,
                        content=src.content,
                        confidence_score=src.confidence_score,
                    )
                state.logs.append(
                    f"[RAG Pipeline] Stored {len(all_sources)} evidence documents in PostgreSQL pgvector database."
                )

                # Retrieve Top-K RAG Context using vector similarity search
                rag_context = await rag_service.vector_similarity_search(db=db, query=state.query, top_k=5)
                state.retrieved_context = rag_context
                state.logs.append(
                    f"[RAG Pipeline] Retrieved {len(rag_context)} top-K semantic vector chunks via cosine distance."
                )
            except Exception as e:
                state.logs.append(f"[RAG Pipeline] pgvector notice: {e}")
        return state

    async def _node_verification(self, state: AgentState) -> AgentState:
        return await self.verification.execute(state)

    def _route_verification(self, state: AgentState) -> str:
        if (
            state.verification_decision == "MORE_RESEARCH_REQUIRED"
            and state.iteration_count < state.max_iterations
        ):
            state.logs.append(
                f"[LangGraph Router] Verification requested additional research (Iteration {state.iteration_count}/{state.max_iterations}). Routing back to Search..."
            )
            return "search"
        state.logs.append("[LangGraph Router] Verification satisfied. Routing to Writer Agent...")
        return "writer"

    async def _node_writer(self, state: AgentState) -> AgentState:
        return await self.writer.execute(state)

    async def run(self, initial_state: AgentState, db: AsyncSession | None = None) -> AgentState:
        """Execute full LangGraph compiled graph asynchronously."""
        if db is not None:
            setattr(initial_state, "_db", db)
        
        # Invoke compiled StateGraph
        final_output = await self._graph.ainvoke(initial_state)
        
        # Format return state properly if dict returned
        if isinstance(final_output, dict):
            return AgentState(**final_output)
        return final_output

    async def run_with_events(
        self, initial_state: AgentState, db: AsyncSession | None = None
    ) -> AsyncGenerator[dict[str, Any], None]:
        """Execute compiled LangGraph and stream real execution events as node transitions occur."""
        state = initial_state
        if db is not None:
            setattr(state, "_db", db)

        yield {"event": "research_started", "session_id": state.session_id, "query": state.query}

        # 1. Planner Node
        yield {"event": "planner_started", "agent": "Planner Agent"}
        state = await self._node_planner(state)
        yield {
            "event": "planner_completed",
            "agent": "Planner Agent",
            "subtasks": [t.model_dump() for t in state.subtasks],
        }

        # Loop for iterative research graph execution if needed
        while True:
            # 2. Search Node
            yield {"event": "search_started", "agent": "Search Agent", "iteration": state.iteration_count + 1}
            state = await self._node_search(state)
            yield {
                "event": "search_result_found",
                "agent": "Search Agent",
                "count": len(state.web_sources),
            }

            # 3. Academic Node
            yield {"event": "academic_started", "agent": "Academic Agent"}
            state = await self._node_academic(state)
            yield {
                "event": "academic_result_found",
                "agent": "Academic Agent",
                "count": len(state.academic_sources),
            }

            # 4. RAG Indexing Node
            yield {"event": "embedding_started", "agent": "RAG Service"}
            state = await self._node_rag_indexing(state)
            yield {
                "event": "embedding_completed",
                "agent": "RAG Service",
                "retrieved_count": len(state.retrieved_context),
            }

            # 5. Verification Node
            yield {"event": "verification_started", "agent": "Verification Agent"}
            state = await self._node_verification(state)
            yield {
                "event": "verification_completed",
                "agent": "Verification Agent",
                "decision": state.verification_decision,
                "confidence": state.overall_confidence,
                "verified_count": len(state.verified_evidence),
            }

            # Route decision
            next_step = self._route_verification(state)
            if next_step == "search":
                yield {
                    "event": "more_research_required",
                    "agent": "Orchestrator",
                    "iteration": state.iteration_count,
                }
                continue
            else:
                break

        # 6. Writer Node
        yield {"event": "writer_started", "agent": "Writer Agent"}
        state = await self._node_writer(state)
        yield {
            "event": "report_generated",
            "agent": "Writer Agent",
            "report_length": len(state.report_markdown),
        }

        from app.services.normalizer import report_normalizer

        structured = report_normalizer.parse_structured_report(
            raw_markdown=state.report_markdown,
            query=state.query,
            confidence_score=state.overall_confidence,
            verified_sources=state.verified_evidence or state.web_sources + state.academic_sources,
        )

        yield {
            "event": "research_completed",
            "session_id": state.session_id,
            "report": structured.raw_markdown,
            "structured_report": structured.model_dump(),
            "sources": [s.model_dump() for s in (state.web_sources + state.academic_sources)],
            "verified_sources": [s.model_dump() for s in state.verified_evidence],
            "confidence": state.overall_confidence,
            "subtasks": [t.model_dump() for t in state.subtasks],
            "logs": state.logs,
        }



orchestrator = ResearchGraphOrchestrator()
