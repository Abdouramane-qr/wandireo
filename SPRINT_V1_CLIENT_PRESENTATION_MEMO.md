# Memo Presentation Client - Sprint V1

## Objectif De La Presentation

Presenter la V1 comme une stabilisation du coeur business :

- reservation
- paiement
- stock
- providers externes
- admin operationnel
- experience client
- readiness production

Message principal :

> Cette V1 securise le parcours critique reservation/paiement/provider, rend l'admin exploitable pour les operations, et donne une meilleure visibilite au client comme au support.

## Par Ou Commencer

Commencer par le flux le plus important : **reservation / paiement / provider externe**.

Raison :

- c'est le coeur business
- c'est le flux financierement sensible
- c'est le point ou les erreurs coutent le plus cher
- c'est maintenant le mieux verrouille par les tests

Ordre recommande :

1. Reservation / paiement / provider externe
2. Admin operationnel
3. Experience client
4. Visibilite publique / SEO
5. Securite et readiness production
6. Dette connue et suite proposee

## Pitch D'Ouverture

Cette V1 stabilise le coeur business : reservation, paiement, stock et fournisseurs externes. L'objectif principal etait d'eviter les confirmations incorrectes, rendre l'admin exploitable et donner une meilleure visibilite au client comme au support. La livraison est validee fonctionnellement par la suite de tests complete.

## Cas 1 - Service Externe Avec Paiement Stripe

### Scenario

Un client reserve un service externe avec paiement en ligne.

### Comportement V1

- la reservation passe par Stripe Checkout
- le webhook Stripe confirme le paiement
- `ExternalBookingService` cree ensuite la reservation chez le provider
- la reservation locale devient `CONFIRMED` uniquement si le provider confirme

### Message Client

On evite de vendre une disponibilite qui n'est pas reellement confirmee chez le partenaire.

### Risque Evite

- confirmation locale sans stock provider
- double vente
- litige client/support

## Cas 2 - Echec Provider Apres Paiement

### Scenario

Stripe confirme le paiement, mais le provider externe echoue.

### Comportement V1

- la reservation locale ne devient pas `CONFIRMED`
- l'erreur provider est conservee
- les champs de tracabilite externe restent visibles
- le chemin de remboursement compensatoire est preserve

### Message Client

Le systeme protege contre les confirmations fantomes et garde une tracabilite support exploitable.

### Risque Evite

- reservation confirmee alors que le provider a refuse
- perte de contexte support
- remboursement difficile a justifier

## Cas 3 - Abandon Ou Expiration Checkout

### Scenario

Un client commence un paiement Stripe mais abandonne ou laisse expirer la session.

### Comportement V1

- le booking utilise le statut `AWAITING_PAYMENT`
- ce statut ne bloque pas le stock comme une vraie reservation confirmee
- l'expiration/annulation libere le flux proprement

### Message Client

Un panier abandonne ne bloque plus inutilement la disponibilite.

### Risque Evite

- stock bloque artificiellement
- disponibilites faussement indisponibles
- perte de ventes

## Cas 4 - Provider Externe Non Supporte

### Scenario

Un service externe utilise un provider non configure.

### Comportement V1

- le systeme echoue proprement
- aucune confirmation locale n'est faite
- l'erreur reste visible

### Message Client

L'architecture est extensible, mais securisee par defaut.

### Risque Evite

- confirmation d'un provider non integre
- flux parallele non maitrise

## Cas 5 - Admin Reservations

### Scenario

L'equipe operationnelle consulte les reservations.

### Comportement V1

- affichage des statuts booking
- affichage des statuts paiement
- affichage des statuts provider
- affichage des erreurs externes
- affichage des references externes
- filtres et recherche operationnels

### Message Client

Le support peut comprendre rapidement ce qui s'est passe sur une reservation.

### Risque Evite

- investigation manuelle en base
- manque de visibilite sur les echecs provider
- support lent ou approximatif

## Cas 6 - Admin Partenaires

### Scenario

L'admin doit suivre ou modifier un partenaire.

### Comportement V1

- consultation des partenaires
- modification des informations operationnelles
- suspension/desactivation
- reservations liees consultables

### Message Client

L'exploitation quotidienne des partenaires devient possible depuis l'admin.

### Risque Evite

- dependance technique pour gerer les partenaires
- manque de controle operationnel

## Cas 7 - Profil Client

### Scenario

Un client modifie son profil.

### Comportement V1

- sauvegarde reelle en base
- champs supportes : nom, telephone, langue, devise preferee
- email garde sous controle
- erreurs de validation visibles

### Message Client

Le compte client n'est plus une interface factice, il persiste les informations utiles.

### Risque Evite

- fausse sauvegarde
- donnees client incoherentes
- mauvaise experience utilisateur

## Cas 8 - Historique Client

### Scenario

Un client consulte ses reservations.

### Comportement V1

- meilleure visibilite du paiement
- meilleure visibilite du provider
- visibilite remboursement
- visibilite expiration ou annulation checkout

### Message Client

Le client et le support voient un etat plus clair de chaque reservation.

### Risque Evite

- confusion client
- tickets support inutiles
- manque de tracabilite

## Cas 9 - Services Masques

### Scenario

Un service est desactive ou rendu indisponible.

### Comportement V1

- absent du listing public
- inaccessible via API publique
- page publique en `404`
- acces admin/owner maintenu quand necessaire

### Message Client

Un service retire du catalogue n'est plus expose au public.

### Risque Evite

- vente d'un service desactive
- indexation SEO parasite
- acces public par URL directe

## Cas 10 - Incident 500 Corrige

### Scenario

L'URL publique retournait `500 Server Error`.

### Cause

Redis etait passe en mode replica lecture seule.

### Correction

- Redis remis en `master`
- cache Laravel nettoye
- Redis limite a `127.0.0.1:6379`
- Postgres limite a `127.0.0.1:5432`
- homepage verifiee en `HTTP 200`

### Message Client

L'incident a ete corrige et la cause racine a ete securisee.

### Risque Evite

- panne recurrente par ecriture Redis refusee
- exposition publique inutile de Redis/Postgres

## Validations A Mentionner

- suite Laravel complete : `135 tests passed`, `567 assertions`
- `npm run lint:check` : OK
- `npm run types:check` : OK
- Redis : `master`
- homepage interne Nginx : `HTTP 200`
- Lot 6 : `DONE WITH KNOWN DEBT`

## Point A Ne Pas Survendre

Ne pas dire que toute la dette style globale est corrigee.

Formulation recommandee :

> La livraison fonctionnelle est validee. Une dette globale de formatage/style est documentee et sera traitee separement pour eviter de melanger un gros diff mecanique avec la livraison V1.

## Dette Connue

- `npm run format:check` echoue sur de nombreux fichiers frontend existants
- `pint --test --parallel` echoue sur une dette style PHP globale
- `composer test` et `composer run ci:check` ne sont pas executables tels quels dans l'environnement actuel sans binaire composer

## Suite Recommandee

1. Presenter la V1 au client sur les flows critiques.
2. Faire un smoke test post-presentation ou post-deploiement.
3. Traiter la dette format/style dans un commit separe.
4. Relancer une validation globale apres nettoyage style.

## Smoke Test De Demo

Avant la presentation, verifier rapidement :

1. homepage publique
2. recherche service
3. detail service disponible
4. service indisponible en `404`
5. login client
6. profil client sauvegarde
7. historique reservations
8. admin reservations
9. admin partenaires
10. paiement Stripe test ou demonstration du flux si environnement pret

