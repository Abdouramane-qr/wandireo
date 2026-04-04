# README Developpeur

Documentation technique pour contribuer a `wandireo-api`.

## Vue d'ensemble

`wandireo-api` est l'application principale Wandireo. Elle combine:

- Laravel 13 cote backend
- Inertia.js pour l'orchestration web
- React 19 + TypeScript cote UI
- Redis pour cache, queue et session dans la configuration cible
- PostgreSQL comme base principale

## Stack

- PHP 8.4
- Laravel 13
- Inertia.js
- React 19
- TypeScript
- Vite
- React Query
- Laravel Fortify
- Laravel Sanctum
- Stripe
- Sentry
- PostgreSQL
- Redis / Predis

## Architecture utile

```text
app/                        # controllers, models, services, middleware
bootstrap/                  # bootstrap Laravel
config/                     # configuration framework et app
database/                   # migrations, seeders, factories
docker/                     # Dockerfile + conf nginx/php
public/                     # entrypoint web + assets publies
resources/js/api/           # client API frontend
resources/js/components/wdr/# composants UI Wandireo
resources/js/context/       # auth, user, booking, appearance
resources/js/hooks/         # data hooks, routing, i18n
resources/js/lib/           # adapters et normalizers
resources/js/pages/         # pages Inertia
resources/js/pages/wdr-pages/
                            # ecrans produit Wandireo
resources/js/styles/        # theme global et styles transverses
routes/                     # web.php, api.php, settings.php
tests/                      # tests Laravel
```

## Branding technique

Le design system applicatif s'appuie sur:

- `resources/js/styles/wdr-theme.css`
- `resources/js/components/wdr/WdrPageShell.tsx`
- `resources/js/hooks/useTranslation.tsx`
- `resources/js/hooks/use-appearance.tsx`

Les couleurs de reference suivent le branding Wandireo:

- primaire: turquoise / bleu lagon
- accent: orange solaire
- dark surfaces: bleu profond plutot qu'un noir neutre

## Installation locale

### Prerequis

- PHP 8.4+
- Composer
- Node.js 20+
- npm
- PostgreSQL
- Redis

### Setup manuel

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### Setup automatise

```bash
composer run setup
```

### Lancement

```bash
composer run dev
```

Cette commande lance:

- `php artisan serve`
- `php artisan queue:listen --tries=1`
- `npm run dev`

## Variables d'environnement

Verifier au minimum:

- `APP_URL`
- `APP_ENV`
- `APP_DEBUG`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `SESSION_DRIVER`
- `CACHE_STORE`
- `QUEUE_CONNECTION`
- `VITE_API_BASE_URL`

Variables sensibles a ne jamais exposer:

- `APP_KEY`
- `DB_PASSWORD`
- `REDIS_PASSWORD`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `SENTRY_LARAVEL_DSN`
- `VITE_SENTRY_DSN`

## Scripts utiles

### Backend

```bash
composer run dev
composer run setup
composer test
composer lint
composer lint:check
php artisan migrate
php artisan optimize:clear
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run lint:check
npm run format
npm run format:check
npm run types:check
```

## Routes et APIs importantes

### Web

- `/`
- `/recherche`
- `/services/{id}`
- `/blog`
- `/guide`
- `/connexion`
- `/inscription`
- `/mon-espace`
- `/partenaire`
- `/admin`

### API publiques

- `GET /api/services`
- `GET /api/services/{id}`
- `GET /api/blog/posts`
- `GET /api/blog/posts/{slug}`
- `GET /api/reviews`
- `GET /api/availability`
- `GET /api/service-structure`

### API authentifiees

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/bookings/mine`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/{serviceId}`

### API admin

- `GET /api/support/tickets`
- `POST /api/support/tickets`
- `PATCH /api/support/tickets/{id}`
- `POST /api/blog/posts`
- `PATCH /api/blog/posts/{id}`
- `DELETE /api/blog/posts/{id}`
- `GET /api/blog/posts/by-id/{id}`

## Points techniques importants

### Recherche

- route unique `/recherche`
- segmentation UI par verticales
- compatibilite avec `q`, `category`, `dateFrom`, `dateTo`

### Services

- upload local Laravel stabilise
- edition pre-remplie cote formulaire
- creation admin possible sans partenaire obligatoire

### Blog

- lecture publique par slug
- edition admin par id
- invalidation cache compatible avec l'environnement local

### Theme et i18n

- theme `light / dark / system`
- couche i18n frontend centralisee
- attention aux textes encore hardcodes dans les ecrans secondaires

## Workflow recommande avant livraison

```bash
npm run types:check
npm run lint:check
npm run format:check
composer lint:check
php artisan test
```

Retests manuels recommandes:

- recherche publique
- inscription / connexion
- creation / edition service
- blog admin / public
- support admin
- affichage light / dark / system

## References

- [README.md](README.md)
- [README-produit.md](README-produit.md)
- [README-deploiement.md](README-deploiement.md)
