# Repository Guidelines

## Project Structure & Module Organization
`wandireo-api` is a Laravel 13 application with an Inertia/React frontend. Backend code lives in `app/` (`Http/Controllers`, `Models`, `Services`, `Support`). Frontend code lives in `resources/js/` (`pages/`, `components/`, `hooks/`, `api/`, `translations/`), with styles in `resources/css/` and `resources/js/styles/`. Routes are split across `routes/web.php`, `routes/api.php`, and `routes/settings.php`. Database migrations, factories, and seeders are in `database/`. Feature and unit tests belong in `tests/`.

## Build, Test, and Development Commands
Use the existing project scripts instead of ad hoc commands:

- `composer run setup` installs PHP/JS dependencies, creates `.env`, generates the app key, runs migrations, and builds assets.
- `composer run dev` starts the Laravel server, queue listener, and Vite dev server together.
- `composer test` clears config, runs Pint in check mode, then executes the Laravel test suite.
- `composer lint` / `composer lint:check` format or check PHP code with Laravel Pint.
- `npm run lint:check`, `npm run format:check`, `npm run types:check` validate the frontend.
- `npm run build` creates the production Vite bundle in `public/build/`.

## Coding Style & Naming Conventions
Follow `.editorconfig`: UTF-8, LF endings, 4 spaces by default, and 2 spaces for YAML. PHP should follow Laravel conventions and PSR-4 namespaces under `App\\...`; run Pint before opening a PR. React and TypeScript files should stay under `resources/js/`, use PascalCase for components (`BookingSummary.tsx`), and keep hooks camelCase with a `use` prefix (`useTranslation.tsx`). Let ESLint and Prettier drive formatting instead of manual style tweaks.

## Testing Guidelines
PHPUnit is configured in `phpunit.xml`; tests are organized under `tests/Feature` and `tests/Unit`. Name tests with the subject under test plus `Test.php` (for example, `FareHarborIntegrationTest.php`). Local tests default to in-memory SQLite, while CI also runs migrations and tests against PostgreSQL 16, so avoid SQLite-only assumptions.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects such as `Fix CI/CD workflows` and `Add project files`. Keep commits focused and descriptive. PRs should include a concise summary, note any migration or env changes, link the related issue when applicable, and attach screenshots for UI changes. Before requesting review, run `composer test`, `npm run lint:check`, `npm run format:check`, and `npm run types:check`.

## Security & Configuration Tips
Use `.env.example` as the template and never commit secrets. Treat keys such as `APP_KEY`, database credentials, Stripe keys, and Sentry DSNs as sensitive. For local cleanup after config or env changes, use `php artisan optimize:clear`.
