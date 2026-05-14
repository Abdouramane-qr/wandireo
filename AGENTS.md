# Repository Guidelines

## Project Structure & Module Organization
`wandireo-api` is a Laravel 13 application with an Inertia/React frontend. Backend code lives mainly in `app/` (`Http/Controllers`, `Http/Middleware`, `Models`, `Services`, `Support`, `Actions`, `Concerns`, `Providers`, `Http/Requests`, `Http/Responses`). Frontend code lives in `resources/js/` (`pages/`, `components/`, `layouts/`, `hooks/`, `api/`, `routes/`, `types/`, `lib/`, `context/`, `translations/`, `mocks/`, `actions/`), with styles in `resources/css/` and `resources/js/styles/`. Routes are split across `routes/web.php`, `routes/api.php`, `routes/settings.php`, and `routes/console.php`. Database migrations, factories, and seeders are in `database/`. Feature and unit tests belong in `tests/`.

## External Booking Architecture
Services with `source_type=EXTERNAL` must be treated as stock-owning partner integrations, not as local-only catalog records. The current write path uses:

- `App\Services\ExternalBookings\ExternalBookingService`
- `App\Services\ExternalBookings\ExternalBookingGatewayRegistry`
- one `ExternalBookingGateway` implementation per provider

Current concrete provider support in the codebase is `FareHarbor`, but the product rule is broader: every external stock provider must be wired through this generic orchestration. Do not confirm a local booking for an external service until partner-side booking creation succeeds.

Bookings now expose dedicated external traceability fields:

- `external_booking_reference`
- `external_booking_status`
- `external_booking_payload`
- `external_error_message`

Do not hide critical external identifiers only inside `extra_data` when a dedicated column exists.

## Build, Test, and Development Commands
Use the existing project scripts instead of ad hoc commands:

- `composer run setup` installs PHP/JS dependencies, creates `.env`, generates the app key, runs migrations, and builds assets.
- `composer run ci:check` runs the frontend lint/format/type checks, then the PHP test flow.
- `composer run dev` starts the Laravel server, queue listener, and Vite dev server together.
- `composer test` clears config, runs Pint in check mode, then executes the Laravel test suite.
- `composer lint` / `composer lint:check` format or check PHP code with Laravel Pint.
- `npm run lint:check`, `npm run format:check`, `npm run types:check` validate the frontend.
- `npm run build` creates the production Vite bundle in `public/build/`, and `npm run build:ssr` also builds the SSR bundle.

When using Docker, note that `docker compose` builds a production-style `app` image that does not include dev-only PHP tools like `phpunit`. For targeted PHPUnit runs in Docker, use a temporary container with the local workspace mounted:

- `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/StripeCheckoutTest.php`

## Coding Style & Naming Conventions
Follow `.editorconfig`: UTF-8, LF endings, 4 spaces by default, and 2 spaces for YAML while Markdown keeps trailing whitespace when needed. PHP should follow Laravel conventions and PSR-4 namespaces under `App\\...`; run Pint before opening a PR. React and TypeScript files should stay under `resources/js/`, use PascalCase for components (`BookingSummary.tsx`), and keep hooks camelCase with a `use` prefix (`useTranslation.tsx`). Let ESLint and Prettier drive formatting instead of manual style tweaks.

## Testing Guidelines
PHPUnit is configured in `phpunit.xml`; tests are organized under `tests/Feature` and `tests/Unit`, with feature coverage currently including auth, settings, API, pricing, analytics, SEO, Stripe checkout, and FareHarbor/external-booking flows. Name tests with the subject under test plus `Test.php` (for example, `FareHarborIntegrationTest.php` or `ExternalBookingServiceTest.php`). Local tests default to in-memory SQLite, while CI also runs migrations and tests against PostgreSQL 16, so avoid SQLite-only assumptions.

When touching external booking or payment finalization logic, cover both:

- webhook/payment flow behavior (`tests/Feature/StripeCheckoutTest.php`)
- provider-agnostic orchestration behavior (`tests/Feature/ExternalBookingServiceTest.php`)

Minimum scenarios expected for external stock work:

- successful partner booking creation after Stripe webhook
- partner booking failure with compensating refund path
- idempotence when Stripe retries the same webhook
- session status API exposure for frontend polling
- unsupported external provider failure path

Be careful with schema differences in tests: some SQLite migrations/fixtures may still require non-null `partner_id` on `bookings`, even when a production flow eventually supports nullable partner links elsewhere.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects, often with optional scopes such as `feat(blog, support, home): improve blog editor...` or `fix: resolve CSP style blocks...`. Keep commits focused and descriptive. PRs should include a concise summary, note any migration or env changes, link the related issue when applicable, and attach screenshots for UI changes. Before requesting review, run `composer test` and preferably `composer run ci:check` for the full cross-stack check set.

## Security & Configuration Tips
Use `.env.example` as the template and never commit secrets. Treat keys such as `APP_KEY`, database credentials, Stripe keys, Sentry DSNs, FareHarbor credentials, and GeoIP-related configuration as sensitive. For local cleanup after config or env changes, use `php artisan optimize:clear`.

Stripe and external booking changes are financially sensitive. For these paths:

- keep webhook handling idempotent
- prefer explicit audit fields over opaque blobs
- do not mark external bookings confirmed before provider confirmation
- preserve refund/error traces for support and admin workflows
