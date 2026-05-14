"""
Language detection service using langdetect.

langdetect is inherently non-deterministic; DetectorFactory.seed = 0 ensures
reproducible results across calls with the same input.
The blocking I/O is offloaded to a thread pool via asyncio.to_thread so the
FastAPI event loop is never blocked.
"""
import asyncio
from functools import lru_cache

from langdetect import DetectorFactory, detect_langs
from langdetect.lang_detect_exception import LangDetectException
from fastapi import HTTPException, status

# Seed for reproducibility (must be set before any detection call)
DetectorFactory.seed = 0


def _sync_detect(text: str) -> dict:
    """Synchronous detection — runs inside a thread pool worker."""
    try:
        results = detect_langs(text)
        top = results[0]
        return {
            "language": top.lang,
            "confidence": round(top.prob, 4),
        }
    except LangDetectException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Language detection failed: {exc}",
        ) from exc


async def detect_language(text: str) -> dict:
    """Async wrapper — delegates blocking work to a thread pool."""
    return await asyncio.to_thread(_sync_detect, text)
