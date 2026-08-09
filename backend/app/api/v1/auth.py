from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/me", summary="Get current authenticated user profile from Better Auth session")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return user profile resolved from the active Better Auth session in PostgreSQL."""
    return {
        "id": current_user.id,
        "name": current_user.name or current_user.email.split("@")[0],
        "email": current_user.email,
        "avatar_url": current_user.image,
        "role": "Senior Research Scientist",
        "plan": "Pro AI Operating System",
    }
