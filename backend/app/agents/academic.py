import uuid
import xml.etree.ElementTree as ET
from urllib.parse import quote, urlparse

import httpx

from app.agents.state import AgentState, EvidenceChunk


class AcademicAgent:
    """Academic Agent: Directly queries Semantic Scholar API and arXiv API for peer-reviewed research papers."""

    def __init__(self):
        self.name = "Academic Agent"

    async def _fetch_semantic_scholar(self, query: str) -> list[EvidenceChunk]:
        chunks = []
        try:
            short_query = " ".join(query.split()[:5])
            encoded_query = quote(short_query)
            url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={encoded_query}&limit=4&fields=title,abstract,url,authors,year,citationCount"
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    papers = data.get("data", [])
                    for idx, paper in enumerate(papers):
                        title = paper.get("title", f"Scholarly Paper {idx+1}")
                        abstract = paper.get("abstract") or "Peer-reviewed literature contribution."
                        paper_url = paper.get("url") or f"https://www.semanticscholar.org/paper/{paper.get('paperId', '')}"
                        domain = urlparse(paper_url).netloc or "semanticscholar.org"
                        citations = paper.get("citationCount", 0)
                        confidence = min(88.0 + (citations / 50.0), 99.5)

                        chunks.append(
                            EvidenceChunk(
                                id=f"s2_{uuid.uuid4().hex[:6]}",
                                title=title,
                                url=paper_url,
                                domain=domain,
                                source_type="academic",
                                content=abstract,
                                confidence_score=round(confidence, 1),
                                citation_ref=f"Paper {idx+1}",
                            )
                        )
        except Exception as e:
            print(f"[AcademicAgent] Semantic Scholar API notice: {e}")
        return chunks

    async def _fetch_arxiv(self, query: str) -> list[EvidenceChunk]:
        chunks = []
        try:
            # Extract main keyword for arXiv query
            words = [w for w in query.split() if len(w) > 3][:4]
            search_term = " AND ".join(words) if words else query
            encoded_query = quote(search_term)
            url = f"https://export.arxiv.org/api/query?search_query=all:{encoded_query}&start=0&max_results=4"
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                res = await client.get(url)
                if res.status_code == 200 and "<entry>" in res.text:
                    root = ET.fromstring(res.text)
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    entries = root.findall("atom:entry", ns)
                    for idx, entry in enumerate(entries):
                        title_el = entry.find("atom:title", ns)
                        summary_el = entry.find("atom:summary", ns)
                        id_el = entry.find("atom:id", ns)

                        title = title_el.text.strip().replace("\n", " ") if title_el is not None and title_el.text else f"arXiv Preprint {idx+1}"
                        summary = summary_el.text.strip().replace("\n", " ") if summary_el is not None and summary_el.text else "Academic preprint research article."
                        paper_url = id_el.text.strip() if id_el is not None and id_el.text else "https://arxiv.org"

                        chunks.append(
                            EvidenceChunk(
                                id=f"arxiv_{uuid.uuid4().hex[:6]}",
                                title=title,
                                url=paper_url,
                                domain="arxiv.org",
                                source_type="academic",
                                content=summary,
                                confidence_score=98.5,
                                citation_ref=f"arXiv {idx+1}",
                            )
                        )
        except Exception as e:
            print(f"[AcademicAgent] arXiv API notice: {e}")
        return chunks



    async def execute(self, state: AgentState) -> AgentState:
        state.current_agent = "academic"
        state.logs.append(f"[{self.name}] Querying Semantic Scholar & arXiv APIs for: '{state.query}'")

        academic_chunks = []

        # 1. Fetch from Semantic Scholar API
        s2_chunks = await self._fetch_semantic_scholar(state.query)
        academic_chunks.extend(s2_chunks)
        state.logs.append(f"[{self.name}] Retrieved {len(s2_chunks)} papers from Semantic Scholar API.")

        # 2. Fetch from arXiv API
        arxiv_chunks = await self._fetch_arxiv(state.query)
        academic_chunks.extend(arxiv_chunks)
        state.logs.append(f"[{self.name}] Retrieved {len(arxiv_chunks)} preprints from arXiv API.")

        # Assign unique citation references across total sources
        for idx, chunk in enumerate(academic_chunks):
            chunk.citation_ref = f"Ref {len(state.web_sources) + idx + 1}"

        state.academic_sources.extend(academic_chunks)
        state.logs.append(f"[{self.name}] Total academic sources gathered: {len(academic_chunks)}.")
        return state

