from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.report import ResearchReport, ResearchSession


class ReportRepository:
    """PostgreSQL Repository for ResearchSession and ResearchReport persistence."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, session_id: str, user_id: str, query: str) -> ResearchSession:
        session = ResearchSession(
            id=session_id,
            user_id=user_id,
            query=query,
            status="initialized",
            confidence_score=98.4,
            sources_count=0,
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_session(self, session_id: str) -> ResearchSession | None:
        result = await self.db.execute(
            select(ResearchSession).options(selectinload(ResearchSession.report)).where(ResearchSession.id == session_id)
        )
        return result.scalars().first()

    async def update_session_status(self, session_id: str, status: str, confidence_score: float, sources_count: int):
        session = await self.get_session(session_id)
        if session:
            session.status = status
            session.confidence_score = confidence_score
            session.sources_count = sources_count
            await self.db.flush()

    async def create_or_update_report(
        self, session_id: str, title: str, content_markdown: str, citations_data: dict[str, Any] | None = None
    ) -> ResearchReport:
        result = await self.db.execute(
            select(ResearchReport).where(ResearchReport.session_id == session_id)
        )
        existing = result.scalars().first()

        if existing:
            existing.title = title
            existing.content_markdown = content_markdown
            existing.citations_data = citations_data
            report = existing
        else:
            report = ResearchReport(
                session_id=session_id,
                title=title,
                content_markdown=content_markdown,
                citations_data=citations_data,
            )
            self.db.add(report)

        await self.db.flush()
        return report

    async def get_user_history(self, user_id: str) -> list[dict[str, Any]]:
        query = (
            select(ResearchSession)
            .options(selectinload(ResearchSession.report))
            .where(ResearchSession.user_id == user_id)
            .order_by(ResearchSession.created_at.desc())
        )
        result = await self.db.execute(query)
        sessions = result.scalars().all()

        history = []
        for s in sessions:
            history.append({
                "id": s.report.id if s.report else f"rep_{s.id}",
                "session_id": s.id,
                "user_id": s.user_id,
                "query": s.query,
                "title": s.report.title if s.report else s.query,
                "content_markdown": s.report.content_markdown if s.report else "",
                "sources_count": s.sources_count,
                "confidence_score": s.confidence_score,
                "created_at": s.created_at.isoformat() if s.created_at else "",
            })
        return history

    async def get_report_by_id(self, report_id: str, user_id: str | None = None) -> dict[str, Any] | None:
        # Check by report_id first
        stmt = (
            select(ResearchReport)
            .options(selectinload(ResearchReport.session))
            .where(ResearchReport.id == report_id)
        )
        result = await self.db.execute(stmt)
        report = result.scalars().first()

        if not report:
            # Try finding by session_id
            stmt = (
                select(ResearchReport)
                .options(selectinload(ResearchReport.session))
                .where(ResearchReport.session_id == report_id)
            )
            result = await self.db.execute(stmt)
            report = result.scalars().first()

        if not report or not report.session:
            return None

        # Authorize resource ownership
        if user_id and report.session.user_id != user_id:
            return None

        return {
            "id": report.id,
            "session_id": report.session_id,
            "user_id": report.session.user_id,
            "query": report.session.query,
            "title": report.title,
            "content_markdown": report.content_markdown,
            "sources_count": report.session.sources_count,
            "confidence_score": report.session.confidence_score,
            "created_at": report.created_at.isoformat() if report.created_at else "",
        }

    async def delete_report(self, report_id: str, user_id: str | None = None) -> bool:
        report = await self.get_report_by_id(report_id, user_id=user_id)
        if not report:
            return False
        await self.db.execute(delete(ResearchReport).where(ResearchReport.id == report["id"]))
        await self.db.flush()
        return True

