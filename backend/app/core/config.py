from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TopResearch"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "topresearch_super_secret_production_key_change_me_32chars!"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    POSTGRES_USER: str = "topresearch"
    POSTGRES_PASSWORD: str = "topresearch_pass"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "topresearch_db"
    DATABASE_URL: str = "postgresql+asyncpg://topresearch:topresearch_pass@localhost:5432/topresearch_db"

    # LLM Providers (Google Gemini Primary, Groq Fallback)
    DEFAULT_LLM_PROVIDER: str = "gemini"
    DEFAULT_MODEL_NAME: str = "gemini-3.1-flash-lite-preview"
    GROQ_MODEL_NAME: str = "llama-3.3-70b-versatile"



    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # Web Search Provider (Tavily ONLY)
    TAVILY_API_KEY: str = ""

    # Embedding Model (Hugging Face Inference API)
    HF_TOKEN: str = ""
    HF_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # Auth & OAuth Configuration (Better Auth + Google OAuth 2.0)
    BETTER_AUTH_SECRET: str = "topresearch_better_auth_secret_key_32chars_min!"
    BETTER_AUTH_URL: str = "http://localhost:3000"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

