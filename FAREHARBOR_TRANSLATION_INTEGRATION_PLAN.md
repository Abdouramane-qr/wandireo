# Plan V1: Traduction UI Activites + Integration FareHarbor

## Objectif

Mettre en place une V1 FareHarbor orientee catalogue public, disponibilite temps reel et redirection externe vers la reservation partenaire.

Cette V1 ne passe pas par le tunnel local `panier -> commande -> paiement` pour les activites importees et couvre les 10 partenaires FareHarbor cibles :
`seafaris`, `buggy-adventure`, `momentosdinaminos`, `momentswatersports`, `ocean4fun`, `opheliacatamaran`, `pontadapiedadetours`, `portitours`, `tridenteboattrips`, `lagosboattours`.

Le besoin metier a garder comme reference est le suivant :

- telecharger les items FareHarbor de chaque partenaire et les stocker dans notre base
- disposer d'une fonction de resynchronisation par partenaire et globale
- verifier la disponibilite en appelant le calendrier FareHarbor a chaque tentative de booking
- rediriger ensuite l'utilisateur vers la reservation externe du partenaire

Comparaison avec les messages du `09/04/2026` et du `11/04/2026` :

- la liste des 10 partenaires du plan correspond exactement a la liste envoyee
- les endpoints `items`, `item detail` et `calendar monthly` cites dans les messages sont bien ceux implementes cote code
- le cas prix `deposit only` decrit dans le message du `11/04/2026` est bien le cas produit retenu dans ce document

## Ce qui est appele via les endpoints

### Endpoints FareHarbor externes verifies

Les activites et disponibilites sont recuperees par [`FareHarborClient.php`](/var/www/wandireo-api/app/Services/FareHarbor/FareHarborClient.php) via ces endpoints upstream :

- `GET /companies/{companySlug}/items/`
  Utilise par `listItems()` pour recuperer le catalogue d'un partenaire.
- `GET /companies/{companySlug}/items/{itemId}/`
  Utilise par `getItem()` pour recuperer le detail d'une activite.
- `GET /companies/{companySlug}/items/{itemId}/calendar/{year}/{month}/`
  Utilise par `getCalendar()` pour recuperer la disponibilite mensuelle de l'item concerne.

La sequence metier a retenir est :

1. appeler `GET /companies/{nom_du_partenaire}/items/` pour recuperer les items d'un partenaire
2. recuperer l'identifiant de chaque item depuis cette liste
3. appeler `GET /companies/{nom_du_partenaire}/items/{id_de_litem}/` pour enrichir chaque activite avec ses details, photos et descriptions
4. appeler `GET /companies/{nom_du_partenaire}/items/{id_item}/calendar/{annee}/{mois}/` pour lire les disponibilites de l'activite concernee

Le endpoint calendrier a bien la forme metier attendue :
`https://fareharbor.com/api/v1/companies/{nom_du_partenaire}/items/{id_item}/calendar/{annee}/{mois}/`

### Flux reel cote backend

#### Sync catalogue

Le service [`FareHarborSyncService.php`](/var/www/wandireo-api/app/Services/FareHarbor/FareHarborSyncService.php) suit ce flux :

1. `FareHarborClient::listItems(companySlug)`
2. Pour chaque item:
   `FareHarborClient::getItem(companySlug, itemId)` si `sync_details_enabled = true`
3. Mapping dans `services` avec:
    - `source_type = EXTERNAL`
    - `source_provider = FAREHARBOR`
    - `source_external_id = <companySlug>:<itemId>`
4. Stockage du brut et des donnees utiles dans `extra_data.fareharbor`
5. Marquage des services absents du flux comme indisponibles localement

Conclusion fonctionnelle :
les items sont bien telecharges depuis FareHarbor puis enregistres dans notre base locale `services`, avec une cle d'unicite par partenaire + item via `source_external_id = <companySlug>:<itemId>`.

#### Disponibilite

Le controleur [`AvailabilityController.php`](/var/www/wandireo-api/app/Http/Controllers/Api/AvailabilityController.php) fait une bifurcation claire :

- service local:
  resolution via `AvailabilityResolver`
- service FareHarbor:
  resolution via `FareHarborAvailabilityService::forService()`

Le service [`FareHarborAvailabilityService.php`](/var/www/wandireo-api/app/Services/FareHarbor/FareHarborAvailabilityService.php) appelle le calendrier mensuel FareHarbor sur les mois necessaires dans la fenetre glissante des 30 prochains jours, puis normalise la reponse au format attendu par le frontend :

