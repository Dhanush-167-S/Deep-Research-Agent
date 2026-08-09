
from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import generate_session_token, get_password_hash, verify_password
from app.models.user import Account, Session, User


class UserRepository:
    """PostgreSQL Repository for User, Session, and Account persistence."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def create(self, email: str, name: str | None = None, password: str | None = None) -> User:
        hashed_password = get_password_hash(password) if password else None
        user = User(
            email=email.lower(),
            name=name or email.split("@")[0].capitalize(),
            hashed_password=hashed_password,
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}",
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def verify_user_password(self, user: User, password: str) -> bool:
        if not user.hashed_password:
            return False
        return verify_password(password, user.hashed_password)

    async def create_session(self, user_id: str, days_valid: int = 7) -> Session:
        token = generate_session_token()
        expires_at = datetime.utcnow() + timedelta(days=days_valid)
        sess = Session(
            user_id=user_id,
            session_token=token,
            expires_at=expires_at,
        )
        self.db.add(sess)
        await self.db.flush()
        return sess

    async def get_session_by_token(self, token: str) -> Session | None:
        result = await self.db.execute(
            select(Session).where(Session.session_token == token, Session.expires_at > datetime.utcnow())
        )
        return result.scalars().first()

    async def delete_session_by_token(self, token: str) -> None:
        await self.db.execute(delete(Session).where(Session.session_token == token))
        await self.db.flush()

