# README Produit

Vue produit de la plateforme Wandireo.

## Vision

Wandireo est une marketplace premium qui unifie en une seule experience:

- activites
- bateaux
- voitures
- hebergements

L'objectif produit est de proposer une recherche publique claire,
des fiches services lisibles, un parcours de reservation fluide
et des espaces internes adaptes a chaque role.

## Branding

- Marque: `Wandireo`
- Territoire: voyage, experiences, mobilite premium
- Palette: bleu lagon, turquoise, accent orange solaire
- Signature UX: surfaces premium, contraste net, dark mode bleute

## Parcours principaux

### Public / visiteur

- arrivee sur la home
- usage de la recherche unique `/recherche`
- segmentation par verticale dans l'interface
- consultation des fiches services
- lecture du blog
- acces au guide et pages d'information

### Client

- inscription ou connexion
- retour sur la home publique connecte
- favoris
- reservations
- dashboard client
- historique
- profil

### Partenaire

- inscription partenaire
- validation du compte
- dashboard partenaire si approuve
- catalogue
- reservations
- profil
- creation et edition de services

### Admin

- pilotage utilisateurs
- pilotage services
- structure des services
- moderation des avis
- transactions
- support center V1
- blog

## Surfaces produit

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
- `/admin/services/structure`
- `/admin/avis`
- `/admin/transactions`
- `/admin/support`
- `/admin/blog`

## Fonctionnalites en place

- home publique reliee a `/recherche`
- search hub unique avec segmentation par verticales
- cartes et filtres differencies par type
- redirection post-inscription vers la home publique
- theme `light / dark / system`
- blog public + edition admin
- support admin-only
- upload local de services stabilise
- creation admin de service sans partenaire obligatoire
- page guide publique `/guide`

## Internationalisation

Les 6 langues ciblees sont:

- FR
- PT
- EN
- ES
- IT
- DE

La base i18n est en place sur les surfaces principales. Une harmonisation
reste possible sur certains ecrans secondaires selon la recette finale.

## Support center V1

Le support de cette version est:

- admin-only
- interne
- base sur tickets
- sans soumission publique utilisateur

## Blog

Le module blog couvre:

- listing public
- lecture publique
- creation / edition admin
- brouillon / publication
- image de couverture

## Points de recette prioritaires

- home et recherche
- reservation et detail service
- connexion / inscription
- blog admin / public
- support admin
- creation / edition service
- coherence visuelle `light / dark / system`

## References

- [README.md](README.md)
- [README-developpeur.md](README-developpeur.md)
- [README-deploiement.md](README-deploiement.md)
