"""
Pydantic request/response models for language detection and translation endpoints.
"""
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

class DetectRequest(BaseModel):
    """Payload for the /detect endpoint."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5_000,
        description="Text whose language should be detected.",
        examples=["Hello, how are you?"],
    )


class DetectResponse(BaseModel):
    """Response returned by the /detect endpoint."""

    language: str = Field(description="BCP-47 language code (e.g. 'en', 'fr').")
    confidence: float = Field(description="Detection confidence score between 0 and 1.")


# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------

class TranslateRequest(BaseModel):
    """Payload for the /translate endpoint."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5_000,
        description="Text to translate.",
        examples=["Hello, how are you?"],
    )
    source_language: str = Field(
        ...,
        description="Source language code (e.g. 'en'). Use 'auto' for automatic detection.",
        examples=["en"],
    )
    target_language: str = Field(
        ...,
        description="Target language code (e.g. 'fr').",
        examples=["fr"],
    )


class TranslateResponse(BaseModel):
    """Response returned by the /translate endpoint."""

    translated_text: str = Field(description="Translated text.")
    source_language: str = Field(description="Source language code that was used.")
    target_language: str = Field(description="Target language code that was used.")
