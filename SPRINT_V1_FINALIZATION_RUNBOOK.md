# Sprint 1 V1 - Finalization Runbook

## Purpose

Ce fichier sert de reference unique avant toute execution de correction sur le sprint V1.

Regle obligatoire pour chaque lot :

1. verifier l'etat reel du bloc cible
2. si l'etat est deja conforme au sprint, `SKIP`
3. si l'etat n'est pas conforme, `EXECUTE`
4. apres execution, relancer les tests/validations du lot
5. documenter le resultat : `DONE`, `PARTIAL`, `BLOCKED`, ou `SKIPPED`

Ne jamais corriger un lot sans verification prealable de son etat reel.

## Global Gate

Avant tout debut de session d'execution :

- relire `SPRINT_V1_EXECUTION.md`
- verifier l'etat du repo
- verifier si des changements locaux peuvent affecter le lot
- verifier si le lot precedent est valide avant de passer au suivant

Commande de controle recommandee :

```bash
git status --short
```

## Status Legend

- `TODO` : lot non traite
- `SKIPPED` : lot deja conforme, aucune correction necessaire
- `EXECUTE` : lot doit etre corrige maintenant
- `DONE` : lot corrige et valide
- `DONE WITH KNOWN DEBT` : lot fonctionnellement valide, mais une dette outillage/style globale reste documentee
- `PARTIAL` : lot partiellement corrige, reste du travail
- `BLOCKED` : lot bloque par un prerequis

## Lot 1 - Migrations / Test Boot

Status initial : `DONE`

### Goal

Remettre le projet dans un etat ou la suite critique peut demarrer sans casser sur les migrations.

### Pre-check

Verifier avant correction :

- erreur de syntaxe dans `database/migrations/2026_05_15_170000_backfill_real_fareharbor_partner_emails.php`
- erreur d'insertion UUID sur `fareharbor_companies.id` dans `database/migrations/2026_05_15_160000_expand_fareharbor_default_companies_v1.php`

Si ces deux points n'existent plus, `SKIP`.
Sinon, `EXECUTE`.

### Files

- `database/migrations/2026_05_15_170000_backfill_real_fareharbor_partner_emails.php`
- `database/migrations/2026_05_15_160000_expand_fareharbor_default_companies_v1.php`

### Validation

```bash
docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/StripeCheckoutTest.php tests/Feature/ExternalBookingServiceTest.php tests/Feature/PublicServiceVisibilityTest.php tests/Feature/AdminBookingOperationsTest.php tests/Feature/UserProfileApiTest.php
```

### Exit condition

- la suite ne casse plus au parsing/migrate

## Lot 2 - Critical Test Rebaseline

Status initial : `DONE`

### Goal

Mesurer l'etat reel du sprint une fois le socle migrations corrige.

### Pre-check

Verifier si la suite critique a deja ete relancee apres Lot 1 et si le resultat est documente.

- si non relancee, `EXECUTE`
- si relancee et resultat encore exploitable pour l'etat courant, `SKIP`

### Files

- aucun changement obligatoire si la suite sert seulement de verification

### Validation

Utiliser la meme commande que Lot 1.

### Exit condition

- disposer d'un etat test critique fiable pour guider les lots suivants

## Lot 3 - External Booking Integrity Lock

Status initial : `DONE`

### Goal

Supprimer toute voie de confirmation locale interdite pour les services `EXTERNAL`.

### Pre-check

Verifier avant correction :

- `PATCH /api/bookings/{id}/status` permet-il encore un passage direct vers `CONFIRMED` pour un service `EXTERNAL` ?
- existe-t-il deja un test qui bloque explicitement ce contournement ?

Si le bypass n'existe plus et qu'un test le verrouille, `SKIP`.
Sinon, `EXECUTE`.

### Files

- `app/Http/Controllers/Api/BookingController.php`
- `tests/Feature/StripeCheckoutTest.php`
- `tests/Feature/AdminBookingOperationsTest.php`
- `tests/Feature/ExternalBookingServiceTest.php` si necessaire

### Validation

```bash
docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/StripeCheckoutTest.php tests/Feature/ExternalBookingServiceTest.php tests/Feature/AdminBookingOperationsTest.php
```

### Exit condition

