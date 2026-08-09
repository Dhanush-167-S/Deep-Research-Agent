from fastapi import APIRouter

from app.api.v1 import auth, health, reports, research

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(research.router, prefix="/research", tags=["Research"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & History"])