- `id`
- `service_id`
- `date`
- `slots[] = { startTime, maxCapacity }`

## Endpoints internes verifies

### API publique

Ces routes sont bien presentes dans [`api.php`](/var/www/wandireo-api/routes/api.php) :

- `GET /api/services`
  Liste les services, y compris les activites FareHarbor importees.
- `GET /api/services/{id}`
  Retourne la fiche detail.
- `GET /api/availability?serviceId=<id>`
  Retourne les disponibilites.
  Pour un service FareHarbor, la route proxifie vers le calendrier FareHarbor via le backend local.

### API admin FareHarbor

Les routes admin exposees sont :

- `GET /api/fareharbor/companies`
  Liste les societes FareHarbor configurees.
- `POST /api/fareharbor/companies`
  Cree une configuration partenaire.
- `PATCH /api/fareharbor/companies/{id}`
  Met a jour une configuration.
- `POST /api/fareharbor/companies/{id}/partner-account`
  Cree et rattache un compte partenaire interne.
- `POST /api/fareharbor/companies/{id}/sync`
  Lance une sync catalogue pour un partenaire.
- `POST /api/fareharbor/companies/sync-all`
  Lance une sync globale.

Ces endpoints sont implementes dans [`FareHarborCompanyController.php`](/var/www/wandireo-api/app/Http/Controllers/Api/FareHarborCompanyController.php).

### Commandes console verifiees

Les commandes artisan presentes dans [`console.php`](/var/www/wandireo-api/routes/console.php) sont :

- `php artisan fareharbor:sync {companySlug?}`
- `php artisan fareharbor:sync-all`
- `php artisan fareharbor:bootstrap-companies`
- `php artisan fareharbor:bootstrap-companies --sync`
- `php artisan fareharbor:bootstrap-companies --create-partners`

Ces commandes couvrent bien le besoin "avoir une fonction pour resynchroniser" :

- resync d'un partenaire donne
- resync globale de tous les partenaires actifs
- bootstrap de la liste V1 puis sync optionnelle

## Mapping de donnees retenu

Les activites FareHarbor restent stockees dans `services`, sans table miroir `items`.

### Champs de base

- `category = ACTIVITE`
- `partner_id = fareharbor_companies.partner_id` si la societe FareHarbor est rattachee
- `source_type = EXTERNAL`
- `source_provider = FAREHARBOR`
- `source_external_id = <companySlug>:<itemId>`
- `last_synced_at = now()`

### Champs FareHarbor en `extra_data.fareharbor`

- `company`
- `itemId`
- `bookingUrl`
- `headline`
- `shortDescription`
- `meetingPoint`
- `duration`
- `images`
- `calendarTimezone`
- `raw`

## Comportement produit et frontend

### Ce qui doit apparaitre cote public

- Les activites FareHarbor apparaissent dans la recherche publique.
- La fiche detail affiche la source externe FareHarbor.
- La disponibilite est lue en temps reel via `GET /api/availability`.
- Le CTA principal doit rediriger vers `extra_data.fareharbor.bookingUrl`.
- Au moment ou l'utilisateur veut reserver, la disponibilite doit etre revalidee contre le calendrier FareHarbor et non contre un stock local.

### Gestion partenaire et edition admin

Les societes FareHarbor doivent aussi couvrir ce besoin d'exploitation :

- rattacher chaque societe FareHarbor a un compte partenaire interne
- propager ce partenaire sur les activites synchronisees
- pouvoir creer le compte partenaire en meme temps que la societe FareHarbor ou apres coup
- pouvoir modifier un item FareHarbor depuis sa page admin sans perdre les retouches lors de la sync suivante

La regle d'implementation retenue est :

- le rattachement se fait au niveau `fareharbor_companies.partner_id`
- les activites importees heritent automatiquement de ce `partner_id`
- les retouches admin sont stockees dans `extra_data.fareharbor.overrides`
- la sync garde la source provider a jour tout en preservant ces overrides locaux

Comptes partenaires actuellement rattaches aux 10 societes FareHarbor :