- aucun booking `EXTERNAL` ne peut devenir `CONFIRMED` hors orchestration provider

## Lot 4 - Public Visibility / Robots Closure

Status initial : `SKIPPED`

### Goal

Fermer les derniers ecarts publics et SEO du sprint.

### Pre-check

Verifier avant correction :

- `public/robots.txt` est-il coherent avec la source de verite retenue ?
- les services `is_available=false` sont-ils bien bloques en listing, API publique et page publique ?

Si tout est deja conforme, `SKIP`.
Sinon, `EXECUTE`.

### Files

- `public/robots.txt`
- `app/Http/Controllers/Api/ServiceController.php`
- `app/Http/Controllers/PageController.php`
- `tests/Feature/PublicServiceVisibilityTest.php`
- `tests/Unit/RobotsFileTest.php`

### Validation

```bash
docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/PublicServiceVisibilityTest.php tests/Unit/RobotsFileTest.php
```

### Exit condition

- `robots.txt` coherent
- visibilite publique protegee sans regression owner/admin

## Lot 5 - UI / Responsive Residuals

Status initial : `SKIPPED`

### Goal

Fermer uniquement les ecarts UI/responsive lies au sprint.

### Pre-check

Verifier avant correction :

- presence d'overflow horizontal sur les ecrans cibles
- CTA primaires inaccessibles mobile
- tableaux admin mal degradés
- messages payment success/cancel ou history encore incoherents

Si aucun ecart critique n'est observe, `SKIP`.
Sinon, `EXECUTE`.

### Files

- `resources/js/pages/wdr-pages/AdminDashboardPage/index.tsx`
- `resources/js/pages/wdr-pages/AdminDashboardPage/AdminDashboardPage.css`
- `resources/js/pages/wdr-pages/AdminTransactionsPage/index.tsx`
- `resources/js/pages/wdr-pages/AdminTransactionsPage/AdminTransactionsPage.css`
- `resources/js/pages/wdr-pages/AdminUsersPage/index.tsx`
- `resources/js/pages/wdr-pages/BookingsHistoryPage/index.tsx`
- `resources/js/pages/wdr-pages/BookingsHistoryPage/BookingsHistoryPage.css`
- `resources/js/pages/wdr-pages/ProfilePage/index.tsx`
- `resources/js/pages/wdr-pages/ProfilePage/ProfilePage.css`
- `resources/js/pages/bookings/payment-success.tsx`
- `resources/js/pages/bookings/payment-cancel.tsx`
- `resources/js/pages/wdr-pages/PaymentPage/PaymentPage.css`

### Validation

```bash
npm run types:check
```

Validation manuelle ciblee :

- mobile etroit
- tablette
- desktop standard

### Exit condition

- aucun overflow horizontal sur les ecrans modifies
- ecrans critiques utilisables sans workaround

## Lot 6 - Final Validation

Status initial : `PARTIAL`

### Goal

Clore le sprint sur une validation finale complete.

### Pre-check

Verifier avant execution :

- Lots 1 a 5 en `DONE` ou `SKIPPED`
- aucun lot prealable en `BLOCKED`

Si les prerequis ne sont pas satisfaits, `SKIP` temporairement.
Sinon, `EXECUTE`.

### Validation

```bash
npm run types:check
composer test
composer run ci:check
```

### Exit condition

- socle backend/frontend valide
- sprint testable sans workaround

## Execution Rule Before Every Lot

Toujours appliquer cet ordre :

1. ouvrir les fichiers du lot
2. verifier si l'etat actuel est deja conforme
3. noter `SKIP` ou `EXECUTE`
4. seulement ensuite modifier le code si necessaire
5. relancer la validation du lot
6. consigner le resultat reel

## Session Log Template

Utiliser ce format avant et apres chaque lot :

```text
Lot:
Pre-check:
Decision: SKIP | EXECUTE
Cause exacte:
Files:
Validation:
Resultat: DONE | PARTIAL | BLOCKED | SKIPPED
Risques restants:
```

## Session Log - 2026-05-16

