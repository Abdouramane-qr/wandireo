import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type Locale = 'fr' | 'pt' | 'en' | 'es' | 'it' | 'de';

const INTL_LOCALES: Record<Locale, string> = {
    fr: 'fr-FR',
    pt: 'pt-PT',
    en: 'en-US',
    es: 'es-ES',
    it: 'it-IT',
    de: 'de-DE',
};

const translations: Record<Locale, Record<string, string>> = {
    fr: {
        'nav.home': 'Accueil',
        'nav.search': 'Recherche',
        'nav.blog': 'Blog',
        'nav.login': 'Connexion',
        'nav.register': 'Inscription',
        'nav.partner': 'Espace partenaire',
        'nav.admin': 'Administration',
        'nav.logout': 'Déconnexion',
        'nav.become_partner': 'Devenir partenaire',

        'common.loading': 'Chargement...',
        'common.close': 'Fermer',
        'common.view': 'Voir',
        'common.create': 'Créer',
        'common.cancel': 'Annuler',
        'common.save': 'Enregistrer',
        'common.system': 'Système',
        'common.light': 'Clair',
        'common.dark': 'Sombre',
        'common.back_home': "Retour a l'accueil",

        'theme.label': 'Theme',
        'theme.change': 'Changer le theme',
        'theme.light': 'Mode clair',
        'theme.dark': 'Mode sombre',
        'theme.system': 'Suivre le systeme',
        'language.change': 'Changer la langue',

        'search.all': 'Tout',
        'search.activities': 'Activités',
        'search.boats': 'Bateaux',
        'search.cars': 'Voitures',
        'search.accommodations': 'Hébergements',
        'search.all_desc': 'Toutes les experiences dans une recherche unique',
        'search.activities_desc': 'Excursions, sorties et experiences guidees',
        'search.boats_desc': 'Locations, jet ski, yachts et sorties en mer',
        'search.cars_desc': 'Mobilite, premium, SUV et livraisons locales',
        'search.accommodations_desc': 'Villas, appartements et sejours premium',
        'search.filters': 'Filtres',
        'search.reset': 'Reinitialiser',
        'search.destination': 'Destination',
        'search.all_destinations': 'Toutes les destinations',
        'search.dates': 'Dates',
        'search.date_from': 'Date de depart',
        'search.date_to': 'Date de retour',
        'search.date_note': 'Les dates restent conservees dans votre recherche et seront reutilisees dans la reservation.',
        'search.main_categories': 'Categories principales',
        'search.detailed_categories': 'Categories detaillees',
        'search.types_prefix': 'Types de',
        'search.budget': 'Budget (EUR / unite)',
        'search.min_rating': 'Note minimale',
        'search.rating_all': 'Tous',
        'search.results_count_singular': 'experience trouvee',
        'search.results_count_plural': 'experiences trouvees',
        'search.no_results': 'Aucune experience trouvee',
        'search.no_results_desc': "Essayez d'elargir votre recherche ou de modifier les filtres actifs.",
        'search.clear_filters': 'Effacer tous les filtres',
        'search.sort_by': 'Trier par',
        'search.sort.relevance': 'Pertinence',
        'search.sort.price_asc': 'Prix croissant',
        'search.sort.price_desc': 'Prix decroissant',
        'search.sort.rating': 'Mieux notes',

        'home.hero_title': 'Découvrez les meilleures expériences en Algarve et au-delà',
        'home.hero_subtitle': 'Réservez des activités, excursions et expériences privées inoubliables en quelques clics.',
        'home.hero_cta': 'Explorer les expériences',
        'home.search_aria': 'Moteur de recherche de services',
        'home.destination': 'Destination',
        'home.departure': 'Départ',
        'home.return': 'Retour',
        'home.category': 'Categorie',
        'home.search': 'Rechercher',
        'home.intro_title': 'Wandireo connecte les voyageurs avec les meilleures experiences locales',
        'home.intro_text': 'Des excursions en bateau aux sports nautiques, en passant par les evenements prives et les locations premium, nous selectionnons soigneusement nos partenaires pour garantir qualite, securite et experiences memorables.',
        'home.featured_title': 'Experiences populaires en Algarve',
        'home.latest_posts': 'Nos derniers articles',
        'home.see_all': 'Voir tout',
        'home.main_categories': 'Categories principales',
        'home.destinations_title': 'Destinations en Algarve',
        'home.explore_region': 'Explorer la region',
        'home.destination_copy': 'Experiences, excursions et services premium disponibles a',
        'home.how_it_works': 'Comment ca marche ?',
        'home.steps_aria': 'Etapes pour reserver',
        'home.step1_title': 'Recherchez',
        'home.step1_desc': 'Choisissez votre destination, vos dates et le type d experience souhaite parmi les meilleures offres disponibles.',
        'home.step2_title': 'Comparez',
        'home.step2_desc': "Consultez les fiches detaillees, les notes, les avis verifies et les services inclus pour trouver l'experience ideale.",
        'home.step3_title': 'Reservez',
        'home.step3_desc': 'Payez en ligne, avec acompte ou sur place selon l experience, puis contactez-nous rapidement via WhatsApp si besoin.',
        'home.faq_title': 'FAQ',
        'home.partner_aria': 'Devenez partenaire Wandireo',
        'home.partner_title': 'Vous proposez des experiences touristiques ou des services premium ?',
        'home.partner_desc': 'Rejoignez Wandireo pour toucher davantage de voyageurs en Algarve, puis en Europe.',
        'home.partner_cta': 'Devenir partenaire',
        'home.whatsapp_aria': 'Contacter Wandireo sur WhatsApp',
        'home.whatsapp_title': 'WhatsApp : +351 928 282 231',
        'home.category.all': 'Toutes les experiences',
        'home.category.activity': 'Activités et excursions',
        'home.category.boat': 'Bateaux et experiences en mer',
        'home.category.accommodation': 'Hébergements premium',
        'home.category.car': 'Voitures et mobilite',
        'home.tile.activities': 'Activités',
        'home.tile.activities_desc': 'Quad, buggy, surf, kayak, jeep safari et expériences guidées',
        'home.tile.boats': 'Bateaux',
        'home.tile.boats_desc': 'Benagil, dauphins, grottes, catamarans, yachts et jet ski',
        'home.tile.accommodations': 'Hébergements',
        'home.tile.accommodations_desc': 'Villas, appartements et sejours premium en Algarve et au-dela',
        'home.tile.cars': 'Voitures',
        'home.tile.cars_desc': 'Location premium, mobilite sur place et vehicules loisirs',
        'home.highlight.1': 'Meilleurs prix et prestataires verifies',
        'home.highlight.2': 'Reservation rapide et support WhatsApp',
        'home.highlight.3': 'Large choix d experiences',
        'home.highlight.4': 'Paiements securises',
        'home.highlight.5': 'Recommandations personnalisees',
        'home.highlight.6': 'Paiement flexible',
        'home.count.experience_one': 'experience',
        'home.count.experience_other': 'experiences',
        'home.faq.1.q': 'Comment reserver une activite ?',
        'home.faq.1.a': 'Vous pouvez reserver directement sur notre site en quelques clics en selectionnant votre date et le nombre de participants.',
        'home.faq.2.q': 'La confirmation est-elle immediate ?',
        'home.faq.2.a': 'Oui, la plupart des reservations sont instantanees. Certaines necessitent une validation du prestataire.',
        'home.faq.3.q': 'Puis-je annuler ma reservation ?',
        'home.faq.3.a': "Cela depend de l'activite et du prestataire. Beaucoup proposent une annulation gratuite jusqu'a 24h ou 48h avant.",
        'home.faq.4.q': 'Le paiement est-il securise ?',
        'home.faq.4.a': 'Oui, tous les paiements sont securises et chiffres.',
        'home.faq.5.q': 'Quels moyens de paiement sont acceptes ?',
        'home.faq.5.a': 'Cartes bancaires, PayPal, Apple Pay, Google Pay, MB Way et paiement sur place.',
        'home.faq.6.q': 'Le transport est-il inclus ?',
        'home.faq.6.a': "Certaines activites incluent le transport. Cela est indique sur la fiche avec le filtre 'Transfert hotel inclus'.",
        'home.faq.7.q': 'Puis-je vous contacter via WhatsApp ?',
        'home.faq.7.a': 'Oui, a tout moment pour une assistance rapide au +351 928 282 231.',
        'home.faq.8.q': 'Quel est le role de Wandireo ?',
        'home.faq.8.a': 'Wandireo agit comme intermediaire entre les voyageurs et les prestataires. La realisation des activites reste sous la responsabilite des partenaires.',

        'auth.login.title': 'Connexion',
        'auth.login.subtitle': 'Bon retour sur Wandireo',
        'auth.login.email': 'Adresse email',
        'auth.login.email_placeholder': 'vous@exemple.com',
        'auth.login.password': 'Mot de passe',
        'auth.login.password_placeholder': 'Votre mot de passe',
        'auth.login.submit': 'Se connecter',
        'auth.login.forgot': 'Mot de passe oublie ?',
        'auth.login.no_account': 'Pas encore de compte ?',
        'auth.login.create_account': 'Creer un compte',
        'auth.login.partner_prompt': 'Vous etes prestataire ?',
        'auth.login.partner_cta': 'Rejoindre Wandireo',
        'auth.login.error.required': 'Veuillez remplir tous les champs.',
        'auth.login.error.invalid': 'Email ou mot de passe incorrect.',
        'auth.password.show': 'Afficher le mot de passe',
        'auth.password.hide': 'Masquer le mot de passe',

        'auth.register.title': 'Creer un compte',
        'auth.register.subtitle': 'Rejoignez la communaute Wandireo',
        'auth.register.first_name': 'Prenom',
        'auth.register.last_name': 'Nom',
        'auth.register.password': 'Mot de passe',
        'auth.register.confirm_password': 'Confirmer le mot de passe',
        'auth.register.password_hint': 'Au moins 6 caracteres',
        'auth.register.confirm_placeholder': 'Repetez votre mot de passe',
        'auth.register.accept_terms_prefix': "J'accepte les",
        'auth.register.accept_terms_join': 'et la',
        'auth.register.terms': 'conditions generales',
        'auth.register.privacy': 'politique de confidentialite',
        'auth.register.submit': 'Creer mon compte',
        'auth.register.have_account': 'Deja un compte ?',
        'auth.register.login': 'Se connecter',
        'auth.register.error.first_name': 'Le prenom est requis.',
        'auth.register.error.last_name': 'Le nom est requis.',
        'auth.register.error.email_required': "L'adresse email est requise.",
        'auth.register.error.email_invalid': "L'adresse email n'est pas valide.",
        'auth.register.error.password_required': 'Le mot de passe est requis.',
        'auth.register.error.password_length': 'Le mot de passe doit contenir au moins 6 caracteres.',
        'auth.register.error.password_match': 'Les mots de passe ne correspondent pas.',
        'auth.register.error.accept_terms': 'Vous devez accepter les conditions generales.',

        'partner.register.title': 'Devenez partenaire',
        'partner.register.subtitle': 'Proposez vos services a des milliers de voyageurs sur Wandireo',
        'partner.register.success_title': 'Demande envoyee !',
        'partner.register.success_text': 'Votre dossier de candidature a bien ete recu. Notre equipe va examiner votre demande et vous contactera a cette adresse sous 48 a 72 heures.',
        'partner.register.personal': 'Informations personnelles',
        'partner.register.company': 'Informations societe',
        'partner.register.security': 'Securite',
        'partner.register.business_email': 'Adresse email professionnelle',
        'partner.register.phone': 'Telephone',
        'partner.register.company_name': "Nom de l'entreprise",
        'partner.register.address': 'Adresse professionnelle',
        'partner.register.hint': "Un justificatif d'activite vous sera demande lors de la validation de votre compte.",
        'partner.register.submit': 'Envoyer ma candidature',
        'partner.register.have_account': 'Deja partenaire ?',
        'partner.register.login': 'Se connecter',
        'partner.register.error.first_name': 'Le prenom est requis.',
        'partner.register.error.last_name': 'Le nom est requis.',
        'partner.register.error.email': 'Adresse email valide requise.',
        'partner.register.error.company': "Le nom de l'entreprise est requis.",
        'partner.register.error.address': "L'adresse professionnelle est requise.",
        'partner.register.error.password': 'Mot de passe de 6 caracteres minimum.',
        'partner.register.error.password_match': 'Les mots de passe ne correspondent pas.',

        'favorites.title': 'Mes favoris',
        'favorites.count_one': 'service sauvegarde',
        'favorites.count_other': 'services sauvegardes',
        'favorites.empty_title': 'Aucun favori pour le moment',
        'favorites.empty_desc': 'Parcourez nos services et cliquez sur le coeur pour les retrouver ici.',
        'favorites.discover': 'Découvrir les services',
        'favorites.remove': 'Retirer',
        'favorites.remove_aria': 'Retirer {title} des favoris',

        'dashboard.hero_label': 'Bienvenue',
        'dashboard.greeting': 'Mon espace voyageur',
        'dashboard.member_since': 'Membre Wandireo depuis le {date}',
        'dashboard.stats_label': 'Statistiques',
        'dashboard.upcoming_one': 'Voyage a venir',
        'dashboard.upcoming_other': 'Voyages a venir',
        'dashboard.completed_one': 'Voyage effectue',
        'dashboard.completed_other': 'Voyages effectues',
        'dashboard.spent_online': 'Paye en ligne',
        'dashboard.upcoming_title': 'Prochains voyages',
        'dashboard.see_all': 'Voir tout',
        'dashboard.trip_confirmed': 'Confirme',
        'dashboard.participants_one': 'participant',
        'dashboard.participants_other': 'participants',
        'dashboard.empty_title': 'Aucun voyage a venir',
        'dashboard.empty_desc': 'Explorez notre catalogue et reservez votre prochaine aventure.',
        'dashboard.discover': 'Découvrir les activités',
        'dashboard.quick_links': 'Acces rapides',
        'dashboard.quick.reservations_title': 'Mes reservations',
        'dashboard.quick.reservations_desc': 'Historique et statuts de toutes vos reservations',
        'dashboard.quick.profile_title': 'Mon profil',
        'dashboard.quick.profile_desc': 'Informations personnelles et preferences de voyage',

        'profile.back_dashboard': 'Tableau de bord',
        'profile.member_since': 'Membre depuis le {date}',
        'profile.personal': 'Informations personnelles',
        'profile.preferences': 'Preferences de voyage',
        'profile.security': 'Securite du compte',
        'profile.first_name': 'Prenom',
        'profile.last_name': 'Nom',
        'profile.email': 'Adresse email',
        'profile.phone': 'Numero de telephone',
        'profile.language': "Langue d'interface",
        'profile.currency': 'Devise preferee',
        'profile.readonly_note': 'Contactez le support pour modifier cet element.',
        'profile.saving': 'Enregistrement...',
        'profile.save': 'Enregistrer les modifications',
        'profile.save_success_title': 'Profil sauvegarde',
        'profile.save_success_desc': 'Votre profil a ete mis a jour avec succes.',
        'profile.password': 'Mot de passe',
        'profile.password_desc': 'Modifiable via le lien envoye a votre adresse email.',
        'profile.two_factor': 'Double authentification',
        'profile.two_factor_desc': 'Non configuree - disponible prochainement.',
        'profile.sessions': 'Sessions actives',
        'profile.sessions_desc': '1 session active (cet appareil)',

        'partner.dashboard.title': 'Espace Partenaire',
        'partner.dashboard.member_since': 'Partenaire Wandireo depuis le {date}',
        'partner.dashboard.stats': 'Statistiques',
        'partner.dashboard.revenue_total': 'Revenus totaux',
        'partner.dashboard.revenue_month': 'Revenus ce mois',
        'partner.dashboard.bookings_month_one': 'Reservation ce mois',
        'partner.dashboard.bookings_month_other': 'Reservations ce mois',
        'partner.dashboard.pending_one': 'Demande en attente',
        'partner.dashboard.pending_other': 'Demandes en attente',
        'partner.dashboard.action_required': 'Action requise',
        'partner.dashboard.shortcuts': 'Acces rapides',
        'partner.dashboard.management': 'Gestion',
        'partner.dashboard.catalog': 'Mon catalogue',
        'partner.dashboard.active_service_one': 'service actif',
        'partner.dashboard.active_service_other': 'services actifs',
        'partner.dashboard.reservations': 'Reservations',
        'partner.dashboard.process_one': '{count} demande a traiter',
        'partner.dashboard.process_other': '{count} demandes a traiter',
        'partner.dashboard.up_to_date': 'Tout est a jour',
        'partner.dashboard.recent': 'Activite recente',
        'partner.dashboard.see_all': 'Voir tout',
        'partner.dashboard.empty': 'Aucune reservation pour le moment.',
        'partner.profile.title': 'Mon profil',
        'partner.profile.since': 'Partenaire depuis {year}',
        'partner.profile.add_service': 'Ajouter un service',
        'partner.profile.catalog_manage': 'Gerer le catalogue',
        'partner.profile.catalog_title': 'Mes services',
        'partner.profile.empty': 'Aucun service publie pour le moment.',
        'partner.profile.first_service': 'Creer mon premier service',
        'partner.profile.rating': 'note moyenne',
        'partner.profile.sales': 'ventes totales',
        'partner.profile.commission': 'taux de commission',
        'partner.pending.title.approved': 'Compte partenaire valide',
        'partner.pending.title.rejected': 'Demande refusee',
        'partner.pending.title.suspended': 'Compte suspendu',
        'partner.pending.title.pending': 'Validation en cours',
        'partner.pending.date_missing': 'Non renseignee',
        'partner.pending.message.approved': 'Votre compte est valide. Vous pouvez acceder a votre espace partenaire.',
        'partner.pending.message.rejected': 'Votre dossier partenaire a ete refuse. Contactez l administration pour le relancer.',
        'partner.pending.message.rejected_with_reason': 'Votre dossier a ete refuse: {reason}',
        'partner.pending.message.suspended': 'Votre compte partenaire est temporairement suspendu. Contactez l administration pour clarifier la situation.',
        'partner.pending.message.pending': 'Votre compte partenaire a bien ete cree. Il reste en attente de validation par l administration et de finalisation du contrat.',
        'partner.pending.account_status': 'Statut du compte',
        'partner.pending.contract_status': 'Contrat de mandat',
        'partner.pending.admin_validation': 'Validation admin',
        'partner.pending.contract_signature': 'Signature contrat',
        'partner.pending.company': 'Entreprise',
        'partner.pending.contact': 'Contact',
        'partner.pending.download_contract': 'Telecharger le contrat',
        'partner.pending.open_dashboard': 'Ouvrir le dashboard',
        'partner.pending.back_home': "Retour a l'accueil",

        'history.title': 'Mes reservations',
        'history.subtitle': "Retrouvez l'ensemble de vos reservations et leur statut en temps reel.",
        'history.dashboard': 'Mon tableau de bord',
        'history.filters': 'Filtres de reservations',
        'history.tab.all': 'Toutes',
        'history.tab.upcoming': 'A venir',
        'history.tab.past': 'Passees',
        'history.tab.cancelled': 'Annulees',
        'history.status.cancelled': 'Annulee',
        'history.status.pending': 'En attente',
        'history.status.confirmed': 'Confirmee',
        'history.status.completed': 'Terminee',
        'history.payment.paid': 'Paye',
        'history.payment.refunded': 'Rembourse',
        'history.payment.pending': 'Paiement en attente',
        'history.rating.aria': 'Reservation {id}',
        'history.user': 'Utilisateur',
        'history.reference': 'Ref.',
        'history.participants_one': 'participant',
        'history.participants_other': 'participants',
        'history.extras': 'Extras',
        'history.online': 'en ligne',
        'history.onsite': 'sur place',
        'history.total': 'Total',
        'history.review_done': 'Avis depose - merci !',
        'history.review_title': 'Votre avis sur ce service',
        'history.review_placeholder': 'Partagez votre experience (optionnel)...',
        'history.review_send': 'Envoyer',
        'history.review_cancel': 'Annuler',
        'history.review_cta': 'Laisser un avis',
        'history.review_success': 'Votre avis a ete publie. Merci !',
        'history.cancellation_reason': "Motif d'annulation :",
        'history.empty.all': "Vous n'avez pas encore effectue de reservation.",
        'history.empty.upcoming': 'Aucun voyage a venir pour le moment.',
        'history.empty.past': "Vous n'avez pas encore voyage avec Wandireo.",
        'history.empty.cancelled': 'Aucune reservation annulee.',

        'admin.reviews.title': 'Moderation des avis',
        'admin.reviews.subtitle': 'Valide, rejette ou supprime les avis relies aux services et partenaires.',
        'admin.reviews.search': 'Rechercher un avis, service ou email',
        'admin.reviews.back': 'Retour dashboard',
        'admin.reviews.all_statuses': 'Tous les statuts',
        'admin.reviews.pending': 'En attente',
        'admin.reviews.pending_count': 'En attente: {count}',
        'admin.reviews.approved_count': 'Valides: {count}',
        'admin.reviews.rejected_count': 'Refuses: {count}',
        'admin.reviews.unknown_partner': 'Partenaire inconnu',
        'admin.reviews.rating': 'Note: {rating}/5',
        'admin.reviews.approve': 'Valider',
        'admin.reviews.reject': 'Refuser',
        'admin.reviews.delete': 'Supprimer',
        'admin.reviews.delete_confirm': 'Supprimer cet avis ?',
        'admin.reviews.update_success': 'Avis mis a jour.',
        'admin.reviews.update_error': 'Impossible de mettre a jour cet avis.',
        'admin.reviews.delete_success': 'Avis supprime.',
        'admin.reviews.delete_error': 'Impossible de supprimer cet avis.',
        'admin.reviews.empty': 'Aucun avis ne correspond aux filtres.',

        'service.not_found_title': 'Service introuvable',
        'service.not_found_desc': "Ce service n'existe pas ou a ete supprime.",
        'service.breadcrumb': "Fil d'Ariane",
        'service.gallery_thumbs': 'Miniatures de la galerie',
        'service.gallery_show_photo': 'Afficher photo {index}',
        'service.gallery_prev': 'Photo precedente',
        'service.gallery_next': 'Photo suivante',
        'service.rating_label': 'Note : {rating} sur 5 ({count} avis)',
        'service.reviews_count': '({count} avis)',
        'service.location': 'Localisation',
        'service.description': 'Description',
        'service.features': 'Caracteristiques du service',
        'service.detail_category': 'Categorie detaillee',
        'service.subcategory': 'Sous-categorie',
        'service.yes': 'Oui',
        'service.no': 'Non',
        'service.extras_available': 'Extras disponibles',
        'service.included': 'Ce qui est inclus',
        'service.excluded': 'Non inclus',
        'service.practical_info': 'Informations pratiques',
        'service.meeting_point': 'Point de rendez-vous',
        'service.departure_times': 'Horaires de depart',
        'service.difficulty': 'Difficulte',
        'service.participants': 'Participants',
        'service.minimum_age': 'Age minimum',
        'service.languages': 'Langues',
        'service.group_type': 'Type de groupe',
        'service.medical_clearance': 'Certificat medical',
        'service.medical_clearance_required': 'Obligatoire avant la participation',
        'service.boats_amenities': 'Equipements a bord',
        'service.specifications': 'Specifications',
        'service.boat_type': 'Type de bateau',
        'service.passengers': 'Passagers',
        'service.berths': 'Couchages',
        'service.length': 'Longueur',
        'service.rental_mode': 'Mode de location',
        'service.deposit': 'Caution',
        'service.license_required': 'Permis requis',
        'service.equipment': 'Equipements',
        'service.stay_conditions': 'Conditions de sejour',
        'service.check_in': 'Arrivee',
        'service.check_out': 'Depart',
        'service.capacity': 'Capacite',
        'service.minimum_stay': 'Sejour minimum',
        'service.cancellation': 'Annulation',
        'service.house_rules': 'Reglement interieur',
        'service.car_features': 'Caracteristiques',
        'service.vehicle': 'Vehicule',
        'service.transmission': 'Transmission',
        'service.fuel': 'Carburant',
        'service.seats': 'Places',
        'service.luggage': 'Bagages',
        'service.mileage': 'Kilometrage',
        'service.unlimited': 'Illimite',
        'service.insurance': 'Assurance',
        'service.included_feminine': 'Incluse',
        'service.not_included_feminine': 'Non incluse',
        'service.driver_age': 'Age conducteur',
        'service.pickup_points': 'Points de retrait',
        'service.availability': 'Disponibilites',
        'service.places': 'places',
        'service.customer_reviews': 'Avis clients ({count})',
        'service.no_reviews_title': 'Aucun avis pour le moment',
        'service.no_reviews_desc': 'Soyez le premier a partager votre experience !',
        'service.similar': 'Services similaires',
        'service.favorite_add': 'Ajouter aux favoris',
        'service.favorite_remove': 'Retirer des favoris',
        'service.booking.date_activity': "Date de l'activite",
        'service.booking.time_slot': 'Creneau horaire',
        'service.booking.choose_slot': 'Choisir un creneau',
        'service.booking.participants': 'Participants ({min} - {max})',
        'service.booking.decrease_participants': 'Reduire le nombre de participants',
        'service.booking.increase_participants': 'Augmenter le nombre de participants',
        'service.booking.pickup': 'Prise en charge',
        'service.booking.return': 'Retour',
        'service.booking.night_one': 'nuit',
        'service.booking.night_other': 'nuits',
        'service.booking.day_one': 'jour',
        'service.booking.day_other': 'jours',
        'service.booking.extras': 'Extras',
        'service.booking.total': 'Total',
        'service.booking.reserve': 'Réserver maintenant',
        'service.booking.note': 'Vous ne serez pas debite avant confirmation.',
        'service.booking.error.select_date': "Veuillez selectionner une date pour l'activite.",
        'service.booking.error.select_slot': 'Veuillez selectionner un creneau horaire.',
        'service.booking.error.select_dates': 'Veuillez renseigner les deux dates (arrivee et depart).',
        'service.booking.error.invalid_dates': 'La date de retour doit etre posterieure a la date de depart.',

        'footer.explore': 'Explorer',
        'footer.services': 'Services',
        'footer.help': 'Aide',
        'footer.legal': 'Legal',
        'footer.all_destinations': 'Toutes les destinations',
        'footer.boats': 'Bateaux et croisieres',
        'footer.cars': 'Location de voitures',
        'footer.blog': 'Blog et conseils voyage',
        'footer.how_it_works': 'Comment ca marche',
        'footer.help_center': "Centre d'aide",
        'footer.whatsapp': 'Nous contacter sur WhatsApp',
        'footer.booking_email': 'Email bookings',
        'footer.terms': "Conditions d'utilisation",
        'footer.privacy': 'Confidentialite',
        'footer.legal_notice': 'Mentions legales',
        'footer.tagline': 'Découvrez les meilleures expériences de voyage en Algarve et au-delà. Activités, bateaux, hébergements et voitures au meilleur prix.',
        'footer.socials': 'Nos reseaux sociaux',
        'footer.copyright': 'Wandireo. Tous droits reserves.',

        'blog.title': 'Le blog Wandireo',
        'blog.subtitle': 'Conseils de voyage, guides de destinations et inspirations pour vos prochaines aventures.',
        'blog.all_posts': 'Tous les articles',
        'blog.no_posts': 'Aucun article trouve',
        'blog.no_posts_desc': 'Essayez un autre theme ou consultez tous nos articles.',
        'blog.related_posts': 'Articles similaires',
        'blog.published_on': 'Publie le',
        'blog.updated_on': 'Mis a jour le',
        'blog.read_more': "Lire l'article",
        'blog.cover_alt': 'Illustration',
        'blog.cover_fallback': 'Article Wandireo',

        'support.title': 'Support Center',
        'support.subtitle': 'Gestion des tickets internes et demandes utilisateurs.',
        'support.new_ticket': 'Nouveau ticket',
        'support.ticket_subject': 'Sujet',
        'support.ticket_message': 'Message',
        'support.ticket_date': 'Date',
        'support.ticket_user': 'Utilisateur / partenaire',
        'support.ticket_actions': 'Actions',
        'support.ticket_initial_message': 'Message initial',
        'support.empty': 'Aucun ticket trouve.',
        'support.form.title': 'Creer un ticket interne',
        'support.form.subject_placeholder': 'Sujet du ticket',
        'support.form.message_placeholder': 'Decrivez la demande ou le suivi interne...',
        'support.form.submit': 'Creer le ticket',
        'support.toast.create_success': 'Ticket cree.',
        'support.toast.create_error': 'Impossible de creer le ticket.',
        'support.toast.status_success': 'Statut du ticket mis a jour.',
        'support.toast.status_error': 'Impossible de mettre a jour le statut.',
        'support.toast.priority_success': 'Priorite du ticket mise a jour.',
        'support.toast.priority_error': 'Impossible de mettre a jour la priorite.',
        'support.author.client': 'Client',
        'support.author.partner': 'Partenaire',
        'support.status.all': 'Tous les statuts',
        'support.status.open': 'Ouvert',
        'support.status.in_progress': 'En cours',
        'support.status.resolved': 'Resolu',
        'support.status.closed': 'Ferme',
        'support.priority.low': 'Basse',
        'support.priority.medium': 'Moyenne',
        'support.priority.high': 'Haute',
        'support.priority.urgent': 'Urgente',

        'admin.blog.home': 'Accueil',
        'admin.blog.admin': 'Admin',
        'admin.blog.title': 'Gestion du blog',
        'admin.blog.new': 'Nouvel article',
        'admin.blog.all': 'Tous',
        'admin.blog.published': 'Publies',
        'admin.blog.drafts': 'Brouillons',
        'admin.blog.empty': 'Aucun article pour ce filtre.',
        'admin.blog.column.title': 'Titre',
        'admin.blog.column.status': 'Statut',
        'admin.blog.column.tags': 'Tags',
        'admin.blog.column.date': 'Date',
        'admin.blog.edit': 'Modifier',
        'admin.blog.publish': 'Publier',
        'admin.blog.unpublish': 'Depublier',
        'admin.blog.confirm': 'Confirmer ?',
        'admin.blog.yes': 'Oui',
        'admin.blog.no': 'Non',
        'admin.blog.updated': 'Mis a jour',
        'admin.blog.status.published': 'Publie',
        'admin.blog.status.draft': 'Brouillon',
        'admin.blog.toast.publish': 'Article publie.',
        'admin.blog.toast.unpublish': 'Article repasse en brouillon.',
        'admin.blog.toast.status_error': "Impossible de mettre a jour le statut de l'article.",
        'admin.blog.toast.delete_success': 'Article supprime.',
        'admin.blog.toast.delete_error': "Impossible de supprimer l'article.",
        'admin.blog.delete_aria': 'Supprimer',

        'admin.blog.editor.edit': "Modifier l'article",
        'admin.blog.editor.new': 'Nouvel article',
        'admin.blog.editor.author': 'Auteur connecte',
        'admin.blog.editor.title': 'Titre',
        'admin.blog.editor.slug': 'Slug URL',
        'admin.blog.editor.excerpt': 'Extrait',
        'admin.blog.editor.content': 'Contenu (HTML)',
        'admin.blog.editor.edit_tab': 'Editeur',
        'admin.blog.editor.preview_tab': 'Apercu',
        'admin.blog.editor.cover': 'Image de couverture',
        'admin.blog.editor.tags': 'Tags',
        'admin.blog.editor.status': 'Statut',
        'admin.blog.editor.save': 'Sauvegarder',
        'admin.blog.editor.placeholder.title': "Titre de l'article",
        'admin.blog.editor.placeholder.slug': 'mon-article-de-blog',
        'admin.blog.editor.placeholder.excerpt': "Resume court affiche dans les listes d'articles...",
        'admin.blog.editor.placeholder.content': '<h2>Introduction</h2><p>Votre contenu ici...</p>',
        'admin.blog.editor.placeholder.preview': 'Aucun contenu a afficher.',
        'admin.blog.editor.placeholder.tags': 'voyage, algarve, inspiration',
        'admin.blog.editor.cover_upload': 'Televerser une image',
        'admin.blog.editor.cover_success': 'Image de couverture televersee.',
        'admin.blog.editor.cover_error': 'Le televersement de la couverture a echoue.',
        'admin.blog.editor.cover_hint': "Televerse une image de couverture pour l'article.",
        'admin.blog.editor.cover_uploading': 'Televersement en cours...',
        'admin.blog.editor.cover_preview': 'Apercu couverture',
        'admin.blog.editor.cover_remove': 'Retirer la couverture',
        'admin.blog.editor.save_success_create': 'Article cree avec succes.',
        'admin.blog.editor.save_success_update': 'Article mis a jour avec succes.',
        'admin.blog.editor.save_error': "Impossible de sauvegarder l'article.",
        'admin.blog.editor.validate_error': 'Veuillez corriger les erreurs avant de continuer.',
        'admin.blog.editor.error.title': 'Le titre est obligatoire.',
        'admin.blog.editor.error.slug': 'Le slug est obligatoire.',
        'admin.blog.editor.error.excerpt': "L'extrait est obligatoire.",
        'admin.blog.editor.error.content': 'Le contenu est obligatoire.',
        'admin.blog.editor.tags_hint': 'Separez les tags par des virgules.',
        'admin.blog.editor.tags_aria': "Tags de l'article",
        'admin.blog.editor.actions.saving': 'Enregistrement...',
        'admin.blog.editor.actions.uploading': 'Televersement...',
        'admin.blog.editor.actions.update': 'Mettre a jour',
        'admin.blog.editor.actions.publish': 'Publier',
        'admin.blog.editor.actions.save_draft': 'Enregistrer le brouillon',
        'admin.blog.editor.actions.save': 'Enregistrer',
        'admin.blog.editor.actions.back': 'Retour a la liste',
    },
    pt: {},
    en: {},
    es: {},
    it: {},
    de: {},
};

