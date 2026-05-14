"""
Translation service using deep-translator (GoogleTranslator backend).

deep-translator's GoogleTranslator performs HTTP requests synchronously.
All calls are offloaded to a thread pool via asyncio.to_thread to avoid
blocking the FastAPI event loop.
"""
import asyncio

from deep_translator import GoogleTranslator
from deep_translator.exceptions import (
    LanguageNotSupportedException,
    RequestError,
    TooManyRequests,
    TranslationNotFound,
)
from fastapi import HTTPException, status


def _sync_translate(text: str, source: str, target: str) -> dict:
    """Synchronous translation — runs inside a thread pool worker."""
    try:
        translator = GoogleTranslator(source=source, target=target)
        translated = translator.translate(text)

        if not translated:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The translation service returned an empty result.",
            )

        return {
            "translated_text": translated,
            "source_language": source,
            "target_language": target,
        }

    except LanguageNotSupportedException as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language code: {exc}",
        ) from exc

    except TranslationNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Translation not found: {exc}",
        ) from exc

    except TooManyRequests as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Translation quota exceeded. Please retry later.",
        ) from exc

    except RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Upstream translation service error: {exc}",
        ) from exc


async def translate_text(text: str, source_language: str, target_language: str) -> dict:
    """Async wrapper — delegates blocking HTTP work to a thread pool."""
    return await asyncio.to_thread(_sync_translate, text, source_language, target_language)
