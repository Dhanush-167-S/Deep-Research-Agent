from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.report_repository import ReportRepository


class ReportService:
    """Service handling research session and report retrieval, storage, and history indexing."""

    async def get_user_history(self, db: AsyncSession, user_id: str) -> list[dict[str, Any]]:
        """Retrieve user research history sessions from PostgreSQL."""
        repo = ReportRepository(db)
        return await repo.get_user_history(user_id)

    async def get_report_by_id(self, db: AsyncSession, report_id: str, user_id: str | None = None) -> dict[str, Any] | None:
        """Retrieve report by ID from PostgreSQL with user authorization."""
        repo = ReportRepository(db)
        return await repo.get_report_by_id(report_id, user_id=user_id)

    async def save_session_and_report(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: str,
        query: str,
        title: str,
        content_markdown: str,
        sources_count: int,
        confidence_score: float,
    ):
        """Persist session and report into PostgreSQL database."""
        repo = ReportRepository(db)
        await repo.create_session(session_id, user_id, query)
        await repo.update_session_status(session_id, "completed", confidence_score, sources_count)
        await repo.create_or_update_report(session_id, title, content_markdown)

    async def delete_report(self, db: AsyncSession, report_id: str, user_id: str | None = None) -> bool:
        """Delete research session and report from PostgreSQL with user authorization."""
        repo = ReportRepository(db)
        return await repo.delete_report(report_id, user_id=user_id)



report_service = ReportService()