const translatedLocales: Locale[] = ['pt', 'en', 'es', 'it', 'de'];

for (const locale of translatedLocales) {
    translations[locale] = {
        ...translations.fr,
        'nav.home':
            locale === 'en'
                ? 'Home'
                : locale === 'pt'
                  ? 'Inicio'
                  : locale === 'es'
                    ? 'Inicio'
                    : locale === 'it'
                      ? 'Home'
                      : 'Startseite',
        'nav.search':
            locale === 'en'
                ? 'Search'
                : locale === 'pt'
                  ? 'Pesquisar'
                  : locale === 'es'
                    ? 'Buscar'
                    : locale === 'it'
                      ? 'Ricerca'
                      : 'Suche',
        'nav.login':
            locale === 'en'
                ? 'Login'
                : locale === 'pt'
                  ? 'Entrar'
                  : locale === 'es'
                    ? 'Iniciar sesion'
                    : locale === 'it'
                      ? 'Accedi'
                      : 'Anmelden',
        'nav.register':
            locale === 'en'
                ? 'Register'
                : locale === 'pt'
                  ? 'Registar'
                  : locale === 'es'
                    ? 'Registrarse'
                    : locale === 'it'
                      ? 'Registrati'
                      : 'Registrieren',
        'nav.logout':
            locale === 'en'
                ? 'Logout'
                : locale === 'pt'
                  ? 'Sair'
                  : locale === 'es'
                    ? 'Cerrar sesion'
                    : locale === 'it'
                      ? 'Esci'
                      : 'Abmelden',
        'nav.partner':
            locale === 'en'
                ? 'Partner area'
                : locale === 'pt'
                  ? 'Area parceiro'
                  : locale === 'es'
                    ? 'Area socio'
                    : locale === 'it'
                      ? 'Area partner'
                      : 'Partnerbereich',
        'nav.admin':
            locale === 'en'
                ? 'Administration'
                : locale === 'pt'
                  ? 'Administracao'
                  : locale === 'es'
                    ? 'Administracion'
                    : locale === 'it'
                      ? 'Amministrazione'
                      : 'Verwaltung',
        'nav.become_partner':
            locale === 'en'
                ? 'Become a partner'
                : locale === 'pt'
                  ? 'Tornar-se parceiro'
                  : locale === 'es'
                    ? 'Hazte socio'
                    : locale === 'it'
                      ? 'Diventa partner'
                      : 'Partner werden',
        'common.loading':
            locale === 'en'
                ? 'Loading...'
                : locale === 'pt'
                  ? 'A carregar...'
                  : locale === 'es'
                    ? 'Cargando...'
                    : locale === 'it'
                      ? 'Caricamento...'
                      : 'Laden...',
        'common.close':
            locale === 'en'
                ? 'Close'
                : locale === 'pt'
                  ? 'Fechar'
                  : locale === 'es'
                    ? 'Cerrar'
                    : locale === 'it'
                      ? 'Chiudi'
                      : 'Schliessen',
        'common.cancel':
            locale === 'en'
                ? 'Cancel'
                : locale === 'pt'
                  ? 'Cancelar'
                  : locale === 'es'
                    ? 'Cancelar'
                    : locale === 'it'
                      ? 'Annulla'
                      : 'Abbrechen',
        'common.create':
            locale === 'en'
                ? 'Create'
                : locale === 'pt'
                  ? 'Criar'
                  : locale === 'es'
                    ? 'Crear'
                    : locale === 'it'
                      ? 'Crea'
                      : 'Erstellen',
        'common.save':
            locale === 'en'
                ? 'Save'
                : locale === 'pt'
                  ? 'Guardar'
                  : locale === 'es'
                    ? 'Guardar'
                    : locale === 'it'
                      ? 'Salva'
                      : 'Speichern',
        'common.system':
            locale === 'en'
                ? 'System'
                : locale === 'pt'
                  ? 'Sistema'
                  : locale === 'es'
                    ? 'Sistema'
                    : locale === 'it'
                      ? 'Sistema'
                      : 'System',
        'common.light':
            locale === 'en'
                ? 'Light'
                : locale === 'pt'
                  ? 'Claro'
                  : locale === 'es'
                    ? 'Claro'
                    : locale === 'it'
                      ? 'Chiaro'
                      : 'Hell',
        'common.dark':
            locale === 'en'
                ? 'Dark'
                : locale === 'pt'
                  ? 'Escuro'
                  : locale === 'es'
                    ? 'Oscuro'
                    : locale === 'it'
                      ? 'Scuro'
                      : 'Dunkel',
        'theme.change':
            locale === 'en'
                ? 'Change theme'
                : locale === 'pt'
                  ? 'Mudar tema'
                  : locale === 'es'
                    ? 'Cambiar tema'
                    : locale === 'it'
                      ? 'Cambia tema'
                      : 'Theme wechseln',
        'language.change':
            locale === 'en'
                ? 'Change language'
                : locale === 'pt'
                  ? 'Mudar idioma'
                  : locale === 'es'
                    ? 'Cambiar idioma'
                    : locale === 'it'
                      ? 'Cambia lingua'
                      : 'Sprache wechseln',
        'blog.read_more':
            locale === 'en'
                ? 'Read article'
                : locale === 'pt'
                  ? 'Ler artigo'
                  : locale === 'es'
                    ? 'Leer articulo'
                    : locale === 'it'
                      ? "Leggi l'articolo"
                      : 'Artikel lesen',
        'support.new_ticket':
            locale === 'en'
                ? 'New ticket'
                : locale === 'pt'
                  ? 'Novo ticket'
                  : locale === 'es'
                    ? 'Nuevo ticket'
                    : locale === 'it'
                      ? 'Nuovo ticket'
                      : 'Neues Ticket',
        'support.ticket_subject':
            locale === 'en'
                ? 'Subject'
                : locale === 'pt'
                  ? 'Assunto'
                  : locale === 'es'
                    ? 'Asunto'
                    : locale === 'it'
                      ? 'Oggetto'
                      : 'Betreff',
        'support.ticket_message':
            locale === 'en'
                ? 'Message'
                : locale === 'pt'
                  ? 'Mensagem'
                  : locale === 'es'
                    ? 'Mensaje'
                    : locale === 'it'
                      ? 'Messaggio'
                      : 'Nachricht',
        'support.ticket_date':
            locale === 'en'
                ? 'Date'
                : locale === 'pt'
                  ? 'Data'
                  : locale === 'es'
                    ? 'Fecha'
                    : locale === 'it'
                      ? 'Data'
                      : 'Datum',
        'support.ticket_actions':
            locale === 'en'
                ? 'Actions'
                : locale === 'pt'
                  ? 'Acoes'
                  : locale === 'es'
                    ? 'Acciones'
                    : locale === 'it'
                      ? 'Azioni'
                      : 'Aktionen',
        'support.ticket_initial_message':
            locale === 'en'
                ? 'Initial message'
                : locale === 'pt'
                  ? 'Mensagem inicial'
                  : locale === 'es'
                    ? 'Mensaje inicial'
                    : locale === 'it'
                      ? 'Messaggio iniziale'
                      : 'Erste Nachricht',
    };
}

