"""
Router: text translation.
POST /api/v1/translate
"""
from fastapi import APIRouter, Depends

from app.dependencies import require_api_key
from app.schemas.translation import TranslateRequest, TranslateResponse
from app.services.translate_service import translate_text

router = APIRouter(prefix="/translate", tags=["Translation"])


@router.post(
    "/",
    response_model=TranslateResponse,
    summary="Translate a text to a target language",
    description=(
        "Translates the supplied text from `source_language` to `target_language`. "
        "Use `'auto'` as `source_language` to let the service detect it automatically."
    ),
)
async def translate_endpoint(
    payload: TranslateRequest,
    _: str = Depends(require_api_key),
) -> TranslateResponse:
    result = await translate_text(
        text=payload.text,
        source_language=payload.source_language,
        target_language=payload.target_language,
    )
    return TranslateResponse(**result)
