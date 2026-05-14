# ---------------------------------------------------------------------------
# Developer helpers
# ---------------------------------------------------------------------------
.PHONY: compile install run build up down logs

## Regenerate the pinned requirements.txt from requirements.in
compile:
	pip-compile requirements.in --output-file requirements.txt --no-header

## Install dependencies locally (development)
install:
	pip install pip-tools
	pip-compile requirements.in --output-file requirements.txt --no-header --quiet
	pip install -r requirements.txt

## Run the API locally (requires .env to be present)
run:
	uvicorn app.main:app --host 0.0.0.0 --port 8900 --reload

## Build the Docker image
build:
	docker compose build

## Start the service with Docker Compose
up:
	docker compose up -d

## Stop and remove containers
down:
	docker compose down

## Tail container logs
logs:
	docker compose logs -f translator-api
