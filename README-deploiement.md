# README Deploiement

Guide de deploiement pour `wandireo-api` sur `tripanova.code-ai-insight.com`.

## Vue d'ensemble

Le repo contient deja:

- un `docker-compose.yml`
- un `docker/Dockerfile`
- une configuration Nginx dans `docker/nginx/wandireo.conf`
- un workflow GitHub Actions de deploiement dans
  `.github/workflows/deploy.yml`

Le deploiement cible est donc base sur Docker, avec:

- application PHP/Laravel
- Nginx
- PostgreSQL
- Redis
- worker queue supervise dans `app` via `supervisord`

## Services Docker fournis

Le `docker-compose.yml` definit:

- `app`
- `nginx`
- `postgres`
- `redis`
- `queue`
- `vite` en profil `dev`

Le deploiement public sur `tripanova.code-ai-insight.com` s'appuie sur
`docker-compose.edge.yml`, qui ajoute:

- `proxy` Nginx edge sur `80/443`
- `certbot` pour le renouvellement TLS

## Variables d'environnement critiques

Verifier avant tout deploiement:

- `APP_ENV`
- `APP_DEBUG`
- `APP_URL`
- `APP_KEY`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_PASSWORD`
- `CACHE_STORE`
- `SESSION_DRIVER`
- `QUEUE_CONNECTION`
- `SANCTUM_STATEFUL_DOMAINS`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_API_BASE_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `SENTRY_LARAVEL_DSN`
- `VITE_SENTRY_DSN`

Ne jamais deployer avec les valeurs d'exemple en production.

Pour la mise en ligne cible `tripanova.code-ai-insight.com`, verifier au minimum:

- `APP_URL=https://tripanova.code-ai-insight.com`
- `VITE_API_BASE_URL=https://tripanova.code-ai-insight.com/api`
- `SANCTUM_STATEFUL_DOMAINS=tripanova.code-ai-insight.com`

## Build local de reference

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

## Deploiement avec Docker Compose

### 1. Preparation

```bash
cp .env.example .env
```

Puis renseigner les variables de production.

### 2. Build et demarrage

```bash
docker compose -f docker-compose.yml -f docker-compose.edge.yml up -d --build
```

### 3. Migration et caches

```bash
docker compose exec -T app php artisan migrate --force
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache
docker compose exec -T app php artisan event:cache
```

## Workflow GitHub Actions existant

Le workflow `.github/workflows/deploy.yml` fait deja:

- checkout du repo
- build Docker complet
- connexion SSH au serveur
- `git pull`
- `docker compose up -d --build --remove-orphans`
- `php artisan migrate --force`
- regeneration des caches Laravel

Secrets attendus par ce workflow:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `VITE_API_BASE_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Checklist de mise en production

- retirer le vhost / reverse proxy Booking de `tripanova.code-ai-insight.com`
- pointer `tripanova.code-ai-insight.com` vers la stack Wandireo
- activer HTTPS et la redirection HTTP vers HTTPS
- definir `APP_ENV=production`
- definir `APP_DEBUG=false`
- configurer une vraie `APP_KEY`
- configurer PostgreSQL et Redis de production
- verifier les domaines Sanctum
- verifier les cles Stripe
- verifier les DSN Sentry si monitoring actif
- lancer les migrations
- publier les assets frontend
- verifier la file de queue
- verifier les ecritures sur `storage/` et `bootstrap/cache/`

## Post-deploiement

Verifier au minimum:

- home publique
- `/recherche`
- detail service
- `/connexion`
- `/blog`
- `/guide`
- `/admin`
- creation / edition service
- blog admin
- support admin

## Notes d'exploitation

- si les redirections ou les vues semblent incoherentes, lancer
  `php artisan optimize:clear`
- l'environnement local peut utiliser un cache sans support des tags;
  ne pas reintroduire de dependance forte a `Cache::tags(...)`
- le worker queue doit tourner en permanence en production

## References

- [README.md](README.md)
- [README-developpeur.md](README-developpeur.md)
- [README-produit.md](README-produit.md)
