"""
Router: language detection.
POST /api/v1/detect
"""
from fastapi import APIRouter, Depends

from app.dependencies import require_api_key
from app.schemas.translation import DetectRequest, DetectResponse
from app.services.detect_service import detect_language

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post(
    "/",
    response_model=DetectResponse,
    summary="Detect the language of a text",
    description=(
        "Analyses the supplied text and returns the most likely BCP-47 language "
        "code together with a confidence score (0–1)."
    ),
)
async def detect_endpoint(
    payload: DetectRequest,
    _: str = Depends(require_api_key),
) -> DetectResponse:
    result = await detect_language(payload.text)
    return DetectResponse(**result)