- `buggy-adventure` -> `fareharbor+buggy-adventure@partners.wandireo.local`
- `lagosboattours` -> `fareharbor+lagosboattours@partners.wandireo.local`
- `momentosdinaminos` -> `fareharbor+momentosdinaminos@partners.wandireo.local`
- `momentswatersports` -> `fareharbor+momentswatersports@partners.wandireo.local`
- `ocean4fun` -> `fareharbor+ocean4fun@partners.wandireo.local`
- `opheliacatamaran` -> `fareharbor+opheliacatamaran@partners.wandireo.local`
- `pontadapiedadetours` -> `fareharbor+pontadapiedadetours@partners.wandireo.local`
- `portitours` -> `fareharbor+portitours@partners.wandireo.local`
- `seafaris` -> `fareharbor+seafaris-3@partners.wandireo.local`
- `tridenteboattrips` -> `fareharbor+tridenteboattrips@partners.wandireo.local`

Note d'exploitation :

- les mots de passe temporaires ne sont pas conserves en base et ne peuvent donc pas etre reconstitues depuis ce document
- `seafaris` pointe actuellement vers `fareharbor+seafaris-3@partners.wandireo.local` car deux comptes placeholder plus anciens existaient deja

### Affichage prix FareHarbor quand le total n'est pas fourni

Certaines reponses FareHarbor ne donnent pas le prix total de l'activite, mais exposent une caution ou un acompte de reservation. Le cas metier a supporter est :

- `is_deposit_required = true`
- `deposit_offset = 5000`
- `processor_currency = eur`

Dans ce cas, la V1 doit suivre ces regles d'affichage :

- ne pas inventer de prix total
- afficher explicitement que le total n'est pas communique par le partenaire
- mettre en avant la caution connue, par exemple `Caution de 50,00 EUR requise`
- rappeler que le montant final est confirme sur le site partenaire

Le mapping frontend/backend retenu est :

- `extra_data.fareharbor.isDepositRequired`
- `extra_data.fareharbor.depositAmount`
- `extra_data.fareharbor.depositAmountEur`
- `extra_data.fareharbor.processorCurrency`
- `extra_data.fareharbor.priceStatus = KNOWN | DEPOSIT_ONLY | UNKNOWN`

Comportement attendu :

- `KNOWN` : afficher le prix habituel
- `DEPOSIT_ONLY` : afficher `Total non communique` + la caution connue
- `UNKNOWN` : afficher le fallback partenaire sans montant

Robustesse frontend attendue :

- si `priceStatus` n'est pas renseigne mais que FareHarbor expose `is_deposit_required = true` et `deposit_offset > 0`, le frontend doit quand meme afficher l'etat `DEPOSIT_ONLY`
- cette regle doit s'appliquer sur la homepage, les cartes de la page activites et la fiche detail

### Ce qui ne passe pas par le tunnel local

Pour les services FareHarbor, la V1 ne doit pas proposer :

- ajout au panier
- checkout local
- paiement Stripe local
- confirmation locale de reservation

Les routes locales `POST /api/bookings/init` et `POST /api/bookings/confirm` restent reservees aux services locaux.

## Etat reel de l'implementation a garder coherent

### Points deja alignes avec le code

- sync catalogue par partenaire et globale
- stockage des societes FareHarbor cote admin
- creation et rattachement d'un compte partenaire FareHarbor cote admin
- import dans `services`
- assignation des activites importe es au partenaire rattache quand il existe
- disponibilite proxifiee via l'API locale
- normalisation du flag `isExternalRedirect` cote frontend
- edition admin des items FareHarbor avec persistance des overrides apres resync

### Point d'attention

Le plan produit parle d'une logique "redirection externe" et "pas de paiement local", ce qui est coherent avec l'UX attendue.

En revanche, dans le mapping courant de [`FareHarborSyncService.php`](/var/www/wandireo-api/app/Services/FareHarbor/FareHarborSyncService.php), les valeurs persistees doivent rester explicitement alignees sur la redirection externe :

- `payment_mode = EXTERNAL_REDIRECT`
- `booking_mode = EXTERNAL_REDIRECT`

Si l'interface depend directement de ces champs, il faut verifier qu'ils n'ouvrent pas par erreur un parcours local au lieu d'une redirection externe.

## Etat actuel : fait / reste / risques

### Fait

- Les 10 partenaires FareHarbor V1 sont definis.
- Les endpoints FareHarbor `items`, `item detail` et `calendar` sont integres cote backend.
- Les items sont importes dans la table `services`.
- Chaque activite FareHarbor est identifiee de facon unique par `source_external_id = <companySlug>:<itemId>`.
- Les details utiles sont stockes dans `extra_data.fareharbor`.
- Une resynchronisation existe par partenaire.
- Une resynchronisation globale existe.
- Les societes FareHarbor sont gerees cote admin.
- La disponibilite publique d'un service FareHarbor est lue via le calendrier FareHarbor.
- Les services FareHarbor sont exposes dans les endpoints publics `/api/services`, `/api/services/{id}` et `/api/availability`.
- Le frontend reconnait les services FareHarbor comme des services externes.
- La fiche detail affiche un CTA de redirection vers `bookingUrl`.
- Le tunnel de booking local est bloque pour les services FareHarbor.

