from typing import Any
from pydantic import BaseModel, Field


class ReportSection(BaseModel):
    id: str = ""
    number: str = ""
    heading: str
    content: str
    subsections: list["ReportSection"] = []


class SourceRef(BaseModel):
    citation_number: int
    title: str
    url: str
    domain: str
    source_type: str = "web"  # web, academic, documentation, government, news
    snippet: str = ""
    confidence_score: float = 95.0


class StructuredReport(BaseModel):
    title: str
    executive_summary: str
    key_findings: list[str] = []
    sections: list[ReportSection] = []
    conclusion: str = ""
    confidence_score: float = 95.0
    sources: list[SourceRef] = []
    raw_markdown: str = ""
