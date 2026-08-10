from datetime import datetime
from fastapi import Cookie, Depends, Header, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import Session, User


async def get_current_user(
    authorization: str | None = Header(None, alias="Authorization"),
    cookie_token: str | None = Cookie(None, alias="better-auth.session_token"),
    secure_cookie_token: str | None = Cookie(None, alias="__Secure-better-auth.session_token"),
    session_token_header: str | None = Header(None, alias="X-Session-Token"),
    query_token: str | None = Query(None, alias="token"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate Better Auth session token against PostgreSQL and resolve current user identity."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
    elif cookie_token:
        token = cookie_token
    elif secure_cookie_token:
        token = secure_cookie_token
    elif session_token_header:
        token = session_token_header
    elif query_token:
        token = query_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing session token.",
        )

    tokens_to_check = [token]
    if "." in token:
        tokens_to_check.append(token.split(".")[0])

    # Query PostgreSQL session table created by Better Auth
    stmt = (
        select(Session)
        .options(selectinload(Session.user))
        .where(
            Session.token.in_(tokens_to_check),
            Session.expires_at > datetime.utcnow(),
        )
    )
    result = await db.execute(stmt)
    session_record = result.scalars().first()

    if not session_record or not session_record.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session.",
        )

    return session_record.user

