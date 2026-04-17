# Plan d'audit et de correction FR page par page

## Objectif

Faire un audit approfondi de tout le périmètre `resources/js/pages/wdr-pages` pour détecter et corriger les fautes d'orthographe, de grammaire, de ponctuation, d'accents, de casse et de cohérence rédactionnelle du français visible côté utilisateur.

## Périmètre

- Pages WDR uniquement
- Français visible uniquement
- UI courte et contenus longs, y compris marketing, FAQ et textes juridiques affichés dans ce périmètre

## Méthode d'audit

1. Faire un inventaire page par page des sources de texte visibles :
   - texte en dur dans les pages WDR
   - texte injecté via `resources/js/hooks/useTranslation.tsx`
   - copies locales embarquées dans certaines pages comme `ConfirmationPage`
2. Classer les anomalies par type :
   - orthographe
   - accents, apostrophes, encodage
   - grammaire, accords, pluriels
   - ponctuation, espaces, capitalisation
   - terminologie produit incohérente
   - formulations maladroites ou non naturelles
3. Corriger ensuite par lots de pages, dans cet ordre :
   - lot 1 : pages transactionnelles à fort impact
   - lot 2 : auth et compte
   - lot 3 : partner et admin
   - lot 4 : contenus et pages statiques

## Lots de travail

### Lot 1 : transactionnel

- `CheckoutPage`
- `CartPage`
- `ConfirmationPage`
- `ServiceDetailPage`
- `SearchPage`

### Lot 2 : auth et compte

- `LoginPage`
- `RegisterPage`
- `ForgotPasswordPage`
- `DashboardPage`
- `ProfilePage`
- `FavoritesPage`
- `BookingsHistoryPage`

### Lot 3 : partner et admin

- `PartnerDashboardPage`
- `PartnerCatalogPage`
- `PartnerServiceFormPage`
- `PartnerBookingsPage`
- `PartnerProfilePage`
- `PartnerPendingPage`
- `AdminDashboardPage`
- `AdminServicesPage`
- `AdminServiceStructurePage`
- `AdminTransactionsPage`
- `AdminUsersPage`
- `AdminReviewsPage`
- `AdminBlogPage`
- `AdminBlogEditorPage`

### Lot 4 : contenus et statiques

- `HomePage`
- `GuidePage`
- `BlogPage`
- `BlogPostPage`
- `LegalPage`
- `PrivacyPage`
- `TermsPage`
- `NotFoundPage`
- `PaymentPage`

## Règles de correction

- Corriger uniquement le texte visible utilisateur en français
- Ne pas modifier les valeurs métier, identifiants, slugs, noms de variables ni types techniques
- Conserver le ton existant de chaque page
- Normaliser les apostrophes, accents, espaces de ponctuation et la capitalisation quand cela améliore la cohérence
- Pour les textes longs, corriger aussi les formulations lourdes ou peu naturelles sans réécrire le fond
- Si une chaîne FR est dupliquée, corriger la source la plus réutilisable en priorité, donc `useTranslation.tsx` quand c'est possible

## Livrable attendu

- Un audit page par page listant les fautes détectées et les corrections prévues
- Une passe de correction par lots, avec validation après chaque lot
- Un résumé final contenant :
  - les pages traitées
  - les types de fautes corrigées
  - les restes assumés hors périmètre
  - la confirmation des checks de format et de type

## Validation

À la fin de chaque lot :

- relire les chaînes modifiées dans le contexte de la page
- exécuter `prettier --check` sur les fichiers touchés
- exécuter `git diff --check`
- en fin de chantier, exécuter `npm run types:check`

## Hypothèses

- On ne complète pas les locales `en`, `pt`, `es`, `it`, `de` dans cette passe
- On n'audite pas les commentaires développeur ni la documentation interne
- Les noms propres de villes, marques et lieux ne sont pas corrigés sauf faute manifeste
- Les copies déjà multilingues hors FR ne sont pas retravaillées maintenant, sauf si une erreur FR bloque la cohérence d'une page WDR

## Exécution en cours

### Lot 1 : transactionnel

- `CheckoutPage` : relue, copie locale FR validée
- `CartPage` : corrigée
- `ConfirmationPage` : corrigée
- `ServiceDetailPage` : corrigée
- `SearchPage` : corrigée

### Lot 2 : auth et compte

- `LoginPage` : relue, chaînes FR centralisées validées
- `RegisterPage` : relue, chaînes FR centralisées validées
- `ForgotPasswordPage` : corrigée
- `DashboardPage` : relue, chaînes FR centralisées validées
- `ProfilePage` : corrigée
- `FavoritesPage` : relue, chaînes FR centralisées validées
- `BookingsHistoryPage` : corrigée

### Lot 3 : partner et admin

- `PartnerDashboardPage` : corrigée, reliquats FR en dur finalisés
- `PartnerCatalogPage` : corrigée
- `PartnerServiceFormPage` : corrigée
- `PartnerBookingsPage` : corrigée
- `PartnerProfilePage` : relue, pas de correction FR visible supplémentaire requise
- `PartnerPendingPage` : relue, chaînes FR centralisées validées
- `AdminDashboardPage` : corrigée
- `AdminServicesPage` : corrigée
- `AdminServiceStructurePage` : corrigée
- `AdminTransactionsPage` : corrigée
- `AdminUsersPage` : corrigée
- `AdminReviewsPage` : relue, chaînes FR centralisées validées
- `AdminBlogPage` : relue, chaînes FR centralisées validées
- `AdminBlogEditorPage` : relue, chaînes FR centralisées validées

### Lot 4 : contenus et statiques

- `HomePage` : corrigée
- `GuidePage` : corrigée
- `BlogPage` : corrigée
- `BlogPostPage` : corrigée
- `LegalPage` : corrigée
- `PrivacyPage` : corrigée
- `TermsPage` : corrigée
- `NotFoundPage` : relue, copie FR validée
- `PaymentPage` : relue, copie locale FR validée

## Résumé intermédiaire

- Pages corrigées : `CartPage`, `ConfirmationPage`, `ServiceDetailPage`, `SearchPage`, `ForgotPasswordPage`, `ProfilePage`, `BookingsHistoryPage`, `PartnerDashboardPage`, `PartnerCatalogPage`, `PartnerServiceFormPage`, `PartnerBookingsPage`, `AdminDashboardPage`, `AdminServicesPage`, `AdminServiceStructurePage`, `AdminTransactionsPage`, `AdminUsersPage`, `HomePage`, `GuidePage`, `BlogPage`, `BlogPostPage`, `LegalPage`, `PrivacyPage`, `TermsPage`
- Pages relues et validées sans correction FR visible supplémentaire : `CheckoutPage`, `LoginPage`, `RegisterPage`, `DashboardPage`, `FavoritesPage`, `PartnerProfilePage`, `PartnerPendingPage`, `AdminReviewsPage`, `AdminBlogPage`, `AdminBlogEditorPage`, `NotFoundPage`, `PaymentPage`
- Types de fautes corrigées : accents, apostrophes, espaces de ponctuation, capitalisation, accords, libellés produit, formulations FR trop littérales
- Hors périmètre assumé : commentaires développeur, autres locales, contenus non visibles utilisateur
- Checks effectués : `prettier --check` OK, `git diff --check` OK, `npm run types:check` OK
