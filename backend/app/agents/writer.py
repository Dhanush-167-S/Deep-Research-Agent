from app.agents.llm_provider import get_resilient_llm
from app.agents.state import AgentState
from app.services.normalizer import report_normalizer


class WriterAgent:
    """Writer Agent: Synthesizes verified RAG evidence and pgvector context into a publication-ready report."""

    def __init__(self):
        self.name = "Writer Agent"

    async def execute(self, state: AgentState) -> AgentState:
        state.current_agent = "writer"
        state.status = "writing"
        state.logs.append(
            f"[{self.name}] Synthesizing report using verified evidence ({len(state.verified_evidence)} sources) & RAG retrieved context ({len(state.retrieved_context)} chunks)..."
        )

        llm = get_resilient_llm(temperature=0.2)

        evidence_payload = [
            {
                "citation_ref": c.citation_ref,
                "title": c.title,
                "url": c.url,
                "domain": c.domain,
                "source_type": c.source_type,
                "content": c.content,
                "confidence_score": c.confidence_score,
            }
            for c in state.verified_evidence
        ]

        system_prompt = (
            "You are the Writer Agent of TopResearch AI OS, a production AI research operating system. "
            "Synthesize an EXHAUSTIVE, COMPREHENSIVE, PUBLICATION-GRADE technical research report based strictly on the provided research query and verified evidence.\n\n"
            "LENGTH & COMPREHENSIVENESS REQUIREMENTS:\n"
            "1. Write an in-depth, long-form report (aim for 2,000+ words / 10,000+ characters).\n"
            "2. DO NOT write short summaries or brief overviews. Elaborate extensively with multi-paragraph analysis under each section.\n"
            "3. Include full technical details, underlying architectural mechanics, concrete design trade-offs, empirical benchmarks, and edge cases.\n"
            "4. Structure the report with these exact section headings:\n"
            "   # Authoritative Title\n"
            "   ## Executive Summary\n"
            "   ## Key Findings & Empirical Takeaways\n"
            "   ## 1. System Architecture & Fundamental Paradigms\n"
            "   ## 2. Technical Deep-Dive & Component Mechanics\n"
            "   ## 3. Empirical Benchmarks & Trade-off Matrix (include formatted Markdown table)\n"
            "   ## 4. Operational Considerations, Security & Failure Modes\n"
            "   ## 5. Strategic Production Implementation Blueprint\n"
            "   ## Conclusion & Future Horizons\n"
            "5. Cite evidence naturally using inline Markdown links [Source Title](url) or citation markers [Ref 1].\n"
            "6. Output ONLY clean Markdown text without internal reasoning or prompt boilerplate."
        )


        user_msg = (
            f"Research Query: {state.query}\n"
            f"Verified Evidence Chunks ({len(evidence_payload)} sources):\n{evidence_payload}"
        )

        try:
            response = await llm.invoke([("system", system_prompt), ("human", user_msg)])
            raw_text = response.content if hasattr(response, "content") else str(response)

            # Process report through ReportNormalizer
            structured_report = report_normalizer.parse_structured_report(
                raw_markdown=raw_text,
                query=state.query,
                confidence_score=state.overall_confidence,
                verified_sources=state.verified_evidence or state.web_sources + state.academic_sources,
            )

            state.report_markdown = structured_report.raw_markdown
            state.status = "completed"
            state.logs.append(f"[{self.name}] Successfully normalized technical report into structured model.")
            return state
        except Exception as e:
            state.logs.append(f"[{self.name}] Writer Agent generation error: {e}")
            raise e


