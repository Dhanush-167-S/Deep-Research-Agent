import asyncio
from datetime import datetime, timedelta
import uuid

from fastapi import HTTPException
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import init_db, get_async_session
from app.models.user import User, Session, Account, Verification
from app.models.report import VectorEmbedding
from app.core.security import get_current_user
from app.services.rag import rag_service

async def test_auth_and_db():
    print("=== Testing Database Initialization & Schema ===")
    await init_db()
    
    async with get_async_session() as db:
        # 1. Test pgvector extension & HNSW index existence
        idx_res = await db.execute(
            text("SELECT indexname FROM pg_indexes WHERE indexname = 'vector_embeddings_hnsw_idx';")
        )
        hnsw_exists = idx_res.scalar() is not None
        print(f"[Verification] HNSW Index 'vector_embeddings_hnsw_idx' exists: {hnsw_exists}")
        assert hnsw_exists, "HNSW Index missing!"

        # 2. Test User & Session Creation in physical Better Auth tables
        test_user_id = f"usr_test_{uuid.uuid4().hex[:8]}"
        test_email = f"test_{uuid.uuid4().hex[:6]}@topresearch.ai"
        test_token = f"sess_token_{uuid.uuid4().hex[:16]}"

        user = User(
            id=test_user_id,
            name="TopResearch Scientist",
            email=test_email,
            email_verified=True,
        )
        db.add(user)
        await db.flush()

        sess = Session(
            id=f"sess_{uuid.uuid4().hex[:8]}",
            user_id=test_user_id,
            token=test_token,
            expires_at=datetime.utcnow() + timedelta(hours=24),
        )
        db.add(sess)
        await db.commit()
        print(f"[Verification] Persisted Better Auth user '{test_email}' and session token into PostgreSQL.")

        # 3. Test FastAPI Session Resolution via get_current_user
        resolved_user = await get_current_user(
            authorization=f"Bearer {test_token}",
            db=db
        )
        print(f"[Verification] Resolved user from session token: ID={resolved_user.id}, Email={resolved_user.email}")
        assert resolved_user.id == test_user_id, "User ID mismatch!"

        # 4. Test Invalid Session Rejection
        try:
            await get_current_user(authorization="Bearer invalid_token_12345", db=db)
            assert False, "Should have raised 401!"
        except HTTPException as err:
            print(f"[Verification] Rejected invalid session token cleanly: HTTP {err.status_code} - {err.detail}")

        # 5. Test RAG Hugging Face Embeddings & pgvector Cosine Search
        print("=== Testing RAG Hugging Face Embeddings & pgvector Similarity ===")
        from app.models.report import ResearchSession
        test_session_id = f"test_rag_session_{uuid.uuid4().hex[:6]}"
        res_session = ResearchSession(
            id=test_session_id,
            user_id=test_user_id,
            query="multi-agent research orchestrator",
            status="completed"
        )
        db.add(res_session)
        await db.flush()

        test_chunk = "LangGraph orchestrates multi-agent research workflows with stateful graph DAG execution."
        stored_ids = await rag_service.store_document_chunks(
            db=db,
            session_id=test_session_id,
            title="LangGraph Overview",
            url="https://langchain.com/langgraph",
            domain="langchain.com",
            source_type="academic",
            content=test_chunk,
            confidence_score=99.0
        )
        await db.commit()
        print(f"[Verification] Stored HF embedding in pgvector. Embedding IDs: {stored_ids}")

        results = await rag_service.vector_similarity_search(
            db=db,
            query="multi-agent research orchestrator",
            top_k=1
        )
        print(f"[Verification] pgvector Cosine Similarity Search Result: Top match content length = {len(results[0]['content'])} chars")
        print("=== ALL AUTH & PGVECTOR TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_auth_and_db())
