"""
FastAPI application factory and entry point.

Startup order:
  1. Load settings from .env
  2. Register routers under /api/v1
  3. Expose /health for liveness probes
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import detect, translate

# ---------------------------------------------------------------------------
# Application instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "REST API for **language detection** and **text translation** powered by "
        "Google Translate (via deep-translator) and langdetect."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Restrict in production as needed
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

API_PREFIX = "/api/v1"

app.include_router(detect.router, prefix=API_PREFIX)
app.include_router(translate.router, prefix=API_PREFIX)

# ---------------------------------------------------------------------------
# Health check — no authentication required
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"], summary="Liveness probe")
async def health() -> dict:
    """Returns 200 OK when the service is running."""
    return {"status": "ok", "version": settings.APP_VERSION}
