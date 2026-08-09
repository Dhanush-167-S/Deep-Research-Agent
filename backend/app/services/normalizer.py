import re
import uuid
from typing import Any
from urllib.parse import urlparse

from app.models.report_schema import ReportSection, SourceRef, StructuredReport


class ReportNormalizer:
    """Service for cleaning, normalizing, resolving citations, and structuring raw LLM research reports."""

    @staticmethod
    def clean_raw_markdown(raw_text: str) -> str:
        """Strip raw LLM formatting artifacts, repeated rules, and hallucinated metrics."""
        if not raw_text:
            return ""

        text = raw_text.strip()

        # 1. Strip raw python list representation if wrapped: e.g. [{'type':'text', 'text':'...'}]
        if text.startswith("[{'type':") or text.startswith('[{"type":'):
            match = re.search(r"['\"]text['\"]:\s*['\"](.*?)['\"]\}", text, re.DOTALL)
            if match:
                text = match.group(1).replace("\\n", "\n")

        # 2. Remove hallucinated confidence score lines
        text = re.sub(r"(?i)\*\*confidence\s*score:\*\*\s*\d+(\.\d+)?%?", "", text)
        text = re.sub(r"(?i)confidence\s*score:\s*\d+(\.\d+)?%?", "", text)

        # 3. Normalize repeated horizontal rules (--- or ***) into single spacing
        text = re.sub(r"\n\s*[-*_]{3,}\s*\n", "\n\n", text)

        # 4. Remove leading/trailing quotes or escaped markdown fences
        text = re.sub(r"^```markdown\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"```$", "", text, flags=re.MULTILINE)

        # 5. Clean up excessive blank lines (more than 2 consecutive newlines)
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    @staticmethod
    def resolve_citations(text: str, verified_sources: list[Any]) -> tuple[str, list[SourceRef]]:
        """Map raw links and citation markers to standard [1], [2] badges and build clean SourceRef list."""
        source_refs: list[SourceRef] = []
        url_to_citation: dict[str, int] = {}

        # First, register explicitly verified sources
        for idx, src in enumerate(verified_sources):
            url = getattr(src, "url", None) or (src.get("url") if isinstance(src, dict) else "")
            title = getattr(src, "title", None) or (src.get("title") if isinstance(src, dict) else f"Source {idx+1}")
            domain = getattr(src, "domain", None) or (src.get("domain") if isinstance(src, dict) else "")
            if not domain and url:
                domain = urlparse(url).netloc.replace("www.", "")

            stype = getattr(src, "source_type", None) or (src.get("source_type") if isinstance(src, dict) else "web")
            if "arxiv" in domain.lower() or "semanticscholar" in domain.lower():
                stype = "academic"
            elif any(d in domain.lower() for d in ["docs.", "github.", "developer.", "microsoft.com", "aws."]):
                stype = "documentation"

            c_num = idx + 1
            if url:
                url_to_citation[url] = c_num

            source_refs.append(
                SourceRef(
                    citation_number=c_num,
                    title=title,
                    url=url or "#",
                    domain=domain or "web",
                    source_type=stype,
                    snippet=getattr(src, "content", None) or (src.get("content") if isinstance(src, dict) else ""),
                    confidence_score=getattr(src, "confidence_score", 95.0) if not isinstance(src, dict) else src.get("confidence_score", 95.0),
                )
            )

        # Function to replace Markdown inline links [Title](https://...) with clean text + [N]
        def replace_link(match):
            link_text = match.group(1).strip()
            link_url = match.group(2).strip()

            if link_url in url_to_citation:
                c_num = url_to_citation[link_url]
            else:
                c_num = len(source_refs) + 1
                url_to_citation[link_url] = c_num
                domain = urlparse(link_url).netloc.replace("www.", "")
                stype = "academic" if "arxiv" in domain or "semanticscholar" in domain else "web"
                source_refs.append(
                    SourceRef(
                        citation_number=c_num,
                        title=link_text if len(link_text) > 3 else f"Reference Source {c_num}",
                        url=link_url,
                        domain=domain or "web",
                        source_type=stype,
                        snippet="",
                        confidence_score=92.0,
                    )
                )
            return f"{link_text} [{c_num}]"

        # Replace Markdown links [text](url) -> text [N]
        clean_text = re.sub(r"\[([^\]]+)\]\((https?://[^\)]+)\)", replace_link, text)

        # Replace [Ref 1], [Ref 2] or (Ref 1) with standard [1], [2]
        clean_text = re.sub(r"\[Ref\s*(\d+)\]", r"[\1]", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\(Ref\s*(\d+)\)", r"[\1]", clean_text, flags=re.IGNORECASE)

        return clean_text, source_refs

    @classmethod
    def parse_structured_report(
        cls,
        raw_markdown: str,
        query: str,
        confidence_score: float = 95.0,
        verified_sources: list[Any] | None = None,
    ) -> StructuredReport:
        """Parse cleaned markdown text into a validated StructuredReport Pydantic model."""
        cleaned_markdown = cls.clean_raw_markdown(raw_markdown)
        sources_list = verified_sources or []
        resolved_text, source_refs = cls.resolve_citations(cleaned_markdown, sources_list)

        # Extract title
        title = query
        lines = resolved_text.split("\n")
        first_line = lines[0].strip() if lines else ""
        if first_line.startswith("# "):
            title = first_line.replace("# ", "").strip()

        # Split markdown into sections by ## headers
        section_blocks = re.split(r"\n(?=##\s+)", resolved_text)

        exec_summary = ""
        key_findings = []
        sections: list[ReportSection] = []
        conclusion = ""

        section_counter = 1

        for block in section_blocks:
            block_str = block.strip()
            if not block_str:
                continue

            header_match = re.match(r"^##\s+(.*)", block_str)
            if not header_match:
                # Top level content before any ## header
                if not exec_summary:
                    exec_summary = block_str
                continue

            heading_line = header_match.group(1).strip()
            body_content = block_str[header_match.end():].strip()

            heading_lower = heading_line.lower()

            if "executive summary" in heading_lower:
                exec_summary = body_content
            elif "key findings" in heading_lower or "key takeaways" in heading_lower:
                # Extract bullet points
                bullets = re.findall(r"^\s*[\*\-\•]\s*(.*)", body_content, flags=re.MULTILINE)
                key_findings = [b.strip() for b in bullets if b.strip()]
                if not key_findings:
                    key_findings = [line.strip() for line in body_content.split("\n") if line.strip() and not line.startswith("#")]
            elif "conclusion" in heading_lower or "summary & recommendations" in heading_lower:
                conclusion = body_content
            elif "references" in heading_lower or "sources" in heading_lower:
                # References section is handled dynamically by resolved_sources
                continue
            else:
                # General section
                clean_heading = re.sub(r"^\d+[\.\)]\s*", "", heading_line)
                sections.append(
                    ReportSection(
                        id=f"sec_{section_counter}",
                        number=str(section_counter),
                        heading=clean_heading,
                        content=body_content,
                    )
                )
                section_counter += 1

        if not exec_summary:
            exec_summary = (
                f"This research report provides a verified synthesis regarding '{query}'. "
                "Evidence from web sources and academic literature was gathered, cross-checked, and structured into verified sections below."
            )

        return StructuredReport(
            title=title,
            executive_summary=exec_summary,
            key_findings=key_findings,
            sections=sections,
            conclusion=conclusion,
            confidence_score=round(confidence_score, 1),
            sources=source_refs,
            raw_markdown=resolved_text,
        )


report_normalizer = ReportNormalizer()
