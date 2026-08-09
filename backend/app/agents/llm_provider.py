import asyncio
import os
from abc import ABC, abstractmethod
from typing import Any

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from app.core.config import settings


def _unwrap_llm_response(res: Any) -> Any:
    """Ensure LLM response .content is always a clean string, unwrapping list of content blocks if present."""
    if hasattr(res, "content"):
        content = res.content
        if isinstance(content, list):
            text_parts = []
            for block in content:
                if isinstance(block, str):
                    text_parts.append(block)
                elif isinstance(block, dict) and "text" in block:
                    text_parts.append(block["text"])
            res.content = "\n".join(text_parts).strip()
        elif isinstance(content, str):
            res.content = content.strip()
    return res


class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Providers."""

    @abstractmethod
    async def invoke(self, messages: list[tuple[str, str] | BaseMessage], temperature: float = 0.2) -> Any:
        pass


class GeminiProvider(BaseLLMProvider):
    """Primary LLM Provider using Google Gemini (gemini-3.1-flash-lite-preview)."""

    def __init__(self, model_name: str | None = None):
        self.model_name = model_name or settings.DEFAULT_MODEL_NAME

    def _get_llm(self, temperature: float):
        api_key = (
            settings.GEMINI_API_KEY
            or os.getenv("GEMINI_API_KEY")
            or settings.GOOGLE_API_KEY
            or os.getenv("GOOGLE_API_KEY")
        )
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing!")

        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=self.model_name if "gemini" in self.model_name else "gemini-3.1-flash-lite-preview",
            google_api_key=api_key,
            temperature=temperature,
            max_output_tokens=8192,
        )

    async def invoke(self, messages: list[tuple[str, str] | BaseMessage], temperature: float = 0.2) -> Any:
        llm = self._get_llm(temperature)
        raw_res = await llm.ainvoke(messages)
        return _unwrap_llm_response(raw_res)


class GroqProvider(BaseLLMProvider):
    """Fallback LLM Provider using Groq API."""

    def __init__(self, model_name: str | None = None):
        self.model_name = model_name or settings.GROQ_MODEL_NAME

    def _get_llm(self, temperature: float):
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing!")

        from langchain_groq import ChatGroq

        return ChatGroq(
            model=self.model_name,
            groq_api_key=api_key,
            temperature=temperature,
            max_tokens=8192,
        )


    async def invoke(self, messages: list[tuple[str, str] | BaseMessage], temperature: float = 0.2) -> Any:
        llm = self._get_llm(temperature)
        raw_res = await llm.ainvoke(messages)
        return _unwrap_llm_response(raw_res)


class ResilientLLMProvider(BaseLLMProvider):
    """Resilient LLM Provider executing Gemini primary with bounded retries and Groq fallback."""

    def __init__(
        self,
        primary_model: str | None = None,
        fallback_model: str | None = None,
        max_retries: int = 2,
    ):
        self.primary = GeminiProvider(primary_model)
        self.fallback = GroqProvider(fallback_model)
        self.max_retries = max_retries

    async def invoke(self, messages: list[tuple[str, str] | BaseMessage], temperature: float = 0.2) -> Any:
        last_exception = None

        # 1. Attempt Primary (Gemini) with bounded retry policy
        for attempt in range(1, self.max_retries + 1):
            try:
                res = await self.primary.invoke(messages, temperature=temperature)
                return _unwrap_llm_response(res)
            except Exception as e:
                last_exception = e
                print(f"[LLM Provider] Gemini primary attempt {attempt}/{self.max_retries} failed: {e}")
                if attempt < self.max_retries:
                    await asyncio.sleep(1.0 * attempt)

        # 2. Attempt Fallback (Groq) if Gemini fails completely
        print("[LLM Provider] Primary Gemini attempts exhausted. Switching to Groq fallback...")
        try:
            res = await self.fallback.invoke(messages, temperature=temperature)
            return _unwrap_llm_response(res)
        except Exception as groq_err:
            print(f"[LLM Provider] Groq fallback failed: {groq_err}")
            raise RuntimeError(
                f"LLM Provider invocation failed! Gemini error: {last_exception}. Groq error: {groq_err}"
            ) from groq_err


def get_resilient_llm(temperature: float = 0.2) -> ResilientLLMProvider:
    return ResilientLLMProvider()

