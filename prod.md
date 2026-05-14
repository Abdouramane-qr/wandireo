# Production Checklist

Document de passage en production pour `wandireo-api`, avec focus Stripe Checkout.

## Avant de basculer

- vérifier que l’intégration fonctionne en test de bout en bout
- valider que les réservations se créent bien pour les activités internes et externes
- valider que `payments.status` passe à `paid` via webhook
- valider que `bookings.status = CONFIRMED` et `bookings.payment_status = PAID`

## Variables d’environnement

Remplacer les valeurs de test par les valeurs live:

```env
APP_ENV=production
APP_DEBUG=false

STRIPE_KEY=pk_live_xxx
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

Règles:

- `STRIPE_KEY` et `VITE_STRIPE_PUBLISHABLE_KEY` doivent être identiques
- `STRIPE_SECRET` ne doit jamais être exposée au frontend
- `STRIPE_WEBHOOK_SECRET` doit venir du webhook live créé dans le Dashboard Stripe
- ne pas réutiliser le secret `whsec_...` de `stripe listen`

## Côté Stripe

1. passer le Dashboard Stripe en mode live
2. ouvrir `Developers > API keys`
3. copier la clé publique live `pk_live_...`
4. révéler la clé secrète live `sk_live_...`
5. ouvrir `Developers > Webhooks`
6. créer ou ouvrir l’endpoint de production
7. copier le `Signing secret` `whsec_...`

## Déploiement

1. mettre à jour les variables d’environnement de production
2. redéployer l’application
3. exécuter les migrations si nécessaire
4. lancer `php artisan optimize:clear`
5. vérifier que les services `app`, `nginx`, `postgres` et `redis` sont sains

## Vérification post-déploiement

- ouvrir une activité réservable
- aller jusqu’à la page paiement
- lancer un checkout Stripe
- vérifier la redirection vers Stripe Checkout
- vérifier que le webhook arrive bien sur l’API
- vérifier en base:

```sql
select id, stripe_session_id, status from payments order by id desc limit 5;
select id, status, payment_status from bookings order by created_at desc limit 5;
```

Résultat attendu:

- `payments.status = paid`
- `bookings.status = CONFIRMED`
- `bookings.payment_status = PAID`

## Après validation

- surveiller les logs applicatifs pendant les premiers paiements
- garder Stripe CLI uniquement pour le test local, jamais pour la production
- documenter toute rotation de clés live ou de secret webhook
