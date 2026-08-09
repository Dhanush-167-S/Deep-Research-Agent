from typing import Any
from pydantic import BaseModel, Field


class EvidenceChunk(BaseModel):
    id: str
    title: str
    url: str
    domain: str
    source_type: str  # "web" or "academic"
    content: str
    confidence_score: float = 0.95
    citation_ref: str


class SubTask(BaseModel):
    id: str
    title: str
    description: str
    status: str = "pending"  # "pending", "running", "completed"


class AgentState(BaseModel):
    session_id: str
    query: str
    user_id: str | None = None
    current_agent: str = "planner"
    subtasks: list[SubTask] = Field(default_factory=list)
    web_sources: list[EvidenceChunk] = Field(default_factory=list)
    academic_sources: list[EvidenceChunk] = Field(default_factory=list)
    verified_evidence: list[EvidenceChunk] = Field(default_factory=list)
    retrieved_context: list[dict[str, Any]] = Field(default_factory=list)
    contradictions_found: list[str] = Field(default_factory=list)
    overall_confidence: float = 98.4
    verification_decision: str = "SUFFICIENT_EVIDENCE"  # "MORE_RESEARCH_REQUIRED" or "SUFFICIENT_EVIDENCE"
    iteration_count: int = 0
    max_iterations: int = 2
    report_markdown: str = ""
    status: str = "initialized"  # "initialized", "planning", "searching", "verifying", "writing", "completed", "failed"
    logs: list[str] = Field(default_factory=list)

