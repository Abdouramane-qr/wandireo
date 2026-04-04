#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose -f docker-compose.yml -f docker-compose.edge.yml run --rm certbot renew --webroot -w /var/www/certbot
docker compose -f docker-compose.yml -f docker-compose.edge.yml exec proxy nginx -s reload

echo "Certificate renewal check completed."
