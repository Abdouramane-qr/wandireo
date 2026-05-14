# README Stripe

Guide d integration Stripe Checkout pour `wandireo-api`.

L integration courante utilise:

- `Stripe Checkout` pour toutes les activites, internes et externes
- un `PaymentService` cote Laravel pour isoler la logique de paiement
- un webhook Stripe comme seule source de confirmation du paiement

## Variables d environnement

```env
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

`STRIPE_KEY` et `VITE_STRIPE_PUBLISHABLE_KEY` doivent contenir la meme cle publique.

## Flux courant

1. le frontend appelle `POST /api/checkout`
2. Laravel recalcule le montant serveur
3. Laravel cree une session Stripe Checkout
4. le client est redirige vers Stripe
5. Stripe appelle `POST /api/stripe/webhook`
6. le webhook passe `payments.status` a `paid`
7. la reservation est synchronisee en `CONFIRMED` / `PAID`

## Test local

Webhook local:

```bash
stripe listen --forward-to http://127.0.0.1:8080/api/stripe/webhook
```

Rejouer un evenement de test:

```bash
stripe trigger checkout.session.completed
```

Verification en base:

```bash
select id, stripe_session_id, amount, currency, status from payments order by id desc limit 5;
select id, status, payment_status, amount_paid_online from bookings order by created_at desc limit 5;
```

## Verification fonctionnelle

1. ouvrir une activite reservable
2. aller jusqu a la page paiement
3. cliquer sur le bouton Stripe
4. payer avec la carte de test `4242 4242 4242 4242`
5. verifier que `payments.status = paid`
6. verifier que `bookings.status = CONFIRMED`
7. verifier que `bookings.payment_status = PAID`
