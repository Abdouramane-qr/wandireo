# Wandireo

Marketplace travel multi-verticale pour activites, bateaux, voitures et
hebergements premium.

`wandireo-api` est l'application Laravel + Inertia qui porte:

- le site public
- les parcours client connectes
- le tunnel de reservation et de paiement
- les espaces partenaire et admin
- les integrations partenaires externes

![Wandireo](public/wandireo.png)

## Stack

- Laravel 13
- PHP 8.4
- Inertia + React 19 + TypeScript
- PostgreSQL + Redis
- Stripe Checkout + webhooks
- Docker Compose pour l'environnement conteneurise

## Documentation associee

- [README-developpeur.md](README-developpeur.md)
- [README-produit.md](README-produit.md)
- [README-deploiement.md](README-deploiement.md)
- [README-stripe.md](README-stripe.md)

## Demarrage rapide

### En local hors Docker

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
composer run dev
```

### Via Docker

```bash
docker compose build
docker compose up -d
docker compose exec app php artisan migrate --force
```

## Commandes utiles

```bash
composer run dev
composer run ci:check
composer test
composer lint:check
npm run lint:check
npm run format:check
npm run types:check
php artisan optimize:clear
```

## Architecture reservation et paiement

Le produit gere deux grandes familles de services:

- services locaux: le stock et la confirmation vivent uniquement dans Wandireo
- services externes: le stock vit aussi chez un partenaire/provider externe

### Regle de confirmation

Le paiement n'est jamais la seule condition de confirmation.

Pour un service externe (`services.source_type = EXTERNAL`):

1. Wandireo verifie la disponibilite avant paiement
2. le client paie via `Stripe Checkout`
3. Stripe appelle le webhook `POST /api/stripe/webhook`
4. Wandireo tente immediatement de creer la reservation chez le partenaire
5. la reservation Wandireo ne passe a `CONFIRMED` que si la reservation partenaire reussit
6. si l'ecriture partenaire echoue, Wandireo annule la confirmation locale et tente un remboursement Stripe

### Champs de tracabilite externe sur `bookings`

Les reservations externes portent maintenant une trace dediee:

- `external_booking_reference`
- `external_booking_status`
- `external_booking_payload`
- `external_error_message`

Ces champs servent a:

- l'idempotence du webhook
- l'audit technique
- l'affichage back-office
- le retour utilisateur apres paiement

### Couche generique de reservation externe

Le flux d'ecriture partenaire passe par une couche generique:

- `App\Services\ExternalBookings\ExternalBookingService`
- `App\Services\ExternalBookings\ExternalBookingGatewayRegistry`
- une implementation `ExternalBookingGateway` par provider

L'implementation concrete livree a ce jour est:

- `FareHarborExternalBookingGateway`

La regle produit n'est toutefois plus limitee a FareHarbor: tout service
`EXTERNAL` doit passer par cette orchestration et ne doit pas etre confirme
tant que son provider de stock n'a pas confirme la reservation.

## Paiement Stripe

Le tunnel de paiement utilise `Stripe Checkout` pour les reservations avec
encaissement en ligne. La source de verite finale du paiement reste le
webhook Stripe.

### Variables d'environnement

```env
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

`STRIPE_KEY` et `VITE_STRIPE_PUBLISHABLE_KEY` doivent contenir la meme cle publique.

### Webhooks exposes

- `POST /api/stripe/webhook`
- `POST /api/webhooks/stripe`

### Ecarts de statut possibles

Cas nominal:

- `payments.status = paid`
- `bookings.status = CONFIRMED`
- `bookings.payment_status = PAID`
- `bookings.external_booking_status = CONFIRMED` pour les services externes

Cas d'echec partenaire apres paiement:

- `payments.status = refunded` si le remboursement Stripe reussit
- `bookings.status = CANCELLED`
- `bookings.payment_status = REFUNDED`
- `bookings.external_booking_status = FAILED`
- `bookings.external_error_message` renseigne la cause