const TEXT_REPAIRS: Array<[string, string]> = [
    ['Ã€', 'À'],
    ['Ã‚', 'Â'],
    ['Ã„', 'Ä'],
    ['Ã‡', 'Ç'],
    ['Ãˆ', 'È'],
    ['Ã‰', 'É'],
    ['ÃŠ', 'Ê'],
    ['Ã‹', 'Ë'],
    ['ÃŽ', 'Î'],
    ['ÃÏ', 'Ï'],
    ['Ã”', 'Ô'],
    ['Ã–', 'Ö'],
    ['Ã™', 'Ù'],
    ['Ã›', 'Û'],
    ['Ãœ', 'Ü'],
    ['Ã ', 'à'],
    ['Ã¢', 'â'],
    ['Ã¤', 'ä'],
    ['Ã§', 'ç'],
    ['Ã¨', 'è'],
    ['Ã©', 'é'],
    ['Ãª', 'ê'],
    ['Ã«', 'ë'],
    ['Ã®', 'î'],
    ['Ã¯', 'ï'],
    ['Ã´', 'ô'],
    ['Ã¶', 'ö'],
    ['Ã¹', 'ù'],
    ['Ã»', 'û'],
    ['Ã¼', 'ü'],
    ['Ã±', 'ñ'],
    ['â€™', '’'],
    ['â€œ', '“'],
    ['â€\u009d', '”'],
    ['â€“', '–'],
    ['â€”', '—'],
    ['â€¦', '…'],
    ['â€¢', '•'],
    ['âˆ’', '−'],
    ['âœ“', '✓'],
    ['Â·', '·'],
    ['Â', ''],
];

function repairVisibleText(value: string): string {
    return TEXT_REPAIRS.reduce(
        (carry, [broken, fixed]) => carry.split(broken).join(fixed),
        value,
    );
}

export function useTranslation() {
    const { props } = usePage<{ locale: Locale }>();
    const locale = props.locale || 'fr';

    const t = useCallback(
        (key: string): string =>
            repairVisibleText(
                translations[locale]?.[key] ?? translations.fr[key] ?? key,
            ),
        [locale],
    );

    const setLocale = (newLocale: Locale) => {
        const maxAge = 365 * 24 * 60 * 60;
        document.cookie = `locale=${newLocale};path=/;max-age=${maxAge};SameSite=Lax`;
        window.location.reload();
    };

    return {
        t,
        locale,
        intlLocale: INTL_LOCALES[locale],
        setLocale,
    };
}
