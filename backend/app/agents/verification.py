import json

from app.agents.llm import get_llm
from app.agents.state import AgentState


class VerificationAgent:
    """Verification Agent: Cross-references evidence, evaluates credibility, detects contradictions, and decides whether more research is needed."""

    def __init__(self):
        self.name = "Verification Agent"

    async def execute(self, state: AgentState) -> AgentState:
        state.current_agent = "verification"
        state.status = "verifying"
        state.logs.append(
            f"[{self.name}] Evaluating {len(state.web_sources)} web & {len(state.academic_sources)} academic evidence chunks + {len(state.retrieved_context)} pgvector RAG chunks..."
        )

        all_evidence = state.web_sources + state.academic_sources
        if not all_evidence:
            state.verified_evidence = []
            state.overall_confidence = 70.0
            state.contradictions_found = ["Insufficient primary sources retrieved."]
            state.verification_decision = (
                "MORE_RESEARCH_REQUIRED" if state.iteration_count < state.max_iterations else "SUFFICIENT_EVIDENCE"
            )
            state.logs.append(f"[{self.name}] Verification decision: {state.verification_decision} (Zero evidence chunks).")
            return state

        llm = get_llm(temperature=0.1)

        try:
            evidence_summary = [
                {
                    "id": c.id,
                    "title": c.title,
                    "domain": c.domain,
                    "content": c.content[:300],
                    "confidence_score": c.confidence_score,
                }
                for c in all_evidence
            ]
            system_prompt = (
                "You are the Verification Agent of TopResearch AI OS. Evaluate the provided evidence chunks for consistency, "
                "authority, and factual backing.\n"
                "Return ONLY a JSON object with keys:\n"
                "1. 'verified_ids': list of evidence chunk IDs that are factual and trustworthy\n"
                "2. 'contradictions': list of contradiction strings or weak claim notices\n"
                "3. 'overall_confidence': float confidence score between 0.0 and 100.0\n"
                "4. 'decision': string, either 'MORE_RESEARCH_REQUIRED' or 'SUFFICIENT_EVIDENCE'\n"
                "Example: {\"verified_ids\": [\"tavily_1\"], \"contradictions\": [], \"overall_confidence\": 96.5, \"decision\": \"SUFFICIENT_EVIDENCE\"}"
            )
            user_msg = (
                f"Research Query: {state.query}\n"
                f"Iteration Count: {state.iteration_count}/{state.max_iterations}\n"
                f"Evidence Chunks: {json.dumps(evidence_summary)}"
            )
            response = await llm.invoke([("system", system_prompt), ("human", user_msg)])

            content = str(response.content).strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            if content.startswith("json"):
                content = content[4:].strip()

            parsed = json.loads(content)
            verified_ids = set(parsed.get("verified_ids", []))
            contradictions = parsed.get("contradictions", [])
            overall_confidence = float(parsed.get("overall_confidence", 95.0))
            decision = str(parsed.get("decision", "SUFFICIENT_EVIDENCE")).upper()

            verified = [c for c in all_evidence if c.id in verified_ids or not verified_ids]
            if not verified:
                verified = all_evidence

            state.verified_evidence = verified
            state.contradictions_found = contradictions
            state.overall_confidence = min(max(overall_confidence, 50.0), 99.9)

            if len(verified) < 2 and state.iteration_count < state.max_iterations:
                decision = "MORE_RESEARCH_REQUIRED"

            state.verification_decision = decision
            state.logs.append(
                f"[{self.name}] Verified {len(verified)} chunks. Contradictions: {len(contradictions)}. Decision: {state.verification_decision} (Confidence: {state.overall_confidence}%)."
            )
            return state
        except Exception as e:
            state.logs.append(f"[{self.name}] LLM verification notice ({e}). Evaluating rule-based confidence.")

        # Rule-based fallback if JSON parsing error
        verified = [c for c in all_evidence if c.confidence_score >= 80.0] or all_evidence
        avg_score = sum(c.confidence_score for c in verified) / float(len(verified))
        state.verified_evidence = verified
        state.overall_confidence = round(avg_score, 1)
        state.contradictions_found = []
        state.verification_decision = (
            "MORE_RESEARCH_REQUIRED" if len(verified) < 2 and state.iteration_count < state.max_iterations else "SUFFICIENT_EVIDENCE"
        )

        state.logs.append(
            f"[{self.name}] Verified {len(verified)} chunks. Decision: {state.verification_decision} (Confidence: {state.overall_confidence}%)."
        )
        return state

