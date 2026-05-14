# Sprint 1 V1 Prod - P0 Core + Admin Ops + Responsive Critique

## Summary

Ce sprint couvre uniquement le premier increment livrable de la V1 :

- stabiliser le coeur prod `reservations + paiements + providers externes`
- rendre l'admin exploitable pour les operations critiques
- corriger le responsive le plus bloquant sur admin/mobile critique

Ordre d'execution :

1. Corriger l'integrite metier booking/payment/provider
2. Rendre l'admin exploitable sur ces flux stabilises
3. Corriger le profil client reel
4. Finaliser le white-label public critique
5. Finir par le responsive/UI critique lie aux ecrans touches

Le sprint est considere termine uniquement si les flows Stripe, external booking, stock release, service visibility, admin ops et profil client sont testables et utilisables sans workaround.

## Key Changes

### 1. Reservations, paiements, stock

- Supprimer toute possibilite de confirmation locale directe d'un service `source_type=EXTERNAL`
- Le flow `bookings.confirm` ne doit plus produire `CONFIRMED` pour un service externe hors orchestration provider
- Pour les services externes :
  - si paiement online requis, seule la chaine `checkout -> webhook Stripe idempotent -> ExternalBookingService -> confirmation locale` peut confirmer
  - si paiement online non requis ou Stripe desactive, la reservation locale doit rester en attente provider et passer par `ExternalBookingService` avant tout `CONFIRMED`
- Introduire un statut de reservation temporaire dedie au checkout non finalise
  - statut retenu : `AWAITING_PAYMENT`
  - `PENDING` reste reserve aux cas metier reellement en attente d'action partenaire/admin
- Ajuster `AvailabilityResolver` pour que seuls les etats reellement bloquants reservent le stock
- En cas de `checkout.session.expired`, echec de creation de session Stripe, annulation utilisateur ou abandon depassant le TTL, liberer le stock
- Ajouter un cleanup automatise
  - job/commande planifiee pour expirer les bookings `AWAITING_PAYMENT`
  - TTL V1 fixe a `30 minutes`
- Preserver l'idempotence Stripe
- En cas d'echec provider apres paiement :
  - garder le refund compensatoire
  - exposer clairement `external_booking_status`, `external_booking_reference`, `external_error_message`
  - ne jamais laisser un booking externe en `CONFIRMED` si le provider a echoue

### 2. Visibilite publique des services

- Bloquer l'acces public aux services `is_available=false` sur tous les points d'entree publics
- `GET /api/services/{id}`
  - public/auth client : `404` si service indisponible
  - partner/admin autorises : acces maintenu selon role/ownership
- Bloquer aussi le rendu public Inertia/SEO des services masques
- Corriger `robots.txt` pour pointer vers le vrai domaine V1, de facon coherente avec `APP_URL`

### 3. Admin ops exploitable

- Simplifier le dashboard admin pour en faire un panel operationnel
- Priorites admin de ce sprint :
  - liste reservations
  - detail reservation
  - statut paiement
  - statut provider
  - erreurs externes
  - recherche et filtres
  - vue partenaires
  - modification/desactivation partenaire
  - consultation des reservations liees
- Dashboard financier minimal :
  - paiements
  - commissions calculees a la lecture
  - remboursements
  - erreurs Stripe visibles
- Strategie commission retenue :
  - recalcul a la lecture uniquement
  - aucun backfill des bookings historiques
  - invalidation cache immediate sur changement de commission
  - alignement backend/frontend

### 4. Dashboard client

- Remplacer le faux save du profil par une vraie persistance DB
- Champs V1 reellement editables :
  - prenom/nom via `name`
  - telephone
  - langue
  - devise preferee client
- L'email reste en lecture seule sur cette page
- Ajouter un toggle afficher/masquer mot de passe sur :
  - login
  - signup
  - reset password
- Faire remonter dans `Mes reservations` :
  - paiement
  - provider
  - remboursement
  - annulation/expiration checkout

### 5. White-label public + responsive critique

- Supprimer les references partenaires/providers visibles au client final sur :
  - homepage
  - recherche
  - pages publiques touchees
- Nettoyer tout branding provider parasite expose publiquement
- Responsive critique a traiter sur les ecrans modifies par ce sprint :
  - admin dashboard
  - admin reservations/transactions/partenaires
  - payment success/cancel
  - historique client
  - profil client