```text
Lot: 1 - Migrations / Test Boot
Pre-check:
- migration 2026_05_15_170000_backfill_real_fareharbor_partner_emails.php terminait par `}` au lieu de `};`
- migration 2026_05_15_160000_expand_fareharbor_default_companies_v1.php inserait sans UUID obligatoire
Decision: EXECUTE
Cause exacte:
- parsing PHP invalide
- colonne fareharbor_companies.id UUID non nullable
Files:
- database/migrations/2026_05_15_170000_backfill_real_fareharbor_partner_emails.php
- database/migrations/2026_05_15_160000_expand_fareharbor_default_companies_v1.php
Validation:
- suite critique backend
Resultat: DONE
Risques restants:
- aucun sur le boot migrations cible
```

```text
Lot: 2 - Critical Test Rebaseline
Pre-check:
- suite critique relancee apres Lot 1
Decision: EXECUTE
Cause exacte:
- la suite revelait un vrai bug de persistence email_verified_at sur profil partner
Files:
- app/Http/Controllers/Api/UserController.php
Validation:
- tests/Feature/UserProfileApiTest.php
- suite critique backend
Resultat: DONE
Risques restants:
- aucun detecte sur la suite critique
```

```text
Lot: 3 - External Booking Integrity Lock
Pre-check:
- PATCH /api/bookings/{id}/status permettait encore CONFIRMED sur service EXTERNAL
Decision: EXECUTE
Cause exacte:
- updateStatus ne chargeait pas le service et ne verifiait pas source_type
Files:
- app/Http/Controllers/Api/BookingController.php
- tests/Feature/AdminBookingOperationsTest.php
Validation:
- tests/Feature/StripeCheckoutTest.php
- tests/Feature/ExternalBookingServiceTest.php
- tests/Feature/AdminBookingOperationsTest.php
Resultat: DONE
Risques restants:
- aucun bypass CONFIRMED externe detecte par les tests cibles
```

```text
Lot: 4 - Public Visibility / Robots Closure
Pre-check:
- public/robots.txt coherent avec APP_URL dans .env et .env.example
- protections is_available=false presentes et testees
Decision: SKIP
Cause exacte:
- aucun ecart code detecte avec la source de verite locale actuelle
Files:
- aucun changement
Validation:
- tests/Feature/PublicServiceVisibilityTest.php
- tests/Unit/RobotsFileTest.php
Resultat: SKIPPED
Risques restants:
- si le domaine V1 officiel change, APP_URL/robots devront etre realignes ensemble
```

```text
Lot: 5 - UI / Responsive Residuals
Pre-check:
- regles responsive presentes sur les ecrans cibles
- statuts payment/provider visibles dans les pages client touchees
Decision: SKIP
Cause exacte:
- aucun ecart critique observe dans le code durant ce passage
Files:
- aucun changement
Validation:
- npm run types:check
Resultat: SKIPPED
Risques restants:
- QA visuelle mobile reelle non executee dans ce terminal
```

```text
Lot: 6 - Final Validation
Pre-check:
- Lots 1 a 5 en DONE ou SKIPPED
- Docker services healthy
- Redis/Postgres bindes en local apres correction incident 500
Decision: EXECUTE
Cause exacte:
- validation finale requise
Files:
- tests/Feature/FareHarborIntegrationTest.php
- app/Http/Controllers/PageController.php
- docker-compose.yml
Validation:
- suite critique backend : OK (33 tests, 117 assertions)
- php artisan test : OK (135 tests, 567 assertions)
- npm run lint:check : OK
- npm run types:check : OK
- docker compose ps : OK, services healthy
- docker compose exec redis redis-cli ROLE : OK, master
- nginx interne / : OK, HTTP 200
- npm run format:check : FAIL, format global preexistant sur 271 fichiers resources/
- composer test : non executable sur l'hote, composer absent
- composer run ci:check : non executable sur l'hote, composer absent
- php vendor/bin/pint --test --parallel : FAIL, style global preexistant sur 203 fichiers / 71 issues
Resultat: DONE WITH KNOWN DEBT
Risques restants:
- Prettier global non conforme avant cette passe; correction globale repoussee pour eviter un diff massif hors validation metier
- Pint global non conforme avant cette passe; correction globale repoussee pour eviter un diff massif hors validation metier
- composer test / composer run ci:check non lancables tels quels dans cet environnement sans binaire composer
- equivalence fonctionnelle couverte par npm lint, npm types, php artisan test, controles runtime Docker/Redis/Nginx
```
