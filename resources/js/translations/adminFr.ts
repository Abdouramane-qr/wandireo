export function buildAdminFrTranslations(): Record<string, string> {
    return {
        // Admin Dashboard
        "admin.dashboard.title": "Administration",
        "admin.dashboard.subtitle":
            "Suivez les indicateurs clés, les réservations récentes et l'état opérationnel de la plateforme.",
        "admin.dashboard.logout": "Déconnexion",
        "admin.dashboard.badge": "Pilotage",
        "admin.dashboard.avatar_label": "Avatar administrateur",
        "admin.dashboard.recent.title": "Dernières réservations",
        "admin.dashboard.recent.view_all": "Tout voir",
        "admin.dashboard.recent.aria": "Liste des transactions récentes",
        "admin.dashboard.table.id": "ID",
        "admin.dashboard.table.client": "Client",
        "admin.dashboard.table.partner": "Partenaire",
        "admin.dashboard.table.amount": "Total",
        "admin.dashboard.table.commission": "Commission",
        "admin.dashboard.table.status": "Statut",
        "admin.dashboard.external_status": "Statut externe",
        "admin.dashboard.status.pending": "En attente",
        "admin.dashboard.status.confirmed": "Confirmée",
        "admin.dashboard.status.cancelled": "Annulée",
        "admin.dashboard.shortcuts.title": "Accès rapides",
        "admin.dashboard.shortcuts.catalog": "Catalogue",
        "admin.dashboard.shortcuts.catalog_sub": "Gérer les services",
        "admin.dashboard.shortcuts.partners": "Partenaires",
        "admin.dashboard.shortcuts.partners_sub": "Modération comptes",
        "admin.dashboard.shortcuts.reviews": "Avis",
        "admin.dashboard.shortcuts.reviews_sub": "Modération avis",
        "admin.dashboard.shortcuts.transactions": "Finances",

        // Admin Blog
        "admin.blog.title": "Gestion du Blog",
        "admin.blog.home": "Tous les articles",
        "admin.blog.new": "Nouvel article",
        "admin.blog.edit": "Modifier l'article",
        "admin.blog.admin": "Administration Blog",
        "admin.blog.all": "Tous les articles",
        "admin.blog.published": "Publiés",
        "admin.blog.drafts": "Brouillons",
        "admin.blog.empty": "Aucun article trouvé.",
        "admin.blog.column.title": "Titre",
        "admin.blog.column.status": "Statut",
        "admin.blog.column.date": "Date",
        "admin.blog.column.tags": "Tags",
        "admin.blog.status.draft": "Brouillon",
        "admin.blog.delete_aria": "Supprimer l'article",

        // Blog Editor
        "admin.blog.editor.new": "Rédiger un article",
        "admin.blog.editor.edit": "Édition de l'article",
        "admin.blog.editor.edit_tab": "Édition",
        "admin.blog.editor.preview_tab": "Prévisualisation",
        "admin.blog.editor.title": "Titre de l'article",
        "admin.blog.editor.slug": "URL de l'article (slug)",
        "admin.blog.editor.excerpt": "Résumé / Extrait",
        "admin.blog.editor.content": "Corps de l'article (Markdown)",
        "admin.blog.editor.author": "Auteur",
        "admin.blog.editor.status": "Statut",
        "admin.blog.editor.tags_hint": "Séparez les tags par des virgules",
        "admin.blog.editor.cover": "Image de couverture",
        "admin.blog.editor.cover_uploading": "Téléchargement...",
        "admin.blog.editor.cover_success": "Image téléchargée",
        "admin.blog.editor.cover_error": "Erreur téléchargement",
        "admin.blog.editor.cover_hint": "Format recommandé : 1200x630px",
        "admin.blog.editor.cover_remove": "Supprimer l'image",
        "admin.blog.editor.placeholder.preview":
            "La prévisualisation s'affichera ici...",
        "admin.blog.editor.actions.save": "Enregistrer",
        "admin.blog.editor.actions.save_draft": "Enregistrer en brouillon",
        "admin.blog.editor.actions.publish": "Publier l'article",
        "admin.blog.editor.actions.update": "Mettre à jour",
        "admin.blog.editor.actions.back": "Retour",
        "admin.blog.editor.actions.saving": "Enregistrement...",
        "admin.blog.editor.actions.uploading": "Téléchargement...",

        "admin.blog.editor.error.title": "Le titre est obligatoire.",
        "admin.blog.editor.error.slug": "Le slug est obligatoire.",
        "admin.blog.editor.error.excerpt": "Le résumé est obligatoire.",
        "admin.blog.editor.error.content": "Le contenu est obligatoire.",
        "admin.blog.editor.error.fr_title_required_publish":
            "Le titre FR est obligatoire avant publication.",
        "admin.blog.editor.error.fr_excerpt_required_publish":
            "Le résumé FR est obligatoire avant publication.",
        "admin.blog.editor.error.fr_content_required_publish":
            "Le contenu FR est obligatoire avant publication.",
        "admin.blog.editor.validate_error":
            "Veuillez vérifier les erreurs du formulaire.",
        "admin.blog.editor.toolbar.bold": "Gras",
        "admin.blog.editor.toolbar.italic": "Italique",
        "admin.blog.editor.toolbar.heading1": "Titre 1",
        "admin.blog.editor.toolbar.heading2": "Titre 2",
        "admin.blog.editor.toolbar.list": "Liste",
        "admin.blog.editor.toolbar.ordered_list": "Liste ordonnée",
        "admin.blog.editor.toolbar.quote": "Citation",
        "admin.blog.editor.toolbar.link": "Lien",
        "admin.blog.editor.toolbar.image": "Image",
        "admin.users.field.contract_placeholder":
            "storage/contracts/mandat.pdf",
        "admin.users.field.stripe_placeholder": "acct_...",

        "admin.blog.toast.publish": "Article publié !",
        "admin.blog.toast.unpublish": "Article passé en brouillon.",
        "admin.blog.toast.save_success_create": "Article créé avec succès.",
        "admin.blog.toast.save_success_update": "Article mis à jour.",
        "admin.blog.toast.save_error": "Erreur lors de l'enregistrement.",
        "admin.blog.toast.delete_success": "Article supprimé.",
        "admin.blog.toast.delete_error": "Erreur lors de la suppression.",
        "admin.blog.toast.status_error": "Erreur lors du changement de statut.",

        // Admin Reviews
        "admin.reviews.title": "Modération des avis",
        "admin.reviews.subtitle":
            "Relisez, validez ou rejetez les avis clients avant leur mise en ligne.",
        "admin.reviews.badge": "Avis",
        "admin.reviews.search": "Rechercher un avis...",
        "admin.reviews.empty": "Aucun avis à modérer.",
        "admin.reviews.rating": "Note",
        "admin.reviews.approve": "Approuver",
        "admin.reviews.reject": "Rejeter",
        "admin.reviews.delete": "Supprimer",
        "admin.reviews.delete_confirm": "Supprimer définitivement cet avis ?",
        "admin.reviews.all_statuses": "Tous les statuts",
        "admin.reviews.pending": "En attente",
        "admin.reviews.status.pending": "En attente",
        "admin.reviews.status.approved": "Approuvé",
        "admin.reviews.status.rejected": "Rejeté",
        "admin.reviews.pending_count": "{count} en attente",
        "admin.reviews.approved_count": "{count} approuvés",
        "admin.reviews.rejected_count": "{count} rejetés",
        "admin.reviews.back": "Retour",
        "admin.reviews.unknown_partner": "Partenaire inconnu",
        "admin.reviews.unknown_user": "Utilisateur",
        "admin.reviews.update_success": "Statut de l'avis mis à jour.",
        "admin.reviews.update_error":
            "Erreur lors de la mise à jour de l'avis.",
        "admin.reviews.delete_success": "Avis supprimé.",
        "admin.reviews.delete_error":
            "Erreur lors de la suppression de l'avis.",

        // Admin Users
        "admin.users.badge": "Comptes",
        "admin.users.title": "Gestion des utilisateurs",
        "admin.users.subtitle":
            "Pilotez les comptes clients, partenaires et administrateurs de la plateforme.",
        "admin.users.hero.partners_count": "{count} partenaires",
        "admin.users.hero.clients_count": "{count} clients",
        "admin.users.hero.admins_count": "{count} administrateurs",
        "admin.users.search_partner": "Rechercher un partenaire...",
        "admin.users.create_user": "Créer un compte",
        "admin.users.export_csv": "Exporter CSV",
        "admin.users.metric.volume": "Volume",
        "admin.users.metric.commission": "Commission",
        "admin.users.metric.partner_net": "Net partenaire",
        "admin.users.metric.bookings": "Réservations",
        "admin.users.folder": "Suivi admin",
        "admin.users.contract_prefix": " · Contrat : ",
        "admin.users.stripe_id": "ID Stripe",
        "admin.users.stripe_missing": "Non connecté",
        "admin.users.contract_file": "Fichier contrat : {path}",
        "admin.users.admin_validation": "Validation admin : {date}",
        "admin.users.contract_signature": "Signature contrat : {date}",
        "admin.users.reason": "Motif : {reason}",
        "admin.users.quick.approve": "Approuver",
        "admin.users.quick.approve_success": "Partenaire approuvé.",
        "admin.users.quick.contract_signed": "Marquer signé",
        "admin.users.quick.contract_signed_confirm":
            "Confirmer que ce contrat a bien été signé ?",
        "admin.users.quick.contract_signed_success":
            "Contrat marqué comme signé.",
        "admin.users.quick.suspend": "Suspendre",
        "admin.users.quick.suspend_success": "Partenaire suspendu.",
        "admin.users.edit": "Modifier",
        "admin.users.not_provided": "Non renseigné",
        "admin.users.filter.all_statuses": "Tous les statuts",
        "admin.users.filter.pending": "En attente",
        "admin.users.filter.approved": "Approuvés",
        "admin.users.filter.rejected": "Rejetés",
        "admin.users.filter.suspended": "Suspendus",
        "admin.users.partner_status.pending": "En attente",
        "admin.users.partner_status.approved": "Approuvé",
        "admin.users.partner_status.rejected": "Rejeté",
        "admin.users.partner_status.suspended": "Suspendu",
        "admin.users.contract_status.not_sent": "Non envoyé",
        "admin.users.contract_status.pending_signature": "Signature en attente",
        "admin.users.contract_status.signed": "Signé",
        "admin.users.contract_status.rejected": "Refusé",
        "admin.users.table.name": "Nom",
        "admin.users.table.email": "Email",
        "admin.users.table.language": "Langue",
        "admin.users.table.currency": "Devise",
        "admin.users.table.bookings": "Réservations",
        "admin.users.table.reviews": "Avis",
        "admin.users.table.permissions": "Permissions",
        "admin.users.table.action": "Action",
        "admin.users.modal.partner_title": "Modifier {name}",
        "admin.users.modal.user_title": "Modifier {name}",
        "admin.users.modal.create_title": "Créer un compte",
        "admin.users.field.commission": "Commission (%)",
        "admin.users.field.partner_status": "Statut partenaire",
        "admin.users.field.contract_status": "Statut du contrat",
        "admin.users.field.stripe_account": "Compte Stripe Connect",
        "admin.users.field.business_address": "Adresse professionnelle",
        "admin.users.field.contract": "Contrat",
        "admin.users.field.open_current_contract": "Ouvrir le contrat actuel",
        "admin.users.field.contract_hint":
            "Validation admin : {validated} · Signature : {signed}",
        "admin.users.field.upload_contract_pdf": "Téléverser un contrat PDF",
        "admin.users.field.upload_pdf": "Téléverser le PDF",
        "admin.users.field.uploading": "Téléversement...",
        "admin.users.field.reset": "Réinitialiser",
        "admin.users.field.reason": "Motif",
        "admin.users.placeholder.first_name": "Prénom",
        "admin.users.placeholder.last_name": "Nom",
        "admin.users.placeholder.email": "Email",
        "admin.users.placeholder.initial_password": "Mot de passe initial",
        "admin.users.placeholder.language": "Langue",
        "admin.users.placeholder.preferred_currency": "Devise préférée",
        "admin.users.placeholder.company": "Société",
        "admin.users.placeholder.phone": "Téléphone",
        "admin.users.placeholder.commission": "Commission (%)",
        "admin.users.section.account_type": "Type de compte",
        "admin.users.section.identity": "Identité",
        "admin.users.section.account": "Compte",
        "admin.users.section.profile": "Profil",
        "admin.users.section.partner_settings": "Paramètres partenaire",
        "admin.users.section.partner_copy":
            "Configurez le statut, la commission et le contrat dès la création.",
        "admin.users.role.partner": "Partenaire",
        "admin.users.role.client": "Client",
        "admin.users.role.admin": "Administrateur",
        "admin.users.create_intro":
            "Créez un compte interne ou partenaire sans passer par l’inscription publique.",
        "admin.users.create_account": "Créer le compte",
        "admin.users.creating": "Création...",
        "admin.users.cancel": "Annuler",
        "admin.users.save": "Enregistrer",
        "admin.users.saving": "Enregistrement...",
        "admin.users.toast.partner_updated": "Partenaire mis à jour.",
        "admin.users.toast.partner_update_error":
            "Erreur lors de la mise à jour du partenaire.",
        "admin.users.toast.account_updated": "Compte mis à jour.",
        "admin.users.toast.account_update_error":
            "Erreur lors de la mise à jour du compte.",
        "admin.users.toast.contract_uploaded": "Contrat téléversé.",
        "admin.users.toast.contract_upload_error":
            "Erreur lors du téléversement du contrat.",
        "admin.users.toast.account_created": "Compte créé.",
        "admin.users.toast.account_create_error":
            "Erreur lors de la création du compte.",
        "admin.users.toast.quick_action_error":
            "Erreur lors de l'action rapide.",
        "admin.users.error.commission_range":
            "La commission doit être comprise entre 20 et 30%.",
        "admin.users.error.stripe_prefix":
            "L'identifiant Stripe doit commencer par acct_.",
        "admin.users.error.general_required":
            "Prénom, nom et email sont obligatoires.",
        "admin.users.error.pdf_required":
            "Veuillez sélectionner un fichier PDF.",
        "admin.users.error.create_required":
            "Prénom, nom, email et mot de passe sont obligatoires.",
        "admin.users.error.company_required":
            "Le nom de la société est obligatoire pour un partenaire.",
        "admin.users.csv.company": "société",
        "admin.users.csv.first_name": "prénom",
        "admin.users.documents.title": "{count} documents partenaires",
        "admin.users.documents.subtitle":
            "Contrôlez les justificatifs envoyés par les partenaires avant validation administrative.",
        "admin.users.documents.all_statuses": "Tous les statuts",
        "admin.users.documents.empty": "Aucun document partenaire trouvé.",
        "admin.users.documents.unknown_partner": "Partenaire inconnu",
        "admin.users.documents.file": "Document",
        "admin.users.documents.review": "Mettre en revue",
        "admin.users.documents.validate": "Valider",
        "admin.users.documents.reject": "Rejeter",
        "admin.users.documents.modal_title": "Revue du document",
        "admin.users.documents.field.status": "Statut",
        "admin.users.documents.field.expires_at": "Date d'expiration",
        "admin.users.documents.field.rejection_reason": "Motif de rejet",
        "admin.users.documents.reject_reason_required":
            "Le motif est obligatoire pour rejeter un document.",
        "admin.users.documents.review_success": "Document mis à jour.",
        "admin.users.documents.review_error":
            "Erreur lors de la mise à jour du document.",

        // Admin Services
        "admin.services.title": "Gestion du catalogue",
        "admin.services.subtitle":
            "Suivez {active} services visibles sur {total} fiches locales ou synchronisées.",
        "admin.services.search_placeholder":
            "Rechercher un service, un partenaire...",
        "admin.services.search_aria": "Rechercher dans le catalogue",
        "admin.services.results":
            "{count} services trouvés · {pending} en revue · {blocked} bloqués",
        "admin.services.create": "Ajouter un service",
        "admin.services.export_csv": "Exporter CSV",
        "admin.services.configure_structure": "Configurer la structure",
        "admin.services.empty": "Aucun service trouvé.",
        "admin.services.badge": "Catalogue",
        "admin.services.filters_aria": "Filtres du catalogue",
        "admin.services.table_aria": "Tableau des services",
        "admin.services.col.service": "Service",
        "admin.services.col.partner": "Partenaire",
        "admin.services.col.category": "Catégorie",
        "admin.services.col.source": "Source",
        "admin.services.col.client_price": "Prix client",
        "admin.services.col.partner_net": "Net partenaire",
        "admin.services.col.commission": "Commission",
        "admin.services.col.availability": "Disponibilité",
        "admin.services.col.rating": "Note",
        "admin.services.col.action": "Action",

        "admin.services.filter.all": "Tous les services",
        "admin.services.filter.active": "Actifs",
        "admin.services.filter.inactive": "Inactifs",
        "admin.services.filter.all_categories": "Toutes catégories",
        "admin.services.filter.all_partners": "Tous les partenaires",
        "admin.services.filter.all_sources": "Toutes les sources",
        "admin.services.filter.all_moderation": "Tous les statuts de revue",
        "admin.services.filter.local": "Local (Wandireo)",
        "admin.services.filter.external": "Externe (FareHarbor)",
        "admin.services.filter.category": "Par catégorie",
        "admin.services.filter.partner": "Par partenaire",
        "admin.services.filter.source": "Par source",
        "admin.services.filter.availability": "Par disponibilité",
        "admin.services.filter.moderation": "Par statut de revue",
        "admin.services.moderation.status.draft": "Brouillon",
        "admin.services.moderation.status.pending_review": "En revue",
        "admin.services.moderation.status.approved": "Approuvé",
        "admin.services.moderation.status.published": "Publié",
        "admin.services.moderation.status.rejected": "Rejeté",
        "admin.services.moderation.status.suspended": "Suspendu",
        "admin.services.moderation.status.unreviewed": "Non revu",
        "admin.services.moderation.action.approve": "Approuver",
        "admin.services.moderation.action.publish": "Publier",
        "admin.services.moderation.action.reject": "Rejeter",
        "admin.services.moderation.action.suspend": "Suspendre",
        "admin.services.moderation.activate_blocked":
            "Publiez ce service via la modération avant activation.",
        "admin.services.moderation.toast.approved": "Service approuvé.",
        "admin.services.moderation.toast.published": "Service publié.",
        "admin.services.moderation.toast.rejected": "Service rejeté.",
        "admin.services.moderation.toast.suspended": "Service suspendu.",
        "admin.services.moderation.toast.error":
            "Action de modération impossible.",
        "admin.services.moderation.modal.reject_title": "Rejeter le service",
        "admin.services.moderation.modal.suspend_title": "Suspendre le service",
        "admin.services.moderation.modal.cancel": "Annuler",
        "admin.services.moderation.modal.confirm": "Confirmer",
        "admin.services.moderation.modal.reason": "Motif",
        "admin.services.moderation.modal.reason_required":
            "Le motif est obligatoire.",
        "admin.services.moderation.modal.placeholder":
            "Expliquez la décision pour garder une trace exploitable.",

        "admin.services.category.activity": "Activité",
        "admin.services.category.boat": "Bateau",
        "admin.services.category.car": "Voiture",
        "admin.services.category.stay": "Hébergement",
        "admin.services.csv.category": "Categorie",

        "admin.services.fareharbor.catalog_note":
            "Service synchronisé via FareHarbor",
        "admin.services.fareharbor.catalog_summary": "Intégration temps réel",
        "admin.services.fareharbor.stats.companies": "Entreprises",
        "admin.services.fareharbor.stats.imported": "Importés",
        "admin.services.fareharbor.stats.listed": "Publiés",
        "admin.services.fareharbor.stats.health": "Santé Sync",
        "admin.services.fareharbor.last_attempt": "Dernière tentative",
        "admin.services.fareharbor.last_error": "Dernière erreur :",
        "admin.services.fareharbor.toast.sync_all_partial":
            "{failed} synchronisations sur {total} ont échoué.",

        "admin.services.toast.activated": "Service activé.",
        "admin.services.toast.deactivated": "Service désactivé.",
        "admin.services.toast.error": "Erreur lors du changement de statut.",

        // Admin Structure (Dynamic Fields)
        "admin.structure.title": "Structure du catalogue",
        "admin.structure.subtitle":
            "Définissez les catégories, sous-catégories, attributs et options disponibles.",
        "admin.structure.eyebrow": "Structure",
        "admin.structure.back_catalog": "Retour au catalogue",
        "admin.structure.categories": "Catégories",
        "admin.structure.subcategories": "Sous-catégories",
        "admin.structure.attributes": "Attributs",
        "admin.structure.extras": "Options (Extras)",
        "admin.structure.preset_attributes": "Attributs prédéfinis",
        "admin.structure.preset_extras": "Extras prédéfinis",
        "admin.structure.subcategories_count": "{count} sous-catégories",
        "admin.structure.select_category_manage":
            "Sélectionnez une catégorie pour gérer sa structure.",
        "admin.structure.empty_categories": "Aucune catégorie configurée.",
        "admin.structure.new_category": "Nouvelle catégorie",
        "admin.structure.edit_category": "Modifier la catégorie",
        "admin.structure.edit_category_short": "Modifier",
        "admin.structure.edit_subcategory": "Modifier la sous-catégorie",
        "admin.structure.edit_attribute": "Modifier l'attribut",
        "admin.structure.edit_extra": "Modifier l'option",
        "admin.structure.required_field": "Champ requis",
        "admin.structure.public_filter": "Filtre public",
        "admin.structure.category_active": "Catégorie active",
        "admin.structure.subcategory_active": "Sous-catégorie active",
        "admin.structure.extra_active": "Option active",
        "admin.structure.extra_required": "Option obligatoire",
        "admin.structure.extra_type.optional": "Optionnel",
        "admin.structure.extra_type.required": "Obligatoire",
        "admin.structure.edit": "Modifier",

        "admin.structure.label.name": "Nom interne",
        "admin.structure.label.label": "Libellé (Affiché)",
        "admin.structure.label.slug": "Slug (URL)",
        "admin.structure.label.description": "Description",
        "admin.structure.label.type": "Type de champ",
        "admin.structure.label.service_type": "Type de service",
        "admin.structure.label.order": "Ordre d'affichage",
        "admin.structure.label.options": "Options (pour select)",
        "admin.structure.label.technical_key": "Clé technique",
        "admin.structure.label.default_price": "Prix par défaut",
        "admin.structure.placeholder.options":
            "Exemple : automatique:auto, manuel:manual",

        "admin.structure.add": "Ajouter",
        "admin.structure.new": "Nouveau",
        "admin.structure.create": "Créer",
        "admin.structure.delete": "Supprimer",
        "admin.structure.cancel": "Annuler",
        "admin.structure.create_service": "Créer le service",

        "admin.structure.confirm.delete_category":
            "Supprimer cette catégorie ? Cela affectera les services liés.",
        "admin.structure.confirm.delete_subcategory":
            "Supprimer cette sous-catégorie ?",
        "admin.structure.confirm.delete_attribute": "Supprimer cet attribut ?",
        "admin.structure.confirm.delete_extra": "Supprimer cette option ?",

        "admin.structure.toast.category_created": "Catégorie créée.",
        "admin.structure.toast.category_updated": "Catégorie mise à jour.",
        "admin.structure.toast.category_deleted": "Catégorie supprimée.",
        "admin.structure.toast.category_save_error":
            "Erreur lors de l'enregistrement de la catégorie.",
        "admin.structure.toast.attribute_created": "Attribut créé.",
        "admin.structure.toast.attribute_updated": "Attribut mis à jour.",
        "admin.structure.toast.attribute_deleted": "Attribut supprimé.",
        "admin.structure.toast.attributes_added":
            "Attributs ajoutés avec succès.",
        "admin.structure.toast.attribute_save_error":
            "Erreur lors de l'enregistrement de l'attribut.",
        "admin.structure.toast.extra_created": "Option créée.",
        "admin.structure.toast.extra_updated": "Option mise à jour.",
        "admin.structure.toast.extra_deleted": "Option supprimée.",
        "admin.structure.toast.extras_added": "Options ajoutées avec succès.",
        "admin.structure.toast.delete_error": "Erreur lors de la suppression.",

        "admin.structure.error.select_category":
            "Veuillez sélectionner une catégorie.",
        "admin.structure.error.attributes_exist":
            "Certains attributs existent déjà.",
        "admin.structure.error.attributes_add":
            "Erreur lors de l'ajout des attributs.",
        "admin.structure.error.extras_exist":
            "Certaines options existent déjà.",
        "admin.structure.error.extras_add":
            "Erreur lors de l'ajout des options.",
        "admin.structure.error.preset_apply":
            "Erreur lors de l'application du preset.",
        "admin.structure.error.preset_exists": "Le preset a déjà été appliqué.",
        "admin.structure.error.no_attribute_preset":
            "Aucun preset d'attribut disponible.",
        "admin.structure.error.no_extra_preset":
            "Aucun preset d'option disponible.",

        // Presets Specifics
        "admin.structure.preset.boats": "Appliquer preset Bateaux",
        "admin.structure.preset.boats_created":
            "Structure Bateaux initialisée.",
        "admin.structure.preset.cars": "Appliquer preset Voitures",
        "admin.structure.preset.cars_created":
            "Structure Voitures initialisée.",
        "admin.structure.preset.stays": "Appliquer preset Hébergements",
        "admin.structure.preset.stays_created":
            "Structure Hébergements initialisée.",

        "admin.structure.preset.boat_category.name": "Bateaux",
        "admin.structure.preset.boat_category.description":
            "Locations de bateaux, excursions maritimes et jet-skis.",
        "admin.structure.preset.boat_subcategory.yacht": "Yacht",
        "admin.structure.preset.boat_subcategory.catamaran": "Catamaran",
        "admin.structure.preset.boat_subcategory.jet_ski": "Jet Ski",
        "admin.structure.preset.boat_subcategory.rental_with_or_without_license":
            "Location avec ou sans permis",

        "admin.structure.preset.car_category.name": "Voitures",
        "admin.structure.preset.car_category.description":
            "Location de véhicules et mobilité locale.",
        "admin.structure.preset.car_subcategory.city_car": "Citadine",
        "admin.structure.preset.car_subcategory.suv": "SUV",
        "admin.structure.preset.car_subcategory.luxury": "Luxe",
        "admin.structure.preset.car_subcategory.electric": "Électrique",

        "admin.structure.preset.stay_category.name": "Hébergements",
        "admin.structure.preset.stay_category.description":
            "Villas, appartements et séjours premium.",
        "admin.structure.preset.stay_subcategory.villa": "Villa",
        "admin.structure.preset.stay_subcategory.apartment": "Appartement",
        "admin.structure.preset.stay_subcategory.house": "Maison",
        "admin.structure.preset.stay_subcategory.hotel": "Hôtel",

        "admin.structure.preset.attribute.boat.length": "Longueur (m)",
        "admin.structure.preset.attribute.boat.cabins": "Cabines",
        "admin.structure.preset.attribute.boat.speed": "Vitesse (noeuds)",
        "admin.structure.preset.attribute.car.transmission": "Transmission",
        "admin.structure.preset.attribute.car.doors": "Portes",
        "admin.structure.preset.attribute.car.air_conditioning":
            "Climatisation",
        "admin.structure.preset.attribute.stay.bedrooms": "Chambres",
        "admin.structure.preset.attribute.stay.bathrooms": "Salles de bain",
        "admin.structure.preset.attribute.stay.pool": "Piscine",
        "admin.structure.preset.attribute.stay.wifi": "Wi-Fi",
        "admin.structure.preset.attribute.shared.fuel": "Carburant",

        "admin.structure.preset.extra.boat.skipper.name": "Skipper",
        "admin.structure.preset.extra.boat.skipper.description":
            "Accompagnement par un skipper professionnel.",
        "admin.structure.preset.extra.boat.fuel.name": "Forfait carburant",
        "admin.structure.preset.extra.boat.fuel.description":
            "Forfait carburant appliqué à la réservation.",
        "admin.structure.preset.extra.boat.towels.name": "Serviettes",
        "admin.structure.preset.extra.boat.towels.description":
            "Serviettes disponibles à bord.",
        "admin.structure.preset.extra.car.child_seat.name": "Siège enfant",
        "admin.structure.preset.extra.car.child_seat.description":
            "Siège enfant installé dans le véhicule.",
        "admin.structure.preset.extra.car.driver.name": "Chauffeur",
        "admin.structure.preset.extra.car.driver.description":
            "Service chauffeur pour le trajet.",
        "admin.structure.preset.extra.car.delivery.name": "Livraison à l'hôtel",
        "admin.structure.preset.extra.car.delivery.description":
            "Livraison du véhicule à l'hôtel du client.",
        "admin.structure.preset.extra.stay.breakfast.name": "Petit-déjeuner",
        "admin.structure.preset.extra.stay.breakfast.description":
            "Petit-déjeuner ajouté au séjour.",
        "admin.structure.preset.extra.stay.late_checkout.name":
            "Late check-out",
        "admin.structure.preset.extra.stay.late_checkout.description":
            "Départ tardif selon disponibilité.",
        "admin.structure.preset.extra.stay.final_cleaning.name":
            "Nettoyage final",
        "admin.structure.preset.extra.stay.final_cleaning.description":
            "Frais de nettoyage en fin de séjour.",

        "admin.structure.preset.fuel_option.diesel": "Diesel",
        "admin.structure.preset.fuel_option.gasoline": "Essence",
        "admin.structure.preset.fuel_option.hybrid": "Hybride",
        "admin.structure.preset.fuel_option.electric": "Électrique",
        "admin.structure.preset.transmission_option.automatic": "Automatique",
        "admin.structure.preset.transmission_option.manual": "Manuelle",

        // Technical Types
        "admin.structure.type.text": "Texte",
        "admin.structure.type.number": "Nombre",
        "admin.structure.type.boolean": "Case à cocher (Oui/Non)",
        "admin.structure.type.select": "Liste de choix",
        "admin.structure.update": "Mettre à jour la structure",

        // Admin Transactions
        "admin.transactions.title": "Transactions et finances",
        "admin.transactions.subtitle":
            "Suivez les paiements, les remboursements, les commissions et les statuts externes utiles aux opérations.",
        "admin.transactions.badge": "Finances",
        "admin.transactions.count": "{count} transactions",
        "admin.transactions.filters_aria": "Filtres financiers",
        "admin.transactions.filter.partner_all": "Tous les partenaires",
        "admin.transactions.filter.status_all": "Tous les statuts",
        "admin.transactions.filter.partner": "Filtrer par partenaire",
        "admin.transactions.filter.booking_status":
            "Filtrer par statut de réservation",
        "admin.transactions.filter.payment_status":
            "Filtrer par statut de paiement",
        "admin.transactions.filter.provider_status":
            "Filtrer par statut prestataire",
        "admin.transactions.filter.provider_all":
            "Tous les statuts prestataire",
        "admin.transactions.filter.search": "Rechercher une réservation",
        "admin.transactions.filter.search_placeholder":
            "Réf., client, service, partenaire, erreur externe",
        "admin.transactions.no_match":
            "Aucune transaction ne correspond aux critères.",

        "admin.transactions.col.id": "Réf.",
        "admin.transactions.col.date": "Date",
        "admin.transactions.col.client": "Client",
        "admin.transactions.col.service": "Service",
        "admin.transactions.col.partner": "Partenaire",
        "admin.transactions.col.volume": "Volume TTC",
        "admin.transactions.col.rate": "Taux",
        "admin.transactions.col.commission": "Commission",
        "admin.transactions.col.provider": "Prestataire",
        "admin.transactions.col.bookings": "Réservations",
        "admin.transactions.col.stripe_id": "ID Stripe",

        "admin.transactions.total.volume": "Volume total d'affaires",
        "admin.transactions.total.commissions": "Total commissions",
        "admin.transactions.total.partner_net": "Net partenaires",
        "admin.transactions.total.online_collected": "Collecté en ligne",

        "admin.transactions.booking.confirmed": "Confirmée",
        "admin.transactions.booking.pending": "En attente",
        "admin.transactions.booking.cancelled": "Annulée",
        "admin.transactions.payment.paid": "Payé",
        "admin.transactions.payment.pending": "En attente",
        "admin.transactions.payment.refunded": "Remboursé",
        "admin.transactions.external.label": "Statut prestataire",
        "admin.transactions.external.confirmed": "Prestataire confirmé",
        "admin.transactions.external.failed": "Prestataire en échec",
        "admin.transactions.external.pending": "Prestataire en attente",
        "admin.transactions.external.none": "Sans statut prestataire",

        "admin.transactions.details.title": "Détail de la transaction",
        "admin.transactions.details.aria": "Fenêtre de détail",
        "admin.transactions.formula": "Formule de calcul",
        "admin.transactions.formula_label":
            "Comment la commission est calculée",

        "admin.transactions.partners.title": "Performance par partenaire",
        "admin.transactions.partners.aria": "Liste des partenaires",

        // Admin Support
        "admin.nav.support": "Support client",

        // Admin Dashboard Metrics
        "admin.dashboard.metrics_aria": "Indicateurs de performance",
        "admin.dashboard.metric.volume": "Volume d'affaires",
        "admin.dashboard.metric.volume_sub": "Réservations confirmées",
        "admin.dashboard.metric.commissions": "Commissions perçues",
        "admin.dashboard.metric.commissions_sub":
            "Sur {count} réservation(s) confirmée(s)",
        "admin.dashboard.metric.pending": "En attente",
        "admin.dashboard.metric.pending_sub":
            "Réservation(s) en cours de traitement",
        "admin.dashboard.metric.accounts": "Comptes actifs",
        "admin.dashboard.metric.accounts_sub":
            "{clients} client(s) · {partners} partenaire(s)",
        "admin.dashboard.metric.catalog": "Catalogue actif",
        "admin.dashboard.metric.catalog_sub":
            "{partners} partenaire(s) valides · {reviews} avis en attente",

        // Admin Dashboard Funnel
        "admin.dashboard.funnel.title": "Funnel produit",
        "admin.dashboard.funnel.searches": "Recherches",
        "admin.dashboard.funnel.last_30_days": "30 derniers jours",
        "admin.dashboard.funnel.views": "Vues fiche",
        "admin.dashboard.funnel.views_sub": "{rate}% depuis la recherche",
        "admin.dashboard.funnel.starts": "Débuts de réservation",
        "admin.dashboard.funnel.starts_sub": "{rate}% depuis la fiche",
        "admin.dashboard.funnel.confirmed": "Réservations confirmées",
        "admin.dashboard.funnel.confirmed_sub": "{rate}% depuis le checkout",

        // Admin Support
        "support.title": "Centre de Support",
        "support.subtitle":
            "Pilotez l'assistance utilisateur et suivez les incidents Wandireo.",
        "support.new_ticket": "Créer un ticket",
        "support.ticket_subject": "Sujet",
        "support.ticket_message": "Message",
        "support.ticket_media": "Média (Lien image/vidéo)",
        "support.ticket_priority": "Priorité",
        "support.ticket_date": "Date",
        "support.ticket_user": "Utilisateur",
        "support.ticket_actions": "Actions",
        "support.ticket_initial_message": "Message d'ouverture",
        "support.status.all": "Tous les statuts",
        "support.status.open": "Ouvert",
        "support.status.in_progress": "En cours",
        "support.status.resolved": "Résolu",
        "support.status.closed": "Fermé",
        "support.priority.all": "Toutes les priorités",
        "support.priority.low": "Basse",
        "support.priority.medium": "Moyenne",
        "support.priority.high": "Haute",
        "support.priority.urgent": "Urgente",
        "support.author.client": "Client",
        "support.author.partner": "Partenaire",
        "support.author.unknown": "Inconnu",
        "support.anonymous": "Anonyme",
        "support.search_placeholder": "Rechercher un incident, un sujet...",
        "support.results_one": "{count} ticket trouvé",
        "support.results_other": "{count} tickets trouvés",
        "support.media_present": "Contient un média",
        "support.view_media": "Voir le média",
        "support.no_media": "Aucun média",
        "support.ticket_detail_title": "Ticket : {subject}",
        "support.empty": "Aucun ticket trouvé.",
        "support.form.title": "Comment pouvons-nous aider ?",
        "support.form.subtitle":
            "Remplissez les détails ci-dessous pour créer une demande d'assistance.",
        "support.form.subject_placeholder":
            "Ex: Problème d'accès ou erreur technique",
        "support.form.message_placeholder":
            "Décrivez votre demande en quelques lignes...",
        "support.form.media_placeholder":
            "Lien optionnel (Loom, Screenshot...)",
        "support.form.submit": "Créer le ticket",
        "support.toast.create_success": "Le ticket a été créé avec succès.",
        "support.toast.create_error":
            "Veuillez remplir les champs obligatoires.",
        "support.toast.status_success": "Statut mis à jour.",
        "support.toast.status_error":
            "Erreur lors de la mise à jour du statut.",
        "support.toast.priority_success": "Priorité mise à jour.",
        "support.toast.priority_error":
            "Erreur lors de la mise à jour de la priorité.",

        // Missing structure toasts
        "admin.structure.toast.extra_save_error":
            "Erreur lors de l'enregistrement de l'option.",
        "admin.structure.toast.subcategory_created": "Sous-catégorie créée.",
        "admin.structure.toast.subcategory_updated":
            "Sous-catégorie mise à jour.",
        "admin.structure.toast.subcategory_deleted":
            "Sous-catégorie supprimée.",
        "admin.structure.toast.subcategory_save_error":
            "Erreur lors de l'enregistrement de la sous-catégorie.",
    };
}
