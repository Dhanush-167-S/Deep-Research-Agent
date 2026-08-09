from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import VectorEmbedding


class VectorRepository:
    """pgvector Repository for vector embedding persistence and cosine similarity search."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def store_embedding(
        self,
        session_id: str,
        title: str,
        url: str,
        domain: str,
        source_type: str,
        content: str,
        confidence_score: float,
        embedding: list[float],
    ) -> VectorEmbedding:
        vec = VectorEmbedding(
            session_id=session_id,
            title=title,
            url=url,
            domain=domain,
            source_type=source_type,
            content=content,
            confidence_score=confidence_score,
            embedding=embedding,
        )
        self.db.add(vec)
        await self.db.flush()
        return vec

    async def similarity_search(self, query_embedding: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        """Perform cosine distance similarity search using pgvector l2/cosine distance operator."""
        # Query ordering by cosine distance (<=> operator in pgvector)
        result = await self.db.execute(
            select(VectorEmbedding)
            .order_by(VectorEmbedding.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )
        records = result.scalars().all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "url": r.url,
                "domain": r.domain,
                "source_type": r.source_type,
                "content": r.content,
                "confidence_score": r.confidence_score,
            }
            for r in records
        ]

