import asyncio
import os
import uuid
from urllib.parse import urlparse

import httpx

from app.agents.state import AgentState, EvidenceChunk
from app.core.config import settings


class SearchAgent:
    """Search Agent: Queries Tavily Web Search API to retrieve structured web evidence."""

    def __init__(self):
        self.name = "Search Agent"

    async def execute(self, state: AgentState) -> AgentState:
        state.current_agent = "search"
        state.status = "searching"
        state.logs.append(f"[{self.name}] Initiating Tavily web search for: '{state.query}'")

        tavily_api_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
        if not tavily_api_key:
            error_msg = f"[{self.name}] TAVILY_API_KEY is not configured! Real web search requires Tavily."
            state.logs.append(error_msg)
            print(error_msg)
            return state

        web_chunks = []
        max_retries = 3
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": tavily_api_key,
            "query": state.query,
            "search_depth": "advanced",
            "include_answer": False,
            "max_results": 5,
        }

        for attempt in range(1, max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        results = data.get("results", [])
                        for idx, item in enumerate(results):
                            raw_url = item.get("url", "")
                            domain = urlparse(raw_url).netloc or "web-source"
                            score = float(item.get("score", 0.95)) * 100.0
                            confidence = min(max(score, 85.0), 99.5)

                            web_chunks.append(
                                EvidenceChunk(
                                    id=f"tavily_{uuid.uuid4().hex[:6]}",
                                    title=item.get("title", f"Web Source {idx+1}"),
                                    url=raw_url,
                                    domain=domain,
                                    source_type="web",
                                    content=item.get("content", ""),
                                    confidence_score=round(confidence, 1),
                                    citation_ref=f"Ref {len(state.web_sources) + idx + 1}",
                                )
                            )
                        state.logs.append(f"[{self.name}] Tavily API returned {len(web_chunks)} live web results.")
                        break
                    else:
                        state.logs.append(f"[{self.name}] Tavily API status {res.status_code} (attempt {attempt}): {res.text[:100]}")
            except Exception as e:
                state.logs.append(f"[{self.name}] Tavily API exception (attempt {attempt}/{max_retries}): {e}")
                if attempt < max_retries:
                    await asyncio.sleep(1.0 * attempt)

        state.web_sources.extend(web_chunks)
        state.logs.append(f"[{self.name}] Total web sources gathered: {len(web_chunks)}.")
        return state

