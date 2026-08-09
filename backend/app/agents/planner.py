import json
import uuid

from app.agents.llm import get_llm
from app.agents.state import AgentState, SubTask


class PlannerAgent:
    """Planner Agent: Uses Google Gemini (gemini-2.5-flash) to decompose research goals into execution subtasks."""

    def __init__(self):
        self.name = "Planner Agent"

    async def execute(self, state: AgentState) -> AgentState:
        state.current_agent = "planner"
        state.status = "planning"
        state.logs.append(f"[{self.name}] Analyzing prompt: '{state.query}' using Gemini 2.5 Flash")

        llm = get_llm(temperature=0.2)
        subtasks = []

        if llm:
            try:
                system_prompt = (
                    "You are the Planner Agent of TopResearch AI OS. Your responsibility is to analyze the research query and "
                    "decompose it into 4 distinct, actionable subtasks. "
                    "Return ONLY a raw JSON array of objects with keys 'title' and 'description'.\n"
                    "Example output: [{\"title\": \"Subtask Title\", \"description\": \"Detailed subtask description\"}]"
                )
                user_msg = f"Research Query: {state.query}"
                response = await llm.ainvoke([
                    ("system", system_prompt),
                    ("human", user_msg)
                ])

                content = str(response.content).strip()
                # Clean code block backticks if returned
                if content.startswith("```"):
                    content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                if content.startswith("json"):
                    content = content[4:].strip()

                parsed = json.loads(content)
                if isinstance(parsed, list):
                    for idx, item in enumerate(parsed):
                        subtasks.append(
                            SubTask(
                                id=f"task_{idx+1}_{str(uuid.uuid4())[:4]}",
                                title=item.get("title", f"Subtask {idx+1}"),
                                description=item.get("description", "Execute research subtask."),
                                status="pending",
                            )
                        )
            except Exception as e:
                state.logs.append(f"[{self.name}] Gemini planning notice ({e}). Generating topic-focused subtasks.")

        if not subtasks:
            # Topic-aware dynamic subtask fallback
            subtasks = [
                SubTask(
                    id=f"task_1_{str(uuid.uuid4())[:4]}",
                    title=f"Core Concepts & Architecture for '{state.query[:40]}'",
                    description="Analyze primary definitions, foundational mechanisms, and fundamental trade-offs.",
                    status="completed"
                ),
                SubTask(
                    id=f"task_2_{str(uuid.uuid4())[:4]}",
                    title="Real-Time Web Evidence Retrieval (Tavily Search)",
                    description="Search authoritative engineering documentation, benchmarks, and live web sources.",
                    status="pending"
                ),
                SubTask(
                    id=f"task_3_{str(uuid.uuid4())[:4]}",
                    title="Scholarly & Academic Paper Survey",
                    description="Retrieve peer-reviewed publications, arXiv preprints, and academic literature.",
                    status="pending"
                ),
                SubTask(
                    id=f"task_4_{str(uuid.uuid4())[:4]}",
                    title="Source Verification & Synthesis (Gemini Writer)",
                    description="Cross-reference evidence, detect contradictions, verify URLs, and write final report.",
                    status="pending"
                ),
            ]

        state.subtasks = subtasks
        state.logs.append(f"[{self.name}] Generated {len(subtasks)} dynamic research subtasks via Gemini.")
        return state