### Reste

- Mettre en place un auto-sync planifie si l'objectif est d'avoir une synchronisation reguliere sans action manuelle.
- Decider si une revalidation supplementaire de disponibilite doit etre faite juste avant la redirection utilisateur.
- Verifier si le frontend ou d'autres regles metier dependent encore de `payment_mode` et `booking_mode` pour eviter tout faux parcours local.
- Executer les tests dans un environnement ou `php` est disponible pour valider le fonctionnement reel de bout en bout.
- Finaliser les derniers ajustements visuels responsive si d'autres ecrans activites hors carte/detail doivent etre harmonises.

### Risques / points d'attention

- Le frontend ne doit pas regresser en se remettant a lire uniquement `clientPrice` comme si FareHarbor fournissait toujours un total.
- La disponibilite FareHarbor est actuellement normalisee sur une fenetre glissante de 30 jours, pas sur une navigation libre par mois exposee au frontend.
- Sans scheduler, la fraicheur du catalogue depend des resync manuelles ou admin.
- Ici, la presence des tests a ete verifiee, mais pas leur execution effective dans cet environnement.

### Responsive activites a maintenir propre

Le responsive a surveiller en priorite sur cette integration concerne :

- les cartes activites dans les listings publics
- le panneau de reservation externe de `ServiceDetailPage`

Contraintes d'affichage retenues :

- en mobile, le footer des cartes doit passer en pile verticale
- le bloc prix doit rester lisible sans collision avec le CTA
- si `priceStatus = DEPOSIT_ONLY`, la ligne de caution doit rester visible sans debordement
- sur la fiche detail, le panneau FareHarbor doit afficher une hierarchie claire :
  - statut prix
  - caution
  - note explicative
  - CTA externe

## Plan de verification

### Import

- verifier qu'un `source_provider + source_external_id` met bien a jour l'existant sans doublon
- verifier que deux partenaires avec le meme `itemId` restent distincts via `source_external_id = <companySlug>:<itemId>`
- verifier qu'une activite retiree du flux FareHarbor passe en indisponible localement

### Disponibilite

- verifier que `GET /api/availability?serviceId=<id>` renvoie bien des creneaux normalises pour un service FareHarbor
- verifier qu'une erreur provider retourne `[]` sans casser les services locaux
- verifier que la disponibilite au moment du booking repose toujours sur le calendrier FareHarbor
- verifier qu'aucune disponibilite locale mise en cache ne remplace le controle upstream au moment de la reservation

### Frontend

- verifier que `SearchPage` montre les activites FareHarbor comme des services standards
- verifier que `ServiceDetailPage` montre la source externe et le CTA de redirection
- verifier qu'aucun acces au panier ou au checkout n'est visible pour ces services
- verifier que le mode `DEPOSIT_ONLY` affiche bien `total non communique` + la caution connue
- verifier qu'en mobile les cartes activites et le panneau detail FareHarbor n'ont aucun debordement horizontal

### Admin

- verifier que `fareharbor:bootstrap-companies` cree ou met a jour les 10 partenaires V1 sans doublon
- verifier la creation et la mise a jour des societes FareHarbor
- verifier la creation automatique d'un compte partenaire FareHarbor
- verifier que les activites synces recuperent bien le `partner_id` de leur societe FareHarbor
- verifier le lancement de sync unitaire et globale
- verifier l'affichage de `last_status`, `last_synced_at` et `last_error`
- verifier qu'une modification admin d'un item FareHarbor est toujours presente apres une nouvelle sync

## Resume decisionnel

Les activites FareHarbor sont bien appelees a travers trois endpoints upstream :

- `items`
- `item detail`
- `calendar monthly`

Puis elles sont exposees localement a travers :

- `GET /api/services`
- `GET /api/services/{id}`
- `GET /api/availability?serviceId=<id>`
- les endpoints admin `/api/fareharbor/companies*`

Le document est maintenant aligne sur l'implementation reelle du repo et structure pour etre lisible sans bruit visuel inutile.
