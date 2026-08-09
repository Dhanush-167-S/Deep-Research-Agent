from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.exporter import exporter
from app.services.reports import report_service

router = APIRouter()


@router.get("/history", summary="Get authenticated user research sessions history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    history = await report_service.get_user_history(db, current_user.id)
    return {"status": "success", "history": history}


@router.get("/{report_id}", summary="Get research report by ID")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report_by_id(db, report_id, user_id=current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")
    return {"status": "success", "report": report}


@router.get("/{report_id}/export/markdown", summary="Export report as raw Markdown file")
async def export_markdown(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report_by_id(db, report_id, user_id=current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")

    formatted_md = exporter.format_markdown(
        title=report["title"],
        markdown_content=report["content_markdown"],
        metadata=report,
    )

    return PlainTextResponse(
        content=formatted_md,
        headers={"Content-Disposition": f'attachment; filename="{report_id}.md"'},
    )


@router.get("/{report_id}/export/pdf", summary="Export report as PDF document")
async def export_pdf(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report_by_id(db, report_id, user_id=current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")

    pdf_bytes = exporter.generate_pdf_bytes(
        title=report["title"],
        markdown_content=report["content_markdown"],
        metadata=report,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{report_id}.pdf"'},
    )


@router.delete("/{report_id}", summary="Delete research session and report")
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await report_service.delete_report(db, report_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")
    return {"status": "success", "message": "Report deleted successfully."}

