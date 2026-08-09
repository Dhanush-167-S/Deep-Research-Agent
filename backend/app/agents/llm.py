from app.agents.llm_provider import ResilientLLMProvider


def get_llm(model_name: str | None = None, temperature: float = 0.2) -> ResilientLLMProvider:
    """Instantiate resilient LLM provider with Google Gemini primary and Groq fallback."""
    return ResilientLLMProvider(primary_model=model_name)