## Public APIs / Interfaces

- Ajouter le statut booking `AWAITING_PAYMENT`
- Garder les champs externes comme source de verite :
  - `external_booking_reference`
  - `external_booking_status`
  - `external_booking_payload`
  - `external_error_message`
- Exposer de facon coherente :
  - `bookingStatus`
  - `paymentStatus`
  - `externalBookingStatus`
  - `externalBookingReference`
  - `externalErrorMessage`
- Le detail service public doit renvoyer `404` pour `is_available=false`
- Le profil client doit accepter une vraie mise a jour serveur des champs autorises

## Test Plan

### External booking

- service externe online : jamais `CONFIRMED` avant succes provider
- service externe offline/sans Stripe : jamais `CONFIRMED` sans `ExternalBookingService`
- provider unsupported : echec propre, aucune confirmation locale

### Stripe / stock

- creation checkout cree un booking non bloquant tant que webhook non valide
- `checkout.session.completed` confirme correctement
- `checkout.session.expired` libere le stock
- annulation/abandon depassant TTL libere le stock
- retry webhook Stripe reste idempotent
- echec provider apres paiement declenche refund compensatoire sans double action

### Visibility

- service indisponible absent du listing public
- service indisponible inaccessible en API publique
- service indisponible inaccessible en page publique
- admin/partner autorises gardent l'acces operationnel

### Admin

- listing reservations filtre par statut booking/paiement/provider
- reservations externes affichent bien erreur/reference
- changement commission invalide le cache et realigne les prix affiches futurs
- CRUD partenaire manuel fonctionne avec suspension/desactivation

### Client

- profil sauvegarde reellement en DB
- erreurs de validation visibles
- historique affiche paiement/provider/refund/stats coherents

### Responsive manual QA

- aucune page touchee n'a d'overflow horizontal
- actions primaires accessibles mobile
- tableaux admin degrades correctement sur petit ecran

## Audit / Delivery Format

Pour chaque correction livree :

1. cause exacte
2. fichiers impactes
3. explication technique
4. correction appliquee
5. impact metier
6. risque evite

## Checklist quotidienne

### Debut de journee

- relire les priorites du sprint et ne pas sortir du scope P0
- verifier les changements en cours dans le repo
- confirmer le bloc du jour :
  - booking/payment/provider
  - visibilite publique
  - admin ops
  - dashboard client
  - responsive/white-label
- lister le livrable concret attendu en fin de journee

### Pendant l'implementation

- ne jamais lancer de correction sans cause exacte identifiee
- verifier l'impact backend + frontend + UX avant modification
- preserver l'idempotence Stripe et la logique `ExternalBookingService`
- ne pas introduire de quick fix ni de logique parallele
- tester localement chaque sous-bloc avant de passer au suivant
- garder les etats booking/payment/provider coherents dans toute la chaine

### Fin de journee

- verifier que le bloc traite est terminable et non partiellement casse
- documenter :
  - ce qui a ete corrige
  - ce qui reste
  - les risques detectes
  - les tests executes
- confirmer que le livrable du jour reste montrable/utilisable
- preparer le prochain bloc sans commencer une nouvelle fonctionnalite

## Runbook d'implementation

### Phase 1 - Booking / Payment / Provider integrity

Objectif :

- supprimer toute confirmation externe illegitime
- liberer le stock apres abandon/echec paiement
- fiabiliser les statuts booking/payment/provider

Execution :

1. auditer `BookingContext.tsx`, `BookingController.php`, `PaymentService`, `ExternalBookingService`
2. introduire `AWAITING_PAYMENT` comme etat de pre-checkout non bloquant
3. empecher `bookings.confirm` de confirmer un service `EXTERNAL` sans provider
4. faire passer tous les flows externes par `ExternalBookingService`
5. mettre a jour webhook Stripe et echec/expiration checkout
6. introduire expiration TTL + cleanup job
7. ajuster `AvailabilityResolver` pour ne bloquer que les etats valides
8. aligner les reponses API et les pages success/cancel/history

Definition of done :

- aucun booking externe ne devient `CONFIRMED` sans provider
- aucun checkout abandonne ne bloque le stock
- retries Stripe sans double effet

