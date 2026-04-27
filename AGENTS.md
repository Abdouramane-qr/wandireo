# Repository Guidelines

## Project Structure & Module Organization
`wandireo-api` is a Laravel 13 application with an Inertia/React frontend. Backend code lives mainly in `app/` (`Http/Controllers`, `Http/Middleware`, `Models`, `Services`, `Support`, `Actions`, `Concerns`, `Providers`, `Http/Requests`, `Http/Responses`). Frontend code lives in `resources/js/` (`pages/`, `components/`, `layouts/`, `hooks/`, `api/`, `routes/`, `types/`, `lib/`, `context/`, `translations/`, `mocks/`, `actions/`), with styles in `resources/css/` and `resources/js/styles/`. Routes are split across `routes/web.php`, `routes/api.php`, `routes/settings.php`, and `routes/console.php`. Database migrations, factories, and seeders are in `database/`. Feature and unit tests belong in `tests/`.

## Build, Test, and Development Commands
Use the existing project scripts instead of ad hoc commands:

- `composer run setup` installs PHP/JS dependencies, creates `.env`, generates the app key, runs migrations, and builds assets.
- `composer run ci:check` runs the frontend lint/format/type checks, then the PHP test flow.
- `composer run dev` starts the Laravel server, queue listener, and Vite dev server together.
- `composer test` clears config, runs Pint in check mode, then executes the Laravel test suite.
- `composer lint` / `composer lint:check` format or check PHP code with Laravel Pint.
- `npm run lint:check`, `npm run format:check`, `npm run types:check` validate the frontend.
- `npm run build` creates the production Vite bundle in `public/build/`, and `npm run build:ssr` also builds the SSR bundle.

## Coding Style & Naming Conventions
Follow `.editorconfig`: UTF-8, LF endings, 4 spaces by default, and 2 spaces for YAML while Markdown keeps trailing whitespace when needed. PHP should follow Laravel conventions and PSR-4 namespaces under `App\\...`; run Pint before opening a PR. React and TypeScript files should stay under `resources/js/`, use PascalCase for components (`BookingSummary.tsx`), and keep hooks camelCase with a `use` prefix (`useTranslation.tsx`). Let ESLint and Prettier drive formatting instead of manual style tweaks.

## Testing Guidelines
PHPUnit is configured in `phpunit.xml`; tests are organized under `tests/Feature` and `tests/Unit`, with feature coverage currently including auth, settings, API, pricing, analytics, SEO, and FareHarbor flows. Name tests with the subject under test plus `Test.php` (for example, `FareHarborIntegrationTest.php`). Local tests default to in-memory SQLite, while CI also runs migrations and tests against PostgreSQL 16, so avoid SQLite-only assumptions.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects, often with optional scopes such as `feat(blog, support, home): improve blog editor...` or `fix: resolve CSP style blocks...`. Keep commits focused and descriptive. PRs should include a concise summary, note any migration or env changes, link the related issue when applicable, and attach screenshots for UI changes. Before requesting review, run `composer test` and preferably `composer run ci:check` for the full cross-stack check set.

## Security & Configuration Tips
Use `.env.example` as the template and never commit secrets. Treat keys such as `APP_KEY`, database credentials, Stripe keys, Sentry DSNs, FareHarbor credentials, and GeoIP-related configuration as sensitive. For local cleanup after config or env changes, use `php artisan optimize:clear`.
