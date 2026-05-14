# =============================================================================
# Stage 1 – compile pinned requirements from requirements.in
# =============================================================================
FROM python:3.12.13-slim AS compiler

WORKDIR /build

# Install pip-tools (used only during build, not shipped in the final image)
RUN pip install --no-cache-dir pip-tools

COPY requirements.in .

# Generate a fully-pinned requirements.txt from the abstract requirements.in
RUN pip-compile requirements.in --output-file requirements.txt --no-header --quiet

# =============================================================================
# Stage 2 – runtime image
# =============================================================================
FROM python:3.12.13-slim AS runtime

# Keeps Python from writing .pyc files and enables stdout/stderr flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy compiled requirements from the compiler stage
COPY --from=compiler /build/requirements.txt .

# Install runtime dependencies (no build tools shipped)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app/ ./app/

EXPOSE 8900

# Run the ASGI server with a single worker by default.
# Scale horizontally via docker-compose replicas rather than increasing workers.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8900", "--workers", "1"]