### Phase 2 - Public visibility / SEO protection

Objectif :

- rendre les services masques inaccessibles publiquement

Execution :

1. bloquer le detail API public des services `is_available=false`
2. bloquer la page publique detail
3. neutraliser le rendu SEO public des services masques
4. corriger `robots.txt` et la coherence domaine/sitemap

Definition of done :

- URL directe publique renvoie `404`
- API publique renvoie `404`
- aucun rendu SEO public exploitable

## Trace d'avancement

### 2026-05-12 - Audit avant poursuite

Bloc :

- Phase 1 - booking / payment / provider integrity

Cause exacte :

- le flow `/api/checkout` contournait la garde FareHarbor `DEPOSIT_ONLY`
- le frontend forcait Stripe pour un service externe des que `amountOnline > 0`, meme si Stripe etait desactive
- le message UX de la page `payment-cancel` affirmait une liberation immediate du stock non garantie par le backend
- `PaymentService` utilisait `service.partner_id` en direct, plus fragile que le fallback deja present dans `BookingController`

Fichiers impactes :

- `app/Http/Controllers/Api/BookingController.php`
- `app/Services/Payments/PaymentService.php`
- `resources/js/api/bookings.ts`
- `resources/js/context/BookingContext.tsx`
- `resources/js/pages/wdr-pages/ServiceDetailPage/index.tsx`
- `resources/js/pages/wdr-pages/PaymentPage/index.tsx`
- `resources/js/pages/bookings/payment-cancel.tsx`
- `tests/Feature/StripeCheckoutTest.php`

Explication technique :

- `bookings.init` doit dire explicitement au frontend si Stripe Checkout est requis ou non
- un service externe avec montant online mais Stripe desactive doit repasser par `bookings.confirm` et `ExternalBookingService`, sans session Stripe
- `PaymentService` doit appliquer les memes gardes metier que `BookingController` pour eviter une route parallele incoherente
- tant que seul `checkout.session.expired` ou le TTL expirent le booking, la page d'annulation ne doit pas promettre une liberation immediate

Correction appliquee :

- ajout de `requiresStripeCheckout` dans la reponse `bookings.init`
- alignement de `bookings.confirm` pour ne differer la confirmation externe qu'en presence effective de Stripe
- ajout de la garde `DEPOSIT_ONLY` et du fallback `partner_id` dans `PaymentService`
- propagation du mode de checkout dans le draft frontend puis choix entre `PaymentButton` Stripe et `confirmPayment`
- correction du message de `payment-cancel` pour refleter le comportement serveur reel
- ajout de tests de non-regression pour :
  - service externe sans Stripe
  - blocage `DEPOSIT_ONLY` via `/api/checkout`
  - exposition de `requiresStripeCheckout=false`

Impact metier :

- les services externes restent reservables sans workaround quand Stripe est desactive
- les activites FareHarbor au tarif final inconnu ne peuvent plus ouvrir un checkout incoherent
- le wording client est aligne sur la realite des statuts et du stock

Risque evite :

- faux echec de reservation externe en environnement sans Stripe
- creation de checkout Stripe sur un prix provider non final
- confusion support/client sur l'etat reel du stock apres annulation utilisateur

Tests executes :

- executes avec le conteneur temporaire recommande par le repo :
  - `tests/Feature/StripeCheckoutTest.php`
  - `tests/Feature/ExternalBookingServiceTest.php`
  - `tests/Feature/PublicServiceVisibilityTest.php`
  - `tests/Feature/BookingAvailabilityTest.php`
  - `tests/Unit/RobotsFileTest.php`
- resultat :
  - `OK (27 tests, 78 assertions)`

Reste a faire :

- poursuivre ensuite le prochain sous-bloc P0 du sprint avec la meme trace documentaire

### 2026-05-12 - Admin ops filters et erreurs externes

Bloc :

- Phase 3 - admin ops exploitable

Cause exacte :

- `GET /api/bookings` admin ne filtrait que `status` et `paymentStatus`
- aucune recherche admin exploitable sur reservation/client/partenaire/ref provider/erreur externe
- la page admin transactions n'exposait pas clairement les erreurs externes et n'avait pas de filtre provider

Fichiers impactes :

