from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


@asynccontextmanager
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_async_session() as session:
        yield session


async def init_db() -> None:
    """Initialize PostgreSQL database schemas, pgvector extension, tables, and HNSW index.
    Fails explicitly if PostgreSQL is unavailable.
    """
    try:
        async with engine.begin() as conn:
            # 1. Enable pgvector extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

            # 2. Import models to register with Base.metadata
            from app.models.report import ResearchReport, ResearchSession, VectorEmbedding  # noqa
            from app.models.user import Account, Session, User, Verification  # noqa

            # 3. Create all tables
            await conn.run_sync(Base.metadata.create_all)

            # 4. Create HNSW index for VectorEmbedding cosine distance
            await conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS vector_embeddings_hnsw_idx ON vector_embeddings USING hnsw (embedding vector_cosine_ops);"
                )
            )

        print("[Database] PostgreSQL + pgvector database initialized successfully.")
    except Exception as err:
        print(f"[Database Critical Error] Failed to connect to or initialize PostgreSQL: {err}")
        raise RuntimeError(f"PostgreSQL initialization failed: {err}") from err