### Ecoute webhook locale

```bash
stripe listen --forward-to http://127.0.0.1:8080/api/stripe/webhook
```

## Synchronisation partenaire et contenu externe

Les activites importees depuis `FareHarbor` sont synchronisees dans
`services` avec:

- traduction stockee en base pour `title` et `description`
- contenu localise complementaire dans `extra_data.translations`
- fallback par locale cote API/site
- overrides Wandireo persistants pour les corrections manuelles

### Commandes utiles

```bash
php artisan fareharbor:sync-all
php artisan fareharbor:sync seafaris
php artisan partner-content:translate-backfill --provider=FAREHARBOR --force
php artisan partner-content:audit-translations --provider=FAREHARBOR --limit=20
```

### Regles importantes

- un resync `FareHarbor` peut recalculer les traductions generees si la source partenaire change
- les corrections manuelles Wandireo restent prioritaires via `fareharbor.overrides`
- les modifications faites depuis l'admin sur une activite partenaire ne doivent pas etre ecrasees au prochain resync
- l'audit partenaire distingue les blocages techniques et les warnings editoriaux

## Tests

### Frontend

```bash
npm run lint:check
npm run format:check
npm run types:check
```

### PHP local

```bash
composer test
```

### PHP en conteneur

L'image `app` de `docker compose` est une image de runtime/production et
n'embarque pas les dependances dev comme `phpunit`.

Pour lancer un test PHP depuis Docker avec le `vendor/` du workspace local:

```bash
docker run --rm \
  --network wandireo-api_default \
  -v /var/www/wandireo-api:/var/www \
  -w /var/www \
  wandireo-api-app \
  php vendor/bin/phpunit tests/Feature/StripeCheckoutTest.php
```

Commande validee pour ce lot reservation externe:

```bash
docker run --rm \
  --network wandireo-api_default \
  -v /var/www/wandireo-api:/var/www \
  -w /var/www \
  wandireo-api-app \
  php vendor/bin/phpunit \
  tests/Feature/ExternalBookingServiceTest.php \
  tests/Feature/StripeCheckoutTest.php
```

Etat de validation actuel:

- `ExternalBookingServiceTest`: OK
- `StripeCheckoutTest`: OK
- total cible verifie: `11 tests, 41 assertions`

## Verification manuelle recommandee

### Reservation locale

1. ouvrir un service local reservable
2. lancer un paiement Stripe
3. verifier le passage en `CONFIRMED` / `PAID`

### Reservation externe

1. ouvrir un service `EXTERNAL`
2. lancer un paiement Stripe
3. verifier la reservation partenaire creee
4. verifier `external_booking_reference`
5. verifier `external_booking_status = CONFIRMED`

### Echec partenaire

1. provoquer une erreur provider sur un service externe
2. finaliser le paiement Stripe
3. verifier `bookings.status = CANCELLED`
4. verifier `bookings.payment_status = REFUNDED`
5. verifier `external_error_message`
6. verifier le message d'echec sur la page de succes paiement

## Surfaces principales

### Public

- `/`
- `/recherche`
- `/services/{id}`
- `/blog`
- `/guide`

### Client

- `/mon-espace`
- `/mes-favoris`
- `/mes-reservations`
- `/mon-profil`

### Partenaire

- `/partenaire`
- `/partenaire/validation`
- `/partenaire/catalogue`
- `/partenaire/reservations`
- `/partenaire/profil`

### Admin

- `/admin`
- `/admin/utilisateurs`
- `/admin/services`
- `/admin/avis`
- `/admin/transactions`
- `/admin/support`
- `/admin/blog`

## Notes

- ce README couvre `wandireo-api` uniquement
- le monorepo contient aussi d'autres surfaces et documents annexes
- la reservation externe est maintenant un flux metier critique: ne pas reintroduire de confirmation locale avant creation partenaire pour les services `EXTERNAL`