- `app/Http/Controllers/Api/BookingController.php`
- `resources/js/api/bookings.ts`
- `resources/js/hooks/useBookingsData.ts`
- `resources/js/pages/wdr-pages/AdminTransactionsPage/index.tsx`
- `resources/js/translations/adminFr.ts`
- `tests/Feature/AdminBookingOperationsTest.php`

Explication technique :

- le sprint demande un panel admin operationnel sur les reservations, le paiement et le provider
- cela impose une vraie capacite de filtrage backend, pas seulement du tri/masquage local en frontend
- l'endpoint admin bookings devait supporter :
  - `status`
  - `paymentStatus`
  - `externalBookingStatus`
  - `partnerId`
  - `clientId`
  - `q`

Correction appliquee :

- ajout des filtres `externalBookingStatus`, `partnerId`, `clientId`, `q` dans `BookingController::adminList`
- ajout de la recherche admin sur :
  - id reservation
  - reference provider
  - message d'erreur externe
  - service
  - client
  - partenaire
- alignement des types frontend et du hook admin bookings sur ces nouveaux parametres
- branchement de la page admin transactions sur ces filtres serveur
- ajout des controles UI :
  - statut reservation
  - statut paiement
  - statut provider
  - recherche texte
- affichage explicite de `externalBookingStatus`, `externalBookingReference` et `externalErrorMessage` dans le tableau admin

Impact metier :

- l'admin peut retrouver rapidement une reservation en echec provider ou remboursee
- les operations critiques paiements/providers deviennent lisibles sans workaround ni lecture de logs
- le panel financier est plus proche du besoin support/ops reel

Risque evite :

- perte de temps support sur recherche manuelle dans les reservations
- reservation externe en echec non visible clairement en admin
- lecture incomplete de l'etat payment/provider sur un incident client

Tests executes :

- `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/AdminBookingOperationsTest.php tests/Feature/StripeCheckoutTest.php`
- resultat :
  - `OK (14 tests, 53 assertions)`
- `npm run types:check`
- resultat :
  - succes

Reste a faire :

- poursuivre le prochain sous-bloc P0 admin/client encore incomplet en gardant la meme trace

### 2026-05-12 - Profil client reel et erreurs visibles

Bloc :

- Phase 4 - dashboard client

Cause exacte :

- la page profil persistait deja vers l'API mais n'affichait pas les erreurs de validation serveur dans les champs
- aucun test cible ne verrouillait `PATCH /api/users/me` pour les champs autorises client/partner

Fichiers impactes :

- `resources/js/pages/wdr-pages/ProfilePage/index.tsx`
- `resources/js/pages/wdr-pages/ProfilePage/ProfilePage.css`
- `resources/js/translations/publicPagesFr.ts`
- `tests/Feature/UserProfileApiTest.php`

Explication technique :

- le sprint demande un vrai profil client modifiable avec erreurs visibles
- le backend renvoie deja des erreurs de validation sur `first_name`, `last_name`, `phone_number`, `language`, `preferred_currency`
- il fallait les mapper proprement dans la page au lieu d'un toast generique

Correction appliquee :

- ajout d'un etat `formErrors` et `submitError` dans la page profil
- mapping des erreurs API vers les champs :
  - `firstName`
  - `lastName`
  - `phoneNumber`
  - `language`
  - `preferredCurrency`
- affichage inline des erreurs sous les inputs/selects
- ajout d'un bandeau d'erreur global lorsque la validation echoue
- ajout des styles d'erreur pour les champs profil
- ajout d'un test API pour :
  - update client des champs autorises
  - non-persistance de `preferred_currency` pour un partner
  - retour `422` sur payload invalide

Impact metier :

- le client peut corriger directement un profil invalide sans message opaque
- le comportement reeel de l'API profil est verrouille pour les roles client/partner

Risque evite :

- faux sentiment de panne generique alors qu'il s'agit d'une simple erreur de saisie
- regression silencieuse sur les champs reellement modifiables du profil
- persistance accidentelle d'une devise preferee sur un partner

Tests executes :

- `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/UserProfileApiTest.php`
- resultat :
  - `OK (3 tests, 15 assertions)`
- `npm run types:check`
- resultat :
  - succes

Reste a faire :

- poursuivre le prochain bloc P0 restant avec la meme trace documentaire

