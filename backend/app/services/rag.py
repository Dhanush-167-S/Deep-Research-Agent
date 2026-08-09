import asyncio
import os
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.vector_repository import VectorRepository


class RAGService:
    """Production RAG & pgvector service with Hugging Face Inference API embeddings."""

    def __init__(self):
        self.vector_dim = 384  # BAAI/bge-small-en-v1.5 embedding dimension
        self.model_name = settings.HF_EMBEDDING_MODEL

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """Split document text into overlapping chunks."""
        words = text.split()
        if not words:
            return []
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i : i + chunk_size])
            if chunk:
                chunks.append(chunk)
        return chunks

    def _mean_pooling(self, token_embeddings: list[list[float]]) -> list[float]:
        """Calculate mean pooling over token embeddings if 2D matrix returned."""
        if not token_embeddings:
            return [0.0] * self.vector_dim
        num_tokens = len(token_embeddings)
        pooled = [0.0] * self.vector_dim
        for token_vec in token_embeddings:
            for i, val in enumerate(token_vec[: self.vector_dim]):
                pooled[i] += float(val)
        return [val / num_tokens for val in pooled]

    async def generate_embeddings(self, text: str) -> list[float]:
        """Generate real dense vector embeddings using Hugging Face Inference API. No fake fallbacks allowed!"""
        hf_token = settings.HF_TOKEN or os.getenv("HF_TOKEN")
        max_retries = 3

        # Hugging Face Feature Extraction endpoints (official models & router paths)
        urls = [
            f"https://api-inference.huggingface.co/models/{self.model_name}",
            f"https://router.huggingface.co/hf-inference/models/{self.model_name}",
            f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}",
        ]
        headers = {}
        if hf_token and hf_token != "your_huggingface_token_here":
            headers["Authorization"] = f"Bearer {hf_token}"

        last_error = None
        for url in urls:
            for attempt in range(1, max_retries + 1):
                try:
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        response = await client.post(url, json={"inputs": text, "options": {"wait_for_model": True}}, headers=headers)
                        if response.status_code == 200:
                            data = response.json()
                            # 1D vector returned directly
                            if isinstance(data, list) and len(data) == self.vector_dim and isinstance(data[0], (int, float)):
                                return [float(x) for x in data]

                            # 2D matrix returned [tokens x hidden_dim]
                            if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                                if isinstance(data[0][0], (int, float)):
                                    return self._mean_pooling(data)
                                elif isinstance(data[0][0], list):
                                    return self._mean_pooling(data[0])

                            # Dict payload format
                            if isinstance(data, dict) and "embedding" in data:
                                return [float(x) for x in data["embedding"]]

                        last_error = f"HF status {response.status_code}: {response.text[:120]}"
                except Exception as e:
                    last_error = str(e)
                    if attempt < max_retries:
                        await asyncio.sleep(0.5 * attempt)

        raise RuntimeError(
            f"Hugging Face Embeddings API failed for model '{self.model_name}' after attempts: {last_error}"
        )

    async def store_document_chunks(
        self,
        db: AsyncSession,
        session_id: str,
        title: str,
        url: str,
        domain: str,
        source_type: str,
        content: str,
        confidence_score: float = 95.0,
    ) -> list[str]:
        """Chunk text, generate HF embeddings, and persist into pgvector."""
        repo = VectorRepository(db)
        chunks = self.chunk_text(content)
        stored_ids = []

        for chunk in chunks:
            embedding = await self.generate_embeddings(chunk)
            vec = await repo.store_embedding(
                session_id=session_id,
                title=title,
                url=url,
                domain=domain,
                source_type=source_type,
                content=chunk,
                confidence_score=confidence_score,
                embedding=embedding,
            )
            stored_ids.append(vec.id)

        return stored_ids

    async def vector_similarity_search(
        self, db: AsyncSession, query: str, top_k: int = 5
    ) -> list[dict[str, Any]]:
        """Perform real pgvector cosine similarity search using query embedding."""
        query_vector = await self.generate_embeddings(query)
        repo = VectorRepository(db)
        return await repo.similarity_search(query_vector, top_k=top_k)


rag_service = RAGService()