### 2026-05-12 - White-label public critique sur cartes et panier

Bloc :

- Phase 5 - white-label public + responsive critique

Cause exacte :

- les cartes de service publiques affichaient encore un bloc partenaire complet dans `ServiceCard`
- le panier client exposait encore des labels `prestataire/provider/fornitore/...` dans la decomposition tarifaire

Fichiers impactes :

- `resources/js/components/wdr/ServiceCard/index.tsx`
- `resources/js/lib/serviceAdapter.ts`
- `resources/js/translations/authBookingFr.ts`
- `resources/js/translations/authBookingEn.ts`
- `resources/js/translations/authBookingEs.ts`
- `resources/js/translations/authBookingPt.ts`
- `resources/js/translations/authBookingIt.ts`
- `resources/js/translations/authBookingDe.ts`

Explication technique :

- le sprint demande de supprimer les references partenaires/providers visibles au client final sur les pages publiques touchees
- `ServiceCard` affichait encore `partnerName` et l'avatar/initiale associee, y compris sur les listings publics
- le panier gardait une decomposition correcte mais avec un wording non white-label

Correction appliquee :

- suppression du bloc partenaire visible dans `ServiceCard`
- conservation de `partnerName` seulement comme compatibilite de type dans `serviceAdapter`, sans exposition publique
- remplacement du libelle panier `cart.price.partner` par un wording neutre :
  - `Prix de base`
  - `Base price`
  - equivalents localises dans les autres langues supportees

Impact metier :

- les listings publics et le panier sont plus alignes avec une experience client white-label
- l'utilisateur final voit une presentation neutre, sans remontee parasite du prestataire source

Risque evite :

- perception d'un produit non fini ou multi-brand cote client
- fuite inutile de naming partenaire/provider dans le tunnel de reservation

Tests executes :

- `npm run types:check`
- resultat :
  - succes

Reste a faire :

- continuer le nettoyage P0 restant sur les ecrans publics/responsive touches par le sprint avec la meme trace

### Phase 3 - Admin ops exploitable

Objectif :

- fournir un admin panel simple et operationnel

Execution :

1. nettoyer les widgets inutiles et les stats trompeuses
2. fiabiliser les sources de donnees reservations/paiements/partenaires
3. afficher statuts booking/payment/provider + erreurs externes
4. ajouter filtres/recherche utiles
5. rendre la gestion partenaire exploitable :
   - creer
   - modifier
   - suspendre/desactiver
   - consulter reservations liees
6. aligner la logique commission/prix avec invalidation cache immediate
7. garder le dashboard financier minimal et fiable

Definition of done :

- un admin peut piloter reservations, paiements et partenaires sans ambiguites
- les prix affiches et futurs checkouts sont coherents apres changement de commission

### Phase 4 - Dashboard client reel

Objectif :

- supprimer les faux comportements et rendre le compte client fiable

Execution :

1. connecter `/mon-profil` a une vraie persistence backend
2. garder l'email en lecture seule
3. ajouter validations et retours erreur/succes honnetes
4. ajouter toggle afficher/masquer mot de passe sur auth screens
5. enrichir `Mes reservations` avec les nouveaux statuts et infos paiement/provider

Definition of done :

- un client peut reellement modifier son profil
- l'historique reservations est comprehensible et exploitable

### Phase 5 - White-label / Responsive critique

Objectif :

- retirer le branding parasite public
- corriger les cassures mobiles des ecrans touches

Execution :

1. supprimer references partenaires/providers sur homepage/recherche/public
2. masquer les noms techniques provider cote client final
3. corriger overflows, cartes, badges, tableaux, CTA sur mobile
4. verifier manuellement Safari iPhone et Chrome Android

Definition of done :

- aucun branding provider public
- pas d'overflow horizontal
- ecrans modifies utilisables sur petit ecran

## Assumptions

- Horizon retenu : `Sprint 1 detaille uniquement`
- Priorite retenue : `P0 prod core + admin ops + responsive critique`
- Niveau admin retenu : `ops minimal exploitable`
- Strategie commission retenue : `recalcul a la lecture uniquement`
- Le branding provider doit disparaitre du public
- Si la suppression hard delete d'un partenaire est risquee, on remplace par une desactivation securisee
