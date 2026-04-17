import { usePage } from "@inertiajs/react";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useCallback, useEffect } from "react";
import {
    initReactI18next,
    useTranslation as useI18nextTranslation,
} from "react-i18next";
import {
    FALLBACK_LOCALE,
    INTL_LOCALES,
    type Locale,
    normalizeLocale,
    withLocale,
} from "@/lib/locale";
import { buildAuthBookingFrTranslations } from "@/translations/authBookingFr";
import { buildDiscoveryFrTranslations } from "@/translations/discoveryFr";
import { buildFareHarborTranslations } from "@/translations/fareHarbor";
import { buildPublicPagesFrTranslations } from "@/translations/publicPagesFr";
import { buildServiceFrTranslations } from "@/translations/serviceFr";
import { buildSharedUiTranslations } from "@/translations/sharedUi";

export type { Locale } from "@/lib/locale";

function fareHarborTranslations(locale: Locale): Record<string, string> {
    switch (locale) {
        case "pt":
            return {
                "service.external_badge": "Disponibilidade em direto",
                "service.external_powered_by": "Reserva na Wandireo",
                "service.external_title": "Reserva disponível na Wandireo",
                "service.external_desc":
                    "A disponibilidade é sincronizada em tempo real para esta atividade.",
                "service.external_cta": "Reservar",
                "service.external_note":
                    "A disponibilidade apresentada é sincronizada em tempo real.",
                "service.external_realtime": "Disponibilidade em tempo real.",
                "service.external_price_label": "Preço",
                "service.external_price_total_label":
                    "Preço total comunicado pelo parceiro",
                "service.external_price_total_unknown": "Total não comunicado",
                "service.external_deposit_required":
                    "Caução de {amount} exigida",
                "service.external_commission_guaranteed":
                    "A comissão Wandireo mantém-se garantida.",
                "service.external_price_confirmed_partner":
                    "O valor final é comunicado antes da validação da reserva.",
                "service.external_price_unavailable": "Preço sob consulta",
                "admin.services.fareharbor.eyebrow": "Integração externa",
                "admin.services.fareharbor.subtitle":
                    "{companies} empresa(s) monitorizada(s), {services} serviço(s) importado(s).",
                "admin.services.fareharbor.sync_all": "Sincronizar tudo",
                "admin.services.fareharbor.display_name_placeholder":
                    "Nome visível",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Itens",
                "admin.services.fareharbor.details": "Detalhes",
                "admin.services.fareharbor.add": "Adicionar",
                "admin.services.fareharbor.loading":
                    "A carregar a configuração FareHarbor...",
                "admin.services.fareharbor.empty":
                    "Nenhuma empresa FareHarbor configurada.",
                "admin.services.fareharbor.items_count": "{count} item(s)",
                "admin.services.fareharbor.last_sync": "Última sincronização:",
                "admin.services.fareharbor.never_synced": "Nunca sincronizado",
                "admin.services.fareharbor.enabled": "Ativo",
                "admin.services.fareharbor.sync_items": "Sincronizar itens",
                "admin.services.fareharbor.sync_details":
                    "Sincronizar detalhes",
                "admin.services.fareharbor.sync": "Sincronizar",
                "admin.services.fareharbor.toast.required":
                    "O nome e o slug FareHarbor são obrigatórios.",
                "admin.services.fareharbor.toast.created":
                    "Empresa FareHarbor adicionada.",
                "admin.services.fareharbor.toast.create_error":
                    "Não foi possível adicionar a empresa FareHarbor.",
                "admin.services.fareharbor.toast.updated":
                    "Configuração FareHarbor atualizada.",
                "admin.services.fareharbor.toast.update_error":
                    "A atualização FareHarbor falhou.",
                "admin.services.fareharbor.toast.sync_success":
                    "Sincronização iniciada para {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "A sincronização de {name} falhou.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Sincronização global FareHarbor concluída.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "A sincronização global FareHarbor falhou.",
                "admin.services.fareharbor.status.idle": "Em espera",
                "admin.services.fareharbor.status.syncing": "Sincronizando",
                "admin.services.fareharbor.status.success": "Sucesso",
                "admin.services.fareharbor.status.failed": "Falhou",
            };
        case "en":
            return {
                "service.external_badge": "Live availability",
                "service.external_powered_by": "Booking on Wandireo",
                "service.external_title": "Booking available on Wandireo",
                "service.external_desc":
                    "Availability is synced in real time for this activity.",
                "service.external_cta": "Book now",
                "service.external_note":
                    "Displayed availability is synced in real time.",
                "service.external_realtime": "Real-time availability.",
                "service.external_price_label": "Price",
                "service.external_price_total_label":
                    "Total price shared by the partner",
                "service.external_price_total_unknown": "Total not provided",
                "service.external_deposit_required":
                    "Deposit of {amount} required",
                "service.external_commission_guaranteed":
                    "The Wandireo commission remains guaranteed.",
                "service.external_price_confirmed_partner":
                    "The final amount is shared before booking confirmation.",
                "service.external_price_unavailable": "Price on request",
                "admin.services.fareharbor.eyebrow": "External integration",
                "admin.services.fareharbor.subtitle":
                    "{companies} tracked companie(s), {services} imported service(s).",
                "admin.services.fareharbor.sync_all": "Sync all",
                "admin.services.fareharbor.display_name_placeholder":
                    "Display name",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Items",
                "admin.services.fareharbor.details": "Details",
                "admin.services.fareharbor.add": "Add",
                "admin.services.fareharbor.loading":
                    "Loading FareHarbor configuration...",
                "admin.services.fareharbor.empty":
                    "No FareHarbor companies configured.",
                "admin.services.fareharbor.items_count": "{count} item(s)",
                "admin.services.fareharbor.last_sync": "Last sync:",
                "admin.services.fareharbor.never_synced": "Never synced",
                "admin.services.fareharbor.enabled": "Enabled",
                "admin.services.fareharbor.sync_items": "Sync items",
                "admin.services.fareharbor.sync_details": "Sync details",
                "admin.services.fareharbor.sync": "Sync",
                "admin.services.fareharbor.toast.required":
                    "FareHarbor name and slug are required.",
                "admin.services.fareharbor.toast.created":
                    "FareHarbor company added.",
                "admin.services.fareharbor.toast.create_error":
                    "Unable to add the FareHarbor company.",
                "admin.services.fareharbor.toast.updated":
                    "FareHarbor configuration updated.",
                "admin.services.fareharbor.toast.update_error":
                    "FareHarbor update failed.",
                "admin.services.fareharbor.toast.sync_success":
                    "Sync started for {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "Sync failed for {name}.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Global FareHarbor sync completed.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "Global FareHarbor sync failed.",
                "admin.services.fareharbor.status.idle": "Idle",
                "admin.services.fareharbor.status.syncing": "Syncing",
                "admin.services.fareharbor.status.success": "Success",
                "admin.services.fareharbor.status.failed": "Failed",
            };
        case "es":
            return {
                "service.external_badge": "Disponibilidad en directo",
                "service.external_powered_by": "Reserva en Wandireo",
                "service.external_title": "Reserva disponible en Wandireo",
                "service.external_desc":
                    "La disponibilidad se sincroniza en tiempo real para esta actividad.",
                "service.external_cta": "Reservar",
                "service.external_note":
                    "La disponibilidad mostrada está sincronizada en tiempo real.",
                "service.external_realtime": "Disponibilidad en tiempo real.",
                "service.external_price_label": "Precio",
                "service.external_price_total_label":
                    "Precio total comunicado por el socio",
                "service.external_price_total_unknown": "Total no comunicado",
                "service.external_deposit_required":
                    "Depósito de {amount} requerido",
                "service.external_commission_guaranteed":
                    "La comisión de Wandireo sigue garantizada.",
                "service.external_price_confirmed_partner":
                    "El importe final se comunica antes de validar la reserva.",
                "service.external_price_unavailable": "Precio bajo consulta",
                "admin.services.fareharbor.eyebrow": "Integración externa",
                "admin.services.fareharbor.subtitle":
                    "{companies} empresa(s) seguida(s), {services} servicio(s) importado(s).",
                "admin.services.fareharbor.sync_all": "Sincronizar todo",
                "admin.services.fareharbor.display_name_placeholder":
                    "Nombre visible",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Ítems",
                "admin.services.fareharbor.details": "Detalles",
                "admin.services.fareharbor.add": "Añadir",
                "admin.services.fareharbor.loading":
                    "Cargando la configuración de FareHarbor...",
                "admin.services.fareharbor.empty":
                    "No hay empresas FareHarbor configuradas.",
                "admin.services.fareharbor.items_count": "{count} ítem(s)",
                "admin.services.fareharbor.last_sync": "Última sincronización:",
                "admin.services.fareharbor.never_synced": "Nunca sincronizado",
                "admin.services.fareharbor.enabled": "Activo",
                "admin.services.fareharbor.sync_items": "Sincronizar ítems",
                "admin.services.fareharbor.sync_details":
                    "Sincronizar detalles",
                "admin.services.fareharbor.sync": "Sincronizar",
                "admin.services.fareharbor.toast.required":
                    "El nombre y el slug de FareHarbor son obligatorios.",
                "admin.services.fareharbor.toast.created":
                    "Empresa FareHarbor añadida.",
                "admin.services.fareharbor.toast.create_error":
                    "No se pudo añadir la empresa FareHarbor.",
                "admin.services.fareharbor.toast.updated":
                    "Configuración de FareHarbor actualizada.",
                "admin.services.fareharbor.toast.update_error":
                    "La actualización de FareHarbor falló.",
                "admin.services.fareharbor.toast.sync_success":
                    "Sincronización iniciada para {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "La sincronización de {name} falló.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Sincronización global de FareHarbor completada.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "La sincronización global de FareHarbor falló.",
                "admin.services.fareharbor.status.idle": "En espera",
                "admin.services.fareharbor.status.syncing": "Sincronizando",
                "admin.services.fareharbor.status.success": "Éxito",
                "admin.services.fareharbor.status.failed": "Falló",
            };
        case "it":
            return {
                "service.external_badge": "Disponibilità live",
                "service.external_powered_by": "Prenotazione su Wandireo",
                "service.external_title":
                    "Prenotazione disponibile su Wandireo",
                "service.external_desc":
                    "La disponibilità è sincronizzata in tempo reale per questa attività.",
                "service.external_cta": "Prenota",
                "service.external_note":
                    "La disponibilità mostrata è sincronizzata in tempo reale.",
                "service.external_realtime": "Disponibilità in tempo reale.",
                "service.external_price_label": "Prezzo",
                "service.external_price_total_label":
                    "Prezzo totale comunicato dal partner",
                "service.external_price_total_unknown": "Totale non comunicato",
                "service.external_deposit_required":
                    "Deposito di {amount} richiesto",
                "service.external_commission_guaranteed":
                    "La commissione Wandireo resta garantita.",
                "service.external_price_confirmed_partner":
                    "L'importo finale viene comunicato prima della conferma della prenotazione.",
                "service.external_price_unavailable": "Prezzo su richiesta",
                "admin.services.fareharbor.eyebrow": "Integrazione esterna",
                "admin.services.fareharbor.subtitle":
                    "{companies} azienda(e) monitorata(e), {services} servizio(i) importato(i).",
                "admin.services.fareharbor.sync_all": "Sincronizza tutto",
                "admin.services.fareharbor.display_name_placeholder":
                    "Nome visualizzato",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Elementi",
                "admin.services.fareharbor.details": "Dettagli",
                "admin.services.fareharbor.add": "Aggiungi",
                "admin.services.fareharbor.loading":
                    "Caricamento configurazione FareHarbor...",
                "admin.services.fareharbor.empty":
                    "Nessuna azienda FareHarbor configurata.",
                "admin.services.fareharbor.items_count": "{count} elemento/i",
                "admin.services.fareharbor.last_sync":
                    "Ultima sincronizzazione:",
                "admin.services.fareharbor.never_synced": "Mai sincronizzato",
                "admin.services.fareharbor.enabled": "Attivo",
                "admin.services.fareharbor.sync_items": "Sincronizza elementi",
                "admin.services.fareharbor.sync_details":
                    "Sincronizza dettagli",
                "admin.services.fareharbor.sync": "Sincronizza",
                "admin.services.fareharbor.toast.required":
                    "Nome e slug FareHarbor sono obbligatori.",
                "admin.services.fareharbor.toast.created":
                    "Azienda FareHarbor aggiunta.",
                "admin.services.fareharbor.toast.create_error":
                    "Impossibile aggiungere l'azienda FareHarbor.",
                "admin.services.fareharbor.toast.updated":
                    "Configurazione FareHarbor aggiornata.",
                "admin.services.fareharbor.toast.update_error":
                    "Aggiornamento FareHarbor non riuscito.",
                "admin.services.fareharbor.toast.sync_success":
                    "Sincronizzazione avviata per {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "La sincronizzazione di {name} non è riuscita.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Sincronizzazione globale FareHarbor completata.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "Sincronizzazione globale FareHarbor non riuscita.",
                "admin.services.fareharbor.status.idle": "In attesa",
                "admin.services.fareharbor.status.syncing": "Sincronizzazione",
                "admin.services.fareharbor.status.success": "Successo",
                "admin.services.fareharbor.status.failed": "Errore",
            };
        case "de":
            return {
                "service.external_badge": "Live-Verfügbarkeit",
                "service.external_powered_by": "Buchung auf Wandireo",
                "service.external_title": "Buchung auf Wandireo verfügbar",
                "service.external_desc":
                    "Die Verfügbarkeit wird für diese Aktivität in Echtzeit synchronisiert.",
                "service.external_cta": "Buchen",
                "service.external_note":
                    "Die angezeigte Verfügbarkeit wird in Echtzeit synchronisiert.",
                "service.external_realtime": "Echtzeit-Verfügbarkeit.",
                "service.external_price_label": "Preis",
                "service.external_price_total_label":
                    "Vom Partner mitgeteilter Gesamtpreis",
                "service.external_price_total_unknown":
                    "Gesamtpreis nicht angegeben",
                "service.external_deposit_required":
                    "Kaution von {amount} erforderlich",
                "service.external_commission_guaranteed":
                    "Die Wandireo-Provision bleibt gesichert.",
                "service.external_price_confirmed_partner":
                    "Der endgültige Betrag wird vor der Buchungsbestätigung mitgeteilt.",
                "service.external_price_unavailable": "Preis auf Anfrage",
                "admin.services.fareharbor.eyebrow": "Externe Integration",
                "admin.services.fareharbor.subtitle":
                    "{companies} verfolgte Firma(en), {services} importierte Dienste.",
                "admin.services.fareharbor.sync_all": "Alles synchronisieren",
                "admin.services.fareharbor.display_name_placeholder":
                    "Anzeigename",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Elemente",
                "admin.services.fareharbor.details": "Details",
                "admin.services.fareharbor.add": "Hinzufügen",
                "admin.services.fareharbor.loading":
                    "FareHarbor-Konfiguration wird geladen...",
                "admin.services.fareharbor.empty":
                    "Keine FareHarbor-Firmen konfiguriert.",
                "admin.services.fareharbor.items_count": "{count} Element(e)",
                "admin.services.fareharbor.last_sync":
                    "Letzte Synchronisierung:",
                "admin.services.fareharbor.never_synced": "Nie synchronisiert",
                "admin.services.fareharbor.enabled": "Aktiv",
                "admin.services.fareharbor.sync_items":
                    "Elemente synchronisieren",
                "admin.services.fareharbor.sync_details":
                    "Details synchronisieren",
                "admin.services.fareharbor.sync": "Synchronisieren",
                "admin.services.fareharbor.toast.required":
                    "FareHarbor-Name und Slug sind erforderlich.",
                "admin.services.fareharbor.toast.created":
                    "FareHarbor-Firma hinzugefügt.",
                "admin.services.fareharbor.toast.create_error":
                    "Die FareHarbor-Firma konnte nicht hinzugefügt werden.",
                "admin.services.fareharbor.toast.updated":
                    "FareHarbor-Konfiguration aktualisiert.",
                "admin.services.fareharbor.toast.update_error":
                    "FareHarbor-Aktualisierung fehlgeschlagen.",
                "admin.services.fareharbor.toast.sync_success":
                    "Synchronisierung für {name} gestartet.",
                "admin.services.fareharbor.toast.sync_error":
                    "Die Synchronisierung für {name} ist fehlgeschlagen.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Globale FareHarbor-Synchronisierung abgeschlossen.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "Globale FareHarbor-Synchronisierung fehlgeschlagen.",
                "admin.services.fareharbor.status.idle": "Leerlauf",
                "admin.services.fareharbor.status.syncing": "Synchronisiert",
                "admin.services.fareharbor.status.success": "Erfolg",
                "admin.services.fareharbor.status.failed": "Fehlgeschlagen",
            };
        default:
            return {};
    }
}

const translations: Record<Locale, Record<string, string>> = {
    fr: {
        ...buildAuthBookingFrTranslations(),
        ...buildDiscoveryFrTranslations(),
        ...buildServiceFrTranslations(),
        ...buildSharedUiTranslations("fr"),
        "nav.home": "Accueil",
        "nav.search": "Recherche",
        "nav.blog": "Blog",
        "nav.login": "Connexion",
        "nav.register": "Inscription",
        "nav.partner": "Espace partenaire",
        "nav.admin": "Administration",
        "nav.logout": "Déconnexion",
        "nav.become_partner": "Devenir partenaire",

        "common.loading": "Chargement...",
        "common.close": "Fermer",
        "common.view": "Voir",
        "common.create": "Créer",
        "common.cancel": "Annuler",
        "common.save": "Enregistrer",
        "common.system": "Système",
        "common.light": "Clair",
        "common.dark": "Sombre",
        "common.back_home": "Retour à l'accueil",
        "common.previous_page": "Page précédente",
        "common.next_page": "Page suivante",
        "common.page_number": "Page {page}",

        "theme.label": "Thème",
        "theme.change": "Changer le thème",
        "theme.light": "Mode clair",
        "theme.dark": "Mode sombre",
        "theme.system": "Suivre le système",
        "language.change": "Changer la langue",
        "header.logo_aria": "Wandireo - Retour à l'accueil",
        "header.primary_nav_aria": "Navigation principale",
        "header.open_menu": "Ouvrir le menu de navigation",
        "header.dashboard": "Tableau de bord",
        "header.catalog": "Catalogue",
        "header.admin_users": "Utilisateurs",
        "sidebar.mobile_nav": "Menu de navigation mobile",
        "sidebar.logo_aria": "Wandireo - Retour à l'accueil",
        "sidebar.close_menu": "Fermer le menu",
        "sidebar.service_categories": "Catégories de services",
        "sidebar.discover": "Découvrir",
        "sidebar.additional_links": "Liens supplémentaires",
        "sidebar.brand": "Wandireo",
        "sidebar.contact_us": "Nous contacter",
        "sidebar.create_account": "Créer un compte",
        "sidebar.role.partner": "Partenaire",
        "sidebar.role.admin": "Administrateur",
        "sidebar.role.traveler": "Voyageur",

        "partner.register.title": "Devenez partenaire",
        "partner.register.subtitle":
            "Proposez vos services à des milliers de voyageurs sur Wandireo",
        "partner.register.success_title": "Demande envoyée !",
        "partner.register.success_text":
            "Votre dossier de candidature a bien été reçu. Notre équipe va examiner votre demande et vous contactera à cette adresse sous 48 à 72 heures.",
        "partner.register.personal": "Informations personnelles",
        "partner.register.company": "Informations société",
        "partner.register.security": "Sécurité",
        "partner.register.business_email": "Adresse e-mail professionnelle",
        "partner.register.phone": "Téléphone",
        "partner.register.company_name": "Nom de l'entreprise",
        "partner.register.address": "Adresse professionnelle",
        "partner.register.hint":
            "Un justificatif d'activité vous sera demandé lors de la validation de votre compte.",
        "partner.register.submit": "Envoyer ma candidature",
        "partner.register.have_account": "Déjà partenaire ?",
        "partner.register.login": "Se connecter",
        "partner.register.error.first_name": "Le prénom est requis.",
        "partner.register.error.last_name": "Le nom est requis.",
        "partner.register.error.email": "Adresse e-mail valide requise.",
        "partner.register.error.company": "Le nom de l'entreprise est requis.",
        "partner.register.error.address":
            "L'adresse professionnelle est requise.",
        "partner.register.error.password":
            "Mot de passe de 6 caractères minimum.",
        "partner.register.error.password_match":
            "Les mots de passe ne correspondent pas.",

        "favorites.title": "Mes favoris",
        "favorites.count_one": "service sauvegardé",
        "favorites.count_other": "services sauvegardés",
        "favorites.empty_title": "Aucun favori pour le moment",
        "favorites.empty_desc":
            "Parcourez nos services et cliquez sur le cœur pour les retrouver ici.",
        "favorites.discover": "Découvrir les services",
        "favorites.remove": "Retirer",
        "favorites.remove_aria": "Retirer {title} des favoris",

        "dashboard.hero_label": "Bienvenue",
        "dashboard.greeting": "Mon espace voyageur",
        "dashboard.avatar_label": "Avatar de {name}",
        "dashboard.member_since": "Membre Wandireo depuis le {date}",
        "dashboard.stats_label": "Statistiques",
        "dashboard.upcoming_one": "Voyage à venir",
        "dashboard.upcoming_other": "Voyages à venir",
        "dashboard.completed_one": "Voyage effectué",
        "dashboard.completed_other": "Voyages effectués",
        "dashboard.spent_online": "Payé en ligne",
        "dashboard.upcoming_title": "Prochains voyages",
        "dashboard.see_all": "Voir tout",
        "dashboard.trip_confirmed": "Confirmé",
        "dashboard.participants_one": "participant",
        "dashboard.participants_other": "participants",
        "dashboard.empty_title": "Aucun voyage à venir",
        "dashboard.empty_desc":
            "Explorez notre catalogue et réservez votre prochaine aventure.",
        "dashboard.discover": "Découvrir les activités",
        "dashboard.quick_links": "Accès rapides",
        "dashboard.quick.reservations_title": "Mes réservations",
        "dashboard.quick.reservations_desc":
            "Historique et statuts de toutes vos réservations",
        "dashboard.quick.profile_title": "Mon profil",
        "dashboard.quick.profile_desc":
            "Informations personnelles et préférences de voyage",

        "profile.back_dashboard": "Tableau de bord",
        "profile.member_since": "Membre depuis le {date}",
        "profile.personal": "Informations personnelles",
        "profile.preferences": "Préférences de voyage",
        "profile.security": "Sécurité du compte",
        "profile.first_name": "Prénom",
        "profile.last_name": "Nom",
        "profile.email": "Adresse e-mail",
        "profile.phone": "Numéro de téléphone",
        "profile.language": "Langue d'interface",
        "profile.currency": "Devise préférée",
        "profile.readonly_note":
            "Contactez le support pour modifier cet élément.",
        "profile.saving": "Enregistrement...",
        "profile.save": "Enregistrer les modifications",
        "profile.save_success_title": "Profil sauvegardé",
        "profile.save_success_desc":
            "Votre profil a été mis à jour avec succès.",
        "profile.password": "Mot de passe",
        "profile.password_desc":
            "Modifiable via le lien envoyé à votre adresse e-mail.",
        "profile.two_factor": "Double authentification",
        "profile.two_factor_desc": "Non configurée - disponible prochainement.",
        "profile.sessions": "Sessions actives",
        "profile.sessions_desc": "1 session active (cet appareil)",

        "partner.dashboard.title": "Espace Partenaire",
        "partner.dashboard.member_since":
            "Partenaire Wandireo depuis le {date}",
        "partner.dashboard.stats": "Statistiques",
        "partner.dashboard.revenue_total": "Revenus totaux",
        "partner.dashboard.revenue_month": "Revenus ce mois",
        "partner.dashboard.bookings_month_one": "Réservation ce mois",
        "partner.dashboard.bookings_month_other": "Réservations ce mois",
        "partner.dashboard.pending_one": "Demande en attente",
        "partner.dashboard.pending_other": "Demandes en attente",
        "partner.dashboard.action_required": "Action requise",
        "partner.dashboard.shortcuts": "Accès rapides",
        "partner.dashboard.management": "Gestion",
        "partner.dashboard.catalog": "Mon catalogue",
        "partner.dashboard.active_service_one": "service actif",
        "partner.dashboard.active_service_other": "services actifs",
        "partner.dashboard.reservations": "Réservations",
        "partner.dashboard.process_one": "{count} demande à traiter",
        "partner.dashboard.process_other": "{count} demandes à traiter",
        "partner.dashboard.up_to_date": "Tout est à jour",
        "partner.dashboard.recent": "Activité récente",
        "partner.dashboard.see_all": "Voir tout",
        "partner.dashboard.empty": "Aucune réservation pour le moment.",
        "partner.dashboard.avatar_label": "Initiales de {company}",
        "partner.dashboard.catalog_aria": "Accéder à la gestion du catalogue",
        "partner.dashboard.bookings_aria":
            "Accéder à la gestion des réservations",
        "partner.dashboard.pending_badge": "{count} demandes en attente",
        "partner.dashboard.status.confirmed": "Confirmée",
        "partner.dashboard.status.pending": "En attente",
        "partner.dashboard.status.cancelled": "Annulée",
        "partner.profile.title": "Mon profil",
        "partner.profile.since": "Partenaire depuis {year}",
        "partner.profile.add_service": "Ajouter un service",
        "partner.profile.catalog_manage": "Gérer le catalogue",
        "partner.profile.catalog_title": "Mes services",
        "partner.profile.empty": "Aucun service publié pour le moment.",
        "partner.profile.first_service": "Créer mon premier service",
        "partner.profile.rating": "note moyenne",
        "partner.profile.sales": "ventes totales",
        "partner.profile.commission": "taux de commission",
        "partner.pending.title.approved": "Compte partenaire validé",
        "partner.pending.title.rejected": "Demande refusée",
        "partner.pending.title.suspended": "Compte suspendu",
        "partner.pending.title.pending": "Validation en cours",
        "partner.pending.date_missing": "Non renseignée",
        "partner.pending.message.approved":
            "Votre compte est validé. Vous pouvez accéder à votre espace partenaire.",
        "partner.pending.message.rejected":
            "Votre dossier partenaire a été refusé. Contactez l'administration pour le relancer.",
        "partner.pending.message.rejected_with_reason":
            "Votre dossier a été refusé : {reason}",
        "partner.pending.message.suspended":
            "Votre compte partenaire est temporairement suspendu. Contactez l'administration pour clarifier la situation.",
        "partner.pending.message.pending":
            "Votre compte partenaire a bien été créé. Il reste en attente de validation par l'administration et de finalisation du contrat.",
        "partner.pending.account_status": "Statut du compte",
        "partner.pending.contract_status": "Contrat de mandat",
        "partner.pending.admin_validation": "Validation admin",
        "partner.pending.contract_signature": "Signature contrat",
        "partner.pending.company": "Entreprise",
        "partner.pending.contact": "Contact",
        "partner.pending.download_contract": "Télécharger le contrat",
        "partner.pending.open_dashboard": "Ouvrir le dashboard",
        "partner.pending.back_home": "Retour à l'accueil",

        "history.title": "Mes réservations",
        "history.subtitle":
            "Retrouvez l'ensemble de vos réservations et leur statut en temps réel.",
        "history.dashboard": "Mon tableau de bord",
        "history.filters": "Filtres de réservation",
        "history.tab.all": "Toutes",
        "history.tab.upcoming": "À venir",
        "history.tab.past": "Passées",
        "history.tab.cancelled": "Annulées",
        "history.status.cancelled": "Annulée",
        "history.status.pending": "En attente",
        "history.status.confirmed": "Confirmée",
        "history.status.completed": "Terminée",
        "history.payment.paid": "Payé",
        "history.payment.refunded": "Remboursé",
        "history.payment.pending": "Paiement en attente",
        "history.rating.aria": "Réservation {id}",
        "history.user": "Utilisateur",
        "history.reference": "Réf.",
        "history.participants_one": "participant",
        "history.participants_other": "participants",
        "history.extras": "Extras",
        "history.online": "en ligne",
        "history.onsite": "sur place",
        "history.total": "Total",
        "history.review_done": "Avis déposé - merci !",
        "history.review_title": "Votre avis sur ce service",
        "history.review_placeholder":
            "Partagez votre expérience (optionnel)...",
        "history.review_send": "Envoyer",
        "history.review_cancel": "Annuler",
        "history.review_cta": "Laisser un avis",
        "history.review_success": "Votre avis a été publié. Merci !",
        "history.cancellation_reason": "Motif d'annulation :",
        "history.empty.all": "Vous n'avez pas encore effectué de réservation.",
        "history.empty.upcoming": "Aucun voyage à venir pour le moment.",
        "history.empty.past": "Vous n'avez pas encore voyagé avec Wandireo.",
        "history.empty.cancelled": "Aucune réservation annulée.",

        "admin.reviews.title": "Modération des avis",
        "admin.reviews.subtitle":
            "Valide, rejette ou supprime les avis liés aux services et aux partenaires.",
        "admin.reviews.search": "Rechercher un avis, service ou email",
        "admin.reviews.back": "Retour dashboard",
        "admin.reviews.all_statuses": "Tous les statuts",
        "admin.reviews.pending": "En attente",
        "admin.reviews.pending_count": "En attente : {count}",
        "admin.reviews.approved_count": "Validés : {count}",
        "admin.reviews.rejected_count": "Refusés : {count}",
        "admin.reviews.unknown_partner": "Partenaire inconnu",
        "admin.reviews.rating": "Note : {rating}/5",
        "admin.reviews.approve": "Valider",
        "admin.reviews.reject": "Refuser",
        "admin.reviews.delete": "Supprimer",
        "admin.reviews.delete_confirm": "Supprimer cet avis ?",
        "admin.reviews.update_success": "Avis mis à jour.",
        "admin.reviews.update_error": "Impossible de mettre à jour cet avis.",
        "admin.reviews.delete_success": "Avis supprimé.",
        "admin.reviews.delete_error": "Impossible de supprimer cet avis.",
        "admin.reviews.empty": "Aucun avis ne correspond aux filtres.",

        "footer.explore": "Explorer",
        "footer.services": "Services",
        "footer.help": "Aide",
        "footer.legal": "Légal",
        "footer.all_destinations": "Toutes les destinations",
        "footer.boats": "Bateaux et croisières",
        "footer.cars": "Location de voitures",
        "footer.blog": "Blog et conseils voyage",
        "footer.how_it_works": "Comment ça marche",
        "footer.help_center": "Centre d'aide",
        "footer.whatsapp": "Nous contacter sur WhatsApp",
        "footer.booking_email": "Email bookings",
        "footer.terms": "Conditions d'utilisation",
        "footer.privacy": "Confidentialité",
        "footer.legal_notice": "Mentions légales",
        "footer.tagline":
            "Découvrez les meilleures expériences de voyage en Algarve et au-delà. Activités, bateaux, hébergements et voitures au meilleur prix.",
        "footer.socials": "Nos réseaux sociaux",
        "footer.logo_aria": "Wandireo - Retour à l'accueil",
        "footer.faq": "FAQ",
        "footer.social.whatsapp": "Contacter Wandireo sur WhatsApp",
        "footer.social.instagram": "Instagram",
        "footer.social.tiktok": "TikTok",
        "footer.copyright": "Wandireo. Tous droits réservés.",

        "blog.title": "Le blog Wandireo",
        "blog.subtitle":
            "Conseils de voyage, guides de destinations et inspirations pour vos prochaines aventures.",
        "blog.all_posts": "Tous les articles",
        "blog.no_posts": "Aucun article trouvé",
        "blog.no_posts_desc":
            "Essayez un autre thème ou consultez tous nos articles.",
        "blog.related_posts": "Articles similaires",
        "blog.published_on": "Publié le",
        "blog.updated_on": "Mis à jour le",
        "blog.filter_tags": "Filtrer par thème",
        "blog.tags_aria": "Thèmes",
        "blog.read_more": "Lire l'article",
        "blog.cover_alt": "Illustration",
        "blog.cover_fallback": "Article Wandireo",

        "support.title": "Centre de support",
        "support.subtitle":
            "Gestion des tickets internes et demandes utilisateurs.",
        "support.new_ticket": "Nouveau ticket",
        "support.ticket_subject": "Sujet",
        "support.ticket_message": "Message",
        "support.ticket_date": "Date",
        "support.ticket_user": "Utilisateur / partenaire",
        "support.ticket_actions": "Actions",
        "support.ticket_initial_message": "Message initial",
        "support.empty": "Aucun ticket trouvé.",
        "support.form.title": "Créer un ticket interne",
        "support.form.subject_placeholder": "Sujet du ticket",
        "support.form.message_placeholder":
            "Décrivez la demande ou le suivi interne...",
        "support.form.submit": "Créer le ticket",
        "support.toast.create_success": "Ticket créé.",
        "support.toast.create_error": "Impossible de créer le ticket.",
        "support.toast.status_success": "Statut du ticket mis à jour.",
        "support.toast.status_error": "Impossible de mettre à jour le statut.",
        "support.toast.priority_success": "Priorité du ticket mise à jour.",
        "support.toast.priority_error":
            "Impossible de mettre à jour la priorité.",
        "support.author.client": "Client",
        "support.author.partner": "Partenaire",
        "support.status.all": "Tous les statuts",
        "support.status.open": "Ouvert",
        "support.status.in_progress": "En cours",
        "support.status.resolved": "Résolu",
        "support.status.closed": "Fermé",
        "support.priority.low": "Basse",
        "support.priority.medium": "Moyenne",
        "support.priority.high": "Haute",
        "support.priority.urgent": "Urgente",

        "admin.blog.home": "Accueil",
        "admin.blog.admin": "Admin",
        "admin.blog.title": "Gestion du blog",
        "admin.blog.new": "Nouvel article",
        "admin.blog.all": "Tous",
        "admin.blog.published": "Publiés",
        "admin.blog.drafts": "Brouillons",
        "admin.blog.empty": "Aucun article pour ce filtre.",
        "admin.blog.column.title": "Titre",
        "admin.blog.column.status": "Statut",
        "admin.blog.column.tags": "Tags",
        "admin.blog.column.date": "Date",
        "admin.blog.edit": "Modifier",
        "admin.blog.publish": "Publier",
        "admin.blog.unpublish": "Dépublier",
        "admin.blog.confirm": "Confirmer ?",
        "admin.blog.yes": "Oui",
        "admin.blog.no": "Non",
        "admin.blog.updated": "Mis à jour",
        "admin.blog.status.published": "Publié",
        "admin.blog.status.draft": "Brouillon",
        "admin.blog.toast.publish": "Article publié.",
        "admin.blog.toast.unpublish": "Article repasse en brouillon.",
        "admin.blog.toast.status_error":
            "Impossible de mettre à jour le statut de l'article.",
        "admin.blog.toast.delete_success": "Article supprimé.",
        "admin.blog.toast.delete_error": "Impossible de supprimer l'article.",
        "admin.blog.delete_aria": "Supprimer",

        "admin.blog.editor.edit": "Modifier l'article",
        "admin.blog.editor.new": "Nouvel article",
        "admin.blog.editor.author": "Auteur connecté",
        "admin.blog.editor.title": "Titre",
        "admin.blog.editor.slug": "Slug URL",
        "admin.blog.editor.excerpt": "Extrait",
        "admin.blog.editor.content": "Contenu (HTML)",
        "admin.blog.editor.edit_tab": "Éditeur",
        "admin.blog.editor.preview_tab": "Aperçu",
        "admin.blog.editor.cover": "Image de couverture",
        "admin.blog.editor.tags": "Tags",
        "admin.blog.editor.status": "Statut",
        "admin.blog.editor.save": "Sauvegarder",
        "admin.blog.editor.placeholder.title": "Titre de l'article",
        "admin.blog.editor.placeholder.slug": "mon-article-de-blog",
        "admin.blog.editor.placeholder.excerpt":
            "Résumé court affiché dans les listes d'articles...",
        "admin.blog.editor.placeholder.content":
            "<h2>Introduction</h2><p>Votre contenu ici...</p>",
        "admin.blog.editor.placeholder.preview": "Aucun contenu à afficher.",
        "admin.blog.editor.placeholder.tags": "voyage, algarve, inspiration",
        "admin.blog.editor.cover_upload": "Téléverser une image",
        "admin.blog.editor.cover_success": "Image de couverture téléversée.",
        "admin.blog.editor.cover_error":
            "Le téléversement de la couverture a échoué.",
        "admin.blog.editor.cover_hint":
            "Téléversez une image de couverture pour l'article.",
        "admin.blog.editor.cover_uploading": "Téléversement en cours...",
        "admin.blog.editor.cover_preview": "Aperçu couverture",
        "admin.blog.editor.cover_remove": "Retirer la couverture",
        "admin.blog.editor.save_success_create": "Article créé avec succès.",
        "admin.blog.editor.save_success_update":
            "Article mis à jour avec succès.",
        "admin.blog.editor.save_error": "Impossible de sauvegarder l'article.",
        "admin.blog.editor.validate_error":
            "Veuillez corriger les erreurs avant de continuer.",
        "admin.blog.editor.error.title": "Le titre est obligatoire.",
        "admin.blog.editor.error.slug": "Le slug est obligatoire.",
        "admin.blog.editor.error.excerpt": "L'extrait est obligatoire.",
        "admin.blog.editor.error.content": "Le contenu est obligatoire.",
        "admin.blog.editor.tags_hint": "Séparez les tags par des virgules.",
        "admin.blog.editor.tags_aria": "Tags de l'article",
        "admin.blog.editor.actions.saving": "Enregistrement...",
        "admin.blog.editor.actions.uploading": "Téléversement...",
        "admin.blog.editor.actions.update": "Mettre à jour",
        "admin.blog.editor.actions.publish": "Publier",
        "admin.blog.editor.actions.save_draft": "Enregistrer le brouillon",
        "admin.blog.editor.actions.save": "Enregistrer",
        "admin.blog.editor.actions.back": "Retour à la liste",

        "guide.hero.eyebrow": "Guide Wandireo",
        "guide.hero.title":
            "Une page claire pour comprendre la plateforme sans chercher partout",
        "guide.hero.subtitle":
            "Ce guide résume les parcours principaux, les zones utiles et les bons points d'entrée pour les voyageurs, partenaires et administrateurs.",
        "guide.hero.cta_search": "Commencer par la recherche",
        "guide.hero.cta_blog": "Voir le blog",
        "guide.hero.card_label": "Ce que vous retrouvez ici",
        "guide.hero.card_item_1": "Parcours client, partenaire et admin",
        "guide.hero.card_item_2":
            "Fonctionnement de la recherche et de la réservation",
        "guide.hero.card_item_3": "Accès utiles selon votre rôle",
        "guide.hero.card_item_4":
            "Repère rapide pour les modules blog et support",
        "guide.main.kicker": "Parcours principal",
        "guide.main.title": "Comment utiliser Wandireo en 3 étapes",
        "guide.step.discover.title": "Recherchez par verticale",
        "guide.step.discover.text":
            "La page d'accueil et la recherche publique permettent de filtrer par destination, dates et type de service : activités, bateaux, voitures ou hébergements.",
        "guide.step.compare.title": "Comparez les fiches",
        "guide.step.compare.text":
            "Chaque service présente ses points forts, ses prix, ses extras, ses informations pratiques, ses disponibilités et ses avis afin de prendre une décision rapidement.",
        "guide.step.book.title": "Réservez sans friction",
        "guide.step.book.text":
            "Le panier, le paiement et la confirmation conservent les informations utiles. Selon le service, le règlement peut se faire en ligne, partiellement en ligne ou sur place.",
        "guide.profile.kicker": "Par profil",
        "guide.profile.title": "Les bons accès selon votre usage",
        "guide.panel.traveler.eyebrow": "Voyageur",
        "guide.panel.traveler.title": "Parcours client",
        "guide.panel.traveler.text":
            "Après inscription ou connexion, vous revenez sur la page d'accueil publique en étant connecté. Vous pouvez rechercher, ajouter des favoris, réserver puis suivre votre historique et votre profil.",
        "guide.panel.traveler.bullet_1":
            "Page d'accueil publique + recherche unifiée",
        "guide.panel.traveler.bullet_2": "Favoris et détail du service",
        "guide.panel.traveler.bullet_3": "Panier, paiement et confirmation",
        "guide.panel.traveler.bullet_4":
            "Dashboard client, profil et réservations",
        "guide.panel.traveler.cta": "Explorer la recherche",
        "guide.panel.partner.eyebrow": "Partenaire",
        "guide.panel.partner.title": "Parcours partenaire",
        "guide.panel.partner.text":
            "Les partenaires validés accèdent à leur dashboard, au catalogue, aux réservations et à leur profil. La création de service suit la structure d'administration et peut désormais être gérée proprement avec images et édition préremplie.",
        "guide.panel.partner.bullet_1": "Validation du compte et contrat",
        "guide.panel.partner.bullet_2": "Dashboard partenaire et réservations",
        "guide.panel.partner.bullet_3": "Catalogue et formulaire service",
        "guide.panel.partner.bullet_4": "Profil partenaire et suivi commercial",
        "guide.panel.partner.cta": "Devenir partenaire",
        "guide.panel.admin.eyebrow": "Administration",
        "guide.panel.admin.title": "Pilotage global",
        "guide.panel.admin.text":
            "L'administration centralise les utilisateurs, les services, la structure, les avis, les transactions, le blog et le support. Les surfaces critiques ont été reprises pour rester lisibles et cohérentes en mode clair comme en mode sombre.",
        "guide.panel.admin.bullet_1": "Utilisateurs et rôles",
        "guide.panel.admin.bullet_2": "Catalogue services et structure",
        "guide.panel.admin.bullet_3": "Avis, transactions et support",
        "guide.panel.admin.bullet_4": "Blog, publication et modération",
        "guide.panel.admin.cta": "Aller au dashboard admin",
        "guide.facts.kicker": "Repères utiles",
        "guide.facts.title": "Points importants à connaître",
        "guide.fact.search.title": "Recherche unique",
        "guide.fact.search.text":
            "Toutes les verticales passent par une même entrée `/recherche`, avec des filtres et des cartes adaptés au type de service.",
        "guide.fact.theme.title": "Thème public",
        "guide.fact.theme.text":
            "Le site public prend en charge `light`, `dark` et `system`, avec une palette alignée sur l'identité Wandireo.",
        "guide.fact.support.title": "Blog et support",
        "guide.fact.support.text":
            "Le blog est public avec édition admin. Le support V1 reste admin-only pour le suivi interne.",
        "guide.fact.services.title": "Services et images",
        "guide.fact.services.text":
            "Le flux d'upload local et l'édition du service ont été stabilisés afin d'afficher correctement les images côté public.",
        "guide.cta.kicker": "Besoin d'aller plus vite ?",
        "guide.cta.title": "Choisissez votre point d'entrée",
        "guide.cta.search": "Ouvrir la recherche",
        "guide.cta.partner": "Ouvrir l'espace partenaire",

        "forgot.title": "Mot de passe oublié",
        "forgot.subtitle":
            "Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.",
        "forgot.email_label": "Adresse e-mail",
        "forgot.email_placeholder": "vous@exemple.com",
        "forgot.submit": "Envoyer le lien",
        "forgot.success_title": "Email envoyé !",
        "forgot.success_text":
            "Si un compte est associé à {email}, vous recevrez un e-mail avec les instructions pour réinitialiser votre mot de passe.",
        "forgot.back_login": "← Retour à la connexion",
        "forgot.error.invalid_email":
            "Veuillez saisir une adresse e-mail valide.",

        "partner.bookings.back_dashboard": "Retour au tableau de bord",
        "partner.bookings.title": "Réservations",
        "partner.bookings.count_one": "réservation au total",
        "partner.bookings.count_other": "réservations au total",
        "partner.bookings.tabs_aria": "Filtrer par statut",
        "partner.bookings.tab.all": "Toutes",
        "partner.bookings.tab.pending": "En attente",
        "partner.bookings.tab.confirmed": "Confirmées",
        "partner.bookings.tab.cancelled": "Annulées",
        "partner.bookings.pending_badge": "{count} en attente",
        "partner.bookings.empty_prefix": "Aucune réservation",
        "partner.bookings.empty_suffix": "pour le moment.",
        "partner.bookings.empty_status": 'avec le statut "{status}"',
        "partner.bookings.booking_id": "Réservation n°{id}",
        "partner.bookings.status_aria": "Statut : {status}",
        "partner.bookings.received_on": "Reçue le {date}",
        "partner.bookings.participants_one": "participant",
        "partner.bookings.participants_other": "participants",
        "partner.bookings.extras": "Extras : {summary}",
        "partner.bookings.reason": "Motif : {reason}",
        "partner.bookings.accept": "Accepter",
        "partner.bookings.reject": "Refuser",
        "partner.bookings.toast.confirm_success": "Réservation confirmée.",
        "partner.bookings.toast.confirm_error":
            "Impossible de confirmer cette réservation.",
        "partner.bookings.toast.reject_success": "Réservation refusée.",
        "partner.bookings.toast.reject_error":
            "Impossible de refuser cette réservation.",
        "partner.bookings.status.confirmed": "Confirmée",
        "partner.bookings.status.pending": "En attente",
        "partner.bookings.status.cancelled": "Annulée",
        "partner.bookings.reject_modal.title": "Refuser la demande n°{id}",
        "partner.bookings.reject_modal.description":
            "Indiquez un motif de refus. Il sera transmis au voyageur.",
        "partner.bookings.reject_modal.placeholder":
            "Ex. : Complet pour cette date, indisponibilité exceptionnelle...",
        "partner.bookings.reject_modal.error":
            "Veuillez indiquer un motif de refus.",
        "partner.bookings.reject_modal.cancel": "Annuler",
        "partner.bookings.reject_modal.submit": "Confirmer le refus",
        "partner.bookings.reject_modal.submitting": "Envoi...",

        "admin.transactions.badge": "Administration",
        "admin.transactions.title": "Supervision des transactions",
        "admin.transactions.subtitle":
            "Vue financière issue de Laravel sur les réservations, commissions et statuts de paiement.",
        "admin.transactions.formula_label": "Modèle de commission Wandireo :",
        "admin.transactions.formula":
            "clientPrice = partnerPrice × (1 + rate) | commission = totalPrice × rate / (1 + rate) | net partenaire = totalPrice − commission",
        "admin.transactions.totals_aria": "Totaux filtres",
        "admin.transactions.total.volume": "Volume confirmé",
        "admin.transactions.total.commissions": "Commissions Wandireo",
        "admin.transactions.total.partner_net": "Net reversé aux partenaires",
        "admin.transactions.total.online_collected": "Collecte en ligne",
        "admin.transactions.partners.title": "Commissions par prestataire",
        "admin.transactions.partners.aria": "Commissions par prestataire",
        "admin.transactions.col.provider": "Prestataire",
        "admin.transactions.col.rate": "Taux",
        "admin.transactions.col.stripe_id": "Stripe Connect ID",
        "admin.transactions.col.volume": "Volume",
        "admin.transactions.col.commission": "Commission",
        "admin.transactions.col.partner_net": "Net partenaire",
        "admin.transactions.col.bookings": "Réservations",
        "admin.transactions.no_confirmed": "Aucune réservation confirmée.",
        "admin.transactions.filters_aria": "Filtres des transactions",
        "admin.transactions.filter.partner": "Filtrer par partenaire",
        "admin.transactions.filter.partner_all": "Tous les partenaires",
        "admin.transactions.filter.payment_status":
            "Filtrer par statut de paiement",
        "admin.transactions.filter.status_all": "Tous les statuts",
        "admin.transactions.count": "{count} transaction(s)",
        "admin.transactions.details.title": "Détail des transactions",
        "admin.transactions.details.aria": "Détail des transactions",
        "admin.transactions.col.id": "ID",
        "admin.transactions.col.date": "Date",
        "admin.transactions.col.client": "Client",
        "admin.transactions.col.service": "Service",
        "admin.transactions.col.partner": "Partenaire",
        "admin.transactions.col.payment_mode": "Mode paiement",
        "admin.transactions.col.client_total": "Total client",
        "admin.transactions.col.stripe_line": "Ligne Stripe",
        "admin.transactions.col.booking_status": "Statut resa.",
        "admin.transactions.col.payment_status": "Statut paiement",
        "admin.transactions.no_match":
            "Aucune transaction ne correspond aux filtres.",
        "admin.transactions.extras": "Extras : {summary}",
        "admin.transactions.payment.paid": "Payé",
        "admin.transactions.payment.refunded": "Remboursé",
        "admin.transactions.payment.pending": "En attente",
        "admin.transactions.booking.confirmed": "Confirmée",
        "admin.transactions.booking.pending": "En attente",
        "admin.transactions.booking.cancelled": "Annulée",

        "admin.users.badge": "Administration",
        "admin.users.title": "Gestion des utilisateurs",
        "admin.users.subtitle":
            "Validation partenaires, contrat de mandat et création de compte depuis l'admin.",
        "admin.users.error.commission_range":
            "Le taux de commission partenaire doit être compris entre 20 % et 30 %.",
        "admin.users.error.stripe_prefix":
            "L'identifiant Stripe Connect doit commencer par acct_.",
        "admin.users.toast.partner_updated": "Partenaire mis à jour.",
        "admin.users.toast.partner_update_error":
            "Impossible de sauvegarder les informations du partenaire.",
        "admin.users.error.general_required":
            "Le prénom, le nom et l'e-mail sont obligatoires.",
        "admin.users.toast.account_updated": "Compte mis à jour.",
        "admin.users.toast.account_update_error":
            "Impossible de mettre à jour ce compte.",
        "admin.users.error.pdf_required":
            "Sélectionnez un fichier PDF avant de lancer l'upload.",
        "admin.users.toast.contract_uploaded": "Contrat partenaire téléversé.",
        "admin.users.toast.contract_upload_error":
            "Impossible de téléverser le contrat partenaire.",
        "admin.users.error.create_required":
            "Complétez les champs obligatoires du compte.",
        "admin.users.error.company_required":
            "Le nom de société est obligatoire pour un partenaire.",
        "admin.users.toast.account_created": "Compte créé.",
        "admin.users.toast.account_create_error":
            "Impossible de créer ce compte.",
        "admin.users.toast.quick_action_error":
            "Impossible d'appliquer cette action rapide.",
        "admin.users.csv.company": "societe",
        "admin.users.csv.first_name": "prenom",
        "admin.users.hero.partners_count": "Comptes Partenaires ({count})",
        "admin.users.hero.clients_count": "Comptes Clients ({count})",
        "admin.users.hero.admins_count": "Comptes Admin ({count})",
        "admin.users.search_partner": "Rechercher un partenaire",
        "admin.users.filter.all_statuses": "Tous les statuts",
        "admin.users.filter.pending": "En attente",
        "admin.users.filter.approved": "Validés",
        "admin.users.filter.rejected": "Refusés",
        "admin.users.filter.suspended": "Suspendus",
        "admin.users.create_user": "Créer un utilisateur",
        "admin.users.export_csv": "Export CSV",
        "admin.users.metric.volume": "Volume confirmé",
        "admin.users.metric.commission": "Commission",
        "admin.users.metric.partner_net": "Net partenaire",
        "admin.users.metric.bookings": "Réservations",
        "admin.users.folder": "Dossier",
        "admin.users.contract_prefix": "/ contrat ",
        "admin.users.stripe_id": "Stripe Connect ID",
        "admin.users.stripe_missing": "— non configuré —",
        "admin.users.contract_file": "Contrat : {path}",
        "admin.users.admin_validation": "Validation admin : {date}",
        "admin.users.contract_signature": "Signature contrat : {date}",
        "admin.users.reason": "Motif : {reason}",
        "admin.users.quick.approve_success": "Partenaire validé.",
        "admin.users.quick.approve": "Valider",
        "admin.users.quick.contract_signed_success":
            "Contrat marqué comme signé.",
        "admin.users.quick.contract_signed": "Marquer comme signé",
        "admin.users.quick.suspend_success": "Partenaire suspendu.",
        "admin.users.quick.suspend": "Suspendre",
        "admin.users.edit": "Modifier",
        "admin.users.table.name": "Nom",
        "admin.users.table.email": "Email",
        "admin.users.table.language": "Langue",
        "admin.users.table.currency": "Devise",
        "admin.users.table.bookings": "Réservations",
        "admin.users.table.reviews": "Avis",
        "admin.users.table.permissions": "Permissions",
        "admin.users.table.action": "Action",
        "admin.users.modal.partner_title": "Modifier - {name}",
        "admin.users.field.commission": "Commission (%)",
        "admin.users.field.partner_status": "Statut partenaire",
        "admin.users.field.contract_status": "Statut contrat",
        "admin.users.field.stripe_account": "Stripe Connected Account ID",
        "admin.users.field.business_address": "Adresse professionnelle",
        "admin.users.field.contract": "Contrat",
        "admin.users.field.open_current_contract": "Ouvrir le contrat actuel",
        "admin.users.field.contract_hint":
            "Validation admin : {validated} | Signature : {signed}",
        "admin.users.field.upload_contract_pdf": "Téléverser un PDF de contrat",
        "admin.users.field.reset": "Réinitialiser",
        "admin.users.field.uploading": "Upload...",
        "admin.users.field.upload_pdf": "Téléverser le PDF",
        "admin.users.field.reason": "Motif",
        "admin.users.cancel": "Annuler",
        "admin.users.saving": "Enregistrement...",
        "admin.users.save": "Enregistrer",
        "admin.users.modal.user_title": "Modifier - {name}",
        "admin.users.placeholder.first_name": "Prénom",
        "admin.users.placeholder.last_name": "Nom",
        "admin.users.placeholder.email": "Email",
        "admin.users.placeholder.phone": "Téléphone",
        "admin.users.placeholder.preferred_currency": "Devise préférée",
        "admin.users.placeholder.language": "Langue",
        "admin.users.modal.create_title": "Créer un compte utilisateur",
        "admin.users.create_intro":
            "Choisissez le type de compte puis complétez les informations utiles. Les champs partenaires n'apparaissent que si le compte créé est un partenaire.",
        "admin.users.section.account_type": "Type de compte",
        "admin.users.section.identity": "Identité",
        "admin.users.section.account": "Compte",
        "admin.users.section.profile": "Profil",
        "admin.users.section.partner_settings": "Paramètres partenaire",
        "admin.users.section.partner_copy":
            "Structure commerciale, commission et statut initial du partenaire.",
        "admin.users.role.partner": "Partenaire",
        "admin.users.role.client": "Client",
        "admin.users.role.admin": "Admin",
        "admin.users.placeholder.initial_password": "Mot de passe initial",
        "admin.users.placeholder.company": "Société",
        "admin.users.placeholder.commission": "Commission (%)",
        "admin.users.contract.not_sent": "Contrat non envoyé",
        "admin.users.contract.pending_signature":
            "Contrat en attente de signature",
        "admin.users.contract.signed": "Contrat signé",
        "admin.users.contract.rejected": "Contrat refusé",
        "admin.users.creating": "Création...",
        "admin.users.create_account": "Créer le compte",
        "admin.users.partner_status.approved": "Validé",
        "admin.users.partner_status.rejected": "Refusé",
        "admin.users.partner_status.suspended": "Suspendu",
        "admin.users.partner_status.pending": "En attente",
        "admin.users.contract_status.not_sent": "Non envoyé",
        "admin.users.contract_status.pending_signature":
            "En attente de signature",
        "admin.users.contract_status.signed": "Signé",
        "admin.users.contract_status.rejected": "Refusé",
        "admin.users.not_provided": "Non renseignée",

        "admin.services.badge": "Administration",
        "admin.services.title": "Modération du catalogue",
        "admin.services.subtitle":
            "{active} service(s) actif(s) sur {total} au total.",
        "admin.services.toast.activated": "Service activé.",
        "admin.services.toast.deactivated": "Service désactivé.",
        "admin.services.toast.error":
            "Impossible de changer la disponibilité du service.",
        "admin.services.csv.category": "catégorie",
        "admin.services.filters_aria": "Filtres du catalogue",
        "admin.services.configure_structure": "Configurer la structure",
        "admin.services.create": "Créer un service",
        "admin.services.search_placeholder": "Rechercher un service",
        "admin.services.search_aria": "Rechercher un service",
        "admin.services.filter.category": "Filtrer par catégorie",
        "admin.services.filter.all_categories": "Toutes les catégories",
        "admin.services.filter.partner": "Filtrer par partenaire",
        "admin.services.filter.all_partners": "Tous les partenaires",
        "admin.services.filter.source": "Filtrer par source",
        "admin.services.filter.all_sources": "Toutes les sources",
        "admin.services.filter.local": "Locales",
        "admin.services.filter.external": "Externes",
        "admin.services.filter.availability": "Disponibilité",
        "admin.services.filter.all": "Tous",
        "admin.services.filter.active": "Actifs",
        "admin.services.filter.inactive": "Inactifs",
        "admin.services.results": "{count} résultat(s)",
        "admin.services.export_csv": "Export CSV",
        "admin.services.table_aria": "Catalogue de services",
        "admin.services.col.service": "Service",
        "admin.services.col.category": "Catégorie",
        "admin.services.col.partner": "Partenaire",
        "admin.services.col.source": "Source",
        "admin.services.col.client_price": "Prix client",
        "admin.services.col.commission": "Commission",
        "admin.services.col.partner_net": "Net partenaire",
        "admin.services.col.rating": "Note",
        "admin.services.col.availability": "Disponibilité",
        "admin.services.col.action": "Action",
        "admin.services.empty":
            "Aucun service ne correspond aux filtres sélectionnés.",
        "admin.services.unassigned": "Non assigné",
        "admin.services.status.active": "Actif",
        "admin.services.status.inactive": "Inactif",
        "admin.services.edit": "Modifier",
        "admin.services.read_only": "Lecture seule",
        "admin.services.deactivate": "Désactiver",
        "admin.services.activate": "Activer",
        "admin.services.read_only_aria":
            "Service externe {title} en lecture seule",
        "admin.services.deactivate_aria": "Désactiver le service {title}",
        "admin.services.activate_aria": "Activer le service {title}",
        "admin.services.category.activity": "Activité",
        "admin.services.category.boat": "Bateau",
        "admin.services.category.stay": "Hébergement",
        "admin.services.category.car": "Voiture",
        "admin.services.fareharbor.eyebrow": "Intégration externe",
        "admin.services.fareharbor.subtitle":
            "{companies} société(s) suivie(s), {services} service(s) importé(s).",
        "admin.services.fareharbor.sync_all": "Tout synchroniser",
        "admin.services.fareharbor.display_name_placeholder": "Nom affiché",
        "admin.services.fareharbor.slug_placeholder": "company-slug",
        "admin.services.fareharbor.items": "Items",
        "admin.services.fareharbor.details": "Détails",
        "admin.services.fareharbor.add": "Ajouter",
        "admin.services.fareharbor.loading":
            "Chargement de la configuration FareHarbor...",
        "admin.services.fareharbor.empty":
            "Aucune société FareHarbor configurée.",
        "admin.services.fareharbor.items_count": "{count} item(s)",
        "admin.services.fareharbor.last_sync": "Dernière sync :",
        "admin.services.fareharbor.never_synced": "Jamais synchronisé",
        "admin.services.fareharbor.enabled": "Actif",
        "admin.services.fareharbor.sync_items": "Sync items",
        "admin.services.fareharbor.sync_details": "Sync détails",
        "admin.services.fareharbor.sync": "Synchroniser",
        "admin.services.fareharbor.toast.required":
            "Le nom et le slug FareHarbor sont obligatoires.",
        "admin.services.fareharbor.toast.created":
            "Société FareHarbor ajoutée.",
        "admin.services.fareharbor.toast.create_error":
            "Impossible d'ajouter la société FareHarbor.",
        "admin.services.fareharbor.toast.updated":
            "Configuration FareHarbor mise à jour.",
        "admin.services.fareharbor.toast.update_error":
            "La mise à jour FareHarbor a échoué.",
        "admin.services.fareharbor.toast.sync_success":
            "Synchronisation lancée pour {name}.",
        "admin.services.fareharbor.toast.sync_error":
            "La synchronisation de {name} a échoué.",
        "admin.services.fareharbor.toast.sync_all_success":
            "Synchronisation FareHarbor globale terminée.",
        "admin.services.fareharbor.toast.sync_all_error":
            "La synchronisation globale FareHarbor a échoué.",
        "admin.services.fareharbor.status.idle": "En attente",
        "admin.services.fareharbor.status.syncing": "Synchronisation en cours",
        "admin.services.fareharbor.status.success": "Succès",
        "admin.services.fareharbor.status.failed": "Échec",

        "admin.structure.toast.category_updated": "Catégorie mise à jour.",
        "admin.structure.toast.category_created": "Catégorie créée.",
        "admin.structure.toast.category_save_error":
            "Impossible d'enregistrer la catégorie.",
        "admin.structure.error.select_category":
            "Sélectionnez d'abord une catégorie.",
        "admin.structure.toast.subcategory_updated":
            "Sous-catégorie mise à jour.",
        "admin.structure.toast.subcategory_created": "Sous-catégorie créée.",
        "admin.structure.toast.subcategory_save_error":
            "Impossible d'enregistrer la sous-catégorie.",
        "admin.structure.toast.attribute_updated": "Attribut mis à jour.",
        "admin.structure.toast.attribute_created": "Attribut créé.",
        "admin.structure.toast.attribute_save_error":
            "Impossible d'enregistrer l'attribut.",
        "admin.structure.toast.extra_updated": "Extra mis à jour.",
        "admin.structure.toast.extra_created": "Extra créé.",
        "admin.structure.toast.extra_save_error":
            "Impossible d'enregistrer l'extra.",
        "admin.structure.confirm.delete_category":
            "Supprimer cette catégorie et toute sa structure ?",
        "admin.structure.toast.category_deleted": "Catégorie supprimée.",
        "admin.structure.confirm.delete_subcategory":
            "Supprimer cette sous-catégorie ?",
        "admin.structure.toast.subcategory_deleted":
            "Sous-catégorie supprimée.",
        "admin.structure.confirm.delete_attribute": "Supprimer cet attribut ?",
        "admin.structure.toast.attribute_deleted": "Attribut supprimé.",
        "admin.structure.confirm.delete_extra": "Supprimer cet extra ?",
        "admin.structure.toast.extra_deleted": "Extra supprimé.",
        "admin.structure.toast.delete_error": "Suppression impossible.",
        "admin.structure.error.preset_exists":
            "Cette structure par défaut existe déjà.",
        "admin.structure.error.preset_apply":
            "Impossible d'appliquer cette structure par défaut.",
        "admin.structure.error.no_attribute_preset":
            "Aucun preset d'attributs n'est défini pour ce type.",
        "admin.structure.error.attributes_exist":
            "Les attributs par défaut existent déjà pour cette catégorie.",
        "admin.structure.toast.attributes_added":
            "Attributs par défaut ajoutés.",
        "admin.structure.error.attributes_add":
            "Impossible d'ajouter les attributs par défaut.",
        "admin.structure.error.no_extra_preset":
            "Aucun preset d'extras n'est défini pour ce type.",
        "admin.structure.error.extras_exist":
            "Les extras par défaut existent déjà pour cette catégorie.",
        "admin.structure.toast.extras_added": "Extras par défaut ajoutés.",
        "admin.structure.error.extras_add":
            "Impossible d'ajouter les extras par défaut.",
        "admin.structure.eyebrow": "Catalogue admin-driven",
        "admin.structure.title": "Structure des services",
        "admin.structure.subtitle":
            "Gère les catégories, sous-catégories, attributs et extras utilisés ensuite dans les formulaires de service.",
        "admin.structure.preset.boats_created":
            "Catégorie bateaux par défaut créée.",
        "admin.structure.preset.cars_created":
            "Catégorie voitures par défaut créée.",
        "admin.structure.preset.stays_created":
            "Catégorie hébergements par défaut créée.",
        "admin.structure.preset.boats": "Préréglage bateaux",
        "admin.structure.preset.cars": "Préréglage voitures",
        "admin.structure.preset.stays": "Préréglage hébergements",
        "admin.structure.preset.boat_category.name": "Location de bateaux",
        "admin.structure.preset.boat_category.description":
            "Structure par défaut pour les offres nautiques et la location de bateaux.",
        "admin.structure.preset.boat_subcategory.jet_ski": "Jet ski",
        "admin.structure.preset.boat_subcategory.rental_with_or_without_license":
            "Location bateau (avec / sans permis)",
        "admin.structure.preset.boat_subcategory.yacht": "Yacht",
        "admin.structure.preset.boat_subcategory.catamaran": "Catamaran",
        "admin.structure.preset.car_category.name": "Location de voitures",
        "admin.structure.preset.car_category.description":
            "Structure par défaut pour la location de voitures et véhicules.",
        "admin.structure.preset.car_subcategory.luxury": "Luxe",
        "admin.structure.preset.car_subcategory.electric": "Électrique",
        "admin.structure.preset.car_subcategory.city_car": "Citadine",
        "admin.structure.preset.stay_category.name":
            "Locations et hébergements",
        "admin.structure.preset.stay_category.description":
            "Structure par défaut pour les villas, appartements et hôtels.",
        "admin.structure.preset.stay_subcategory.villa": "Villa",
        "admin.structure.preset.stay_subcategory.apartment": "Appartement",
        "admin.structure.preset.stay_subcategory.hotel": "Hôtel",
        "admin.structure.preset.stay_subcategory.house": "Maison",
        "admin.structure.preset.attribute.boat.length": "Longueur (m)",
        "admin.structure.preset.attribute.boat.cabins": "Cabines",
        "admin.structure.preset.attribute.boat.speed": "Vitesse",
        "admin.structure.preset.attribute.shared.fuel": "Carburant",
        "admin.structure.preset.attribute.car.transmission": "Transmission",
        "admin.structure.preset.attribute.car.doors": "Nombre de portes",
        "admin.structure.preset.attribute.car.air_conditioning":
            "Climatisation",
        "admin.structure.preset.attribute.stay.bedrooms": "Chambres",
        "admin.structure.preset.attribute.stay.bathrooms": "Salles de bain",
        "admin.structure.preset.attribute.stay.wifi": "Wi-Fi",
        "admin.structure.preset.attribute.stay.pool": "Piscine",
        "admin.structure.preset.fuel_option.gasoline": "Essence",
        "admin.structure.preset.fuel_option.diesel": "Diesel",
        "admin.structure.preset.fuel_option.electric": "Électrique",
        "admin.structure.preset.fuel_option.hybrid": "Hybride",
        "admin.structure.preset.transmission_option.automatic": "Automatique",
        "admin.structure.preset.transmission_option.manual": "Manuelle",
        "admin.structure.preset.extra.boat.skipper.name": "Skipper",
        "admin.structure.preset.extra.boat.skipper.description":
            "Skipper professionnel pour accompagner la sortie.",
        "admin.structure.preset.extra.boat.fuel.name": "Carburant",
        "admin.structure.preset.extra.boat.fuel.description":
            "Forfait carburant pour la sortie.",
        "admin.structure.preset.extra.boat.towels.name": "Serviettes",
        "admin.structure.preset.extra.boat.towels.description":
            "Pack serviettes et accueil à bord.",
        "admin.structure.preset.extra.car.driver.name": "Chauffeur",
        "admin.structure.preset.extra.car.driver.description":
            "Option chauffeur privé.",
        "admin.structure.preset.extra.car.delivery.name": "Livraison",
        "admin.structure.preset.extra.car.delivery.description":
            "Livraison du véhicule sur place.",
        "admin.structure.preset.extra.car.child_seat.name": "Siège enfant",
        "admin.structure.preset.extra.car.child_seat.description":
            "Siège enfant ou rehausseur.",
        "admin.structure.preset.extra.stay.final_cleaning.name": "Ménage final",
        "admin.structure.preset.extra.stay.final_cleaning.description":
            "Forfait ménage de fin de séjour.",
        "admin.structure.preset.extra.stay.breakfast.name": "Petit-déjeuner",
        "admin.structure.preset.extra.stay.breakfast.description":
            "Petit-déjeuner pour le séjour.",
        "admin.structure.preset.extra.stay.late_checkout.name":
            "Late check-out",
        "admin.structure.preset.extra.stay.late_checkout.description":
            "Départ tardif selon disponibilité.",
        "admin.structure.back_catalog": "Retour au catalogue",
        "admin.structure.create_service": "Créer un service",
        "admin.structure.categories": "Catégories",
        "admin.structure.new": "Nouvelle",
        "admin.structure.subcategories_count":
            "{count} sous-catégories · {attributes} attributs",
        "admin.structure.empty_categories": "Aucune catégorie configurée.",
        "admin.structure.edit_category": "Modifier la catégorie",
        "admin.structure.new_category": "Nouvelle catégorie",
        "admin.structure.cancel": "Annuler",
        "admin.structure.label.service_type": "Type de service",
        "admin.structure.label.name": "Nom",
        "admin.structure.label.slug": "Slug",
        "admin.structure.label.description": "Description",
        "admin.structure.label.order": "Ordre",
        "admin.structure.category_active": "Catégorie active",
        "admin.structure.delete": "Supprimer",
        "admin.structure.update": "Mettre à jour",
        "admin.structure.create": "Créer",
        "admin.structure.select_category_manage":
            "Sélectionnez une catégorie pour administrer sa structure.",
        "admin.structure.edit_category_short": "Modifier la catégorie",
        "admin.structure.preset_attributes": "Préréglage attributs",
        "admin.structure.preset_extras": "Préréglage extras",
        "admin.structure.edit_subcategory": "Modifier une sous-catégorie",
        "admin.structure.subcategories": "Sous-catégories",
        "admin.structure.edit": "Modifier",
        "admin.structure.subcategory_active": "Sous-catégorie active",
        "admin.structure.add": "Ajouter",
        "admin.structure.edit_attribute": "Modifier un attribut",
        "admin.structure.attributes": "Attributs dynamiques",
        "admin.structure.label.label": "Libellé",
        "admin.structure.label.technical_key": "Clé technique",
        "admin.structure.label.type": "Type",
        "admin.structure.type.text": "Texte",
        "admin.structure.type.number": "Nombre",
        "admin.structure.type.boolean": "Booléen",
        "admin.structure.type.select": "Liste",
        "admin.structure.label.options": "Options",
        "admin.structure.placeholder.options":
            "Yacht: yacht\nCatamaran: catamaran",
        "admin.structure.required_field": "Champ obligatoire",
        "admin.structure.public_filter": "Utilisable comme filtre public",
        "admin.structure.edit_extra": "Modifier un extra",
        "admin.structure.extras": "Extras",
        "admin.structure.label.default_price": "Prix par défaut",
        "admin.structure.extra_type.optional": "Optionnel",
        "admin.structure.extra_type.required": "Obligatoire",
        "admin.structure.extra_required": "Extra obligatoire",
        "admin.structure.extra_active": "Extra actif",

        "admin.dashboard.status.confirmed": "Confirmée",
        "admin.dashboard.status.pending": "En attente",
        "admin.dashboard.status.cancelled": "Annulée",
        "admin.dashboard.badge": "Espace Administration",
        "admin.dashboard.title": "Tableau de bord",
        "admin.dashboard.subtitle": "Vue globale de la plateforme -",
        "admin.dashboard.avatar_label": "Initiales de l'administrateur",
        "admin.dashboard.logout": "Déconnexion",
        "admin.dashboard.metrics_aria": "Métriques globales",
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
        "admin.dashboard.funnel.title": "Funnel produit",
        "admin.dashboard.funnel.searches": "Recherches",
        "admin.dashboard.funnel.last_30_days": "30 derniers jours",
        "admin.dashboard.funnel.views": "Vues fiche",
        "admin.dashboard.funnel.views_sub": "{rate}% depuis la recherche",
        "admin.dashboard.funnel.starts": "Débuts de réservation",
        "admin.dashboard.funnel.starts_sub": "{rate}% depuis la fiche",
        "admin.dashboard.funnel.confirmed": "Réservations confirmées",
        "admin.dashboard.funnel.confirmed_sub": "{rate}% depuis le checkout",
        "admin.dashboard.shortcuts.title": "Accès rapides",
        "admin.dashboard.shortcuts.partners": "Gérer les partenaires",
        "admin.dashboard.shortcuts.partners_sub":
            "Validation · Suspension · Stripe Connect",
        "admin.dashboard.shortcuts.catalog": "Modérer le catalogue",
        "admin.dashboard.shortcuts.catalog_sub":
            "Activer · Désactiver · Filtrer par catégorie",
        "admin.dashboard.shortcuts.transactions": "Superviser les transactions",
        "admin.dashboard.shortcuts.transactions_sub":
            "Commissions · Flux financiers · Stripe",
        "admin.dashboard.shortcuts.reviews": "Modérer les avis",
        "admin.dashboard.shortcuts.reviews_sub": "{count} avis en attente",
        "admin.dashboard.recent.title": "Réservations récentes",
        "admin.dashboard.recent.view_all": "Voir tout",
        "admin.dashboard.recent.aria": "Réservations récentes",
        "admin.dashboard.table.client": "Client",
        "admin.dashboard.table.partner": "Partenaire",
        "admin.dashboard.table.amount": "Montant",
        "admin.dashboard.table.commission": "Commission",
        "admin.dashboard.table.status": "Statut",

        "partner.catalog.error.title_required": "Le titre est obligatoire.",
        "partner.catalog.error.description_required":
            "La description est obligatoire.",
        "partner.catalog.error.city_required": "La ville est obligatoire.",
        "partner.catalog.error.country_required": "Le pays est obligatoire.",
        "partner.catalog.error.price_positive":
            "Le prix doit être un nombre positif.",
        "partner.catalog.error.meeting_point_required":
            "Le point de rendez-vous est obligatoire.",
        "partner.catalog.error.boat_name_required":
            "Le nom du bateau est obligatoire.",
        "partner.catalog.error.brand_required": "La marque est obligatoire.",
        "partner.catalog.error.model_required": "Le modèle est obligatoire.",
        "partner.catalog.modal.edit_title": "Modifier le service",
        "partner.catalog.modal.create_title": "Ajouter un service",
        "partner.catalog.modal.close": "Fermer",
        "partner.catalog.section.general": "Informations générales",
        "partner.catalog.section.pricing": "Tarification",
        "partner.catalog.section.location": "Localisation",
        "partner.catalog.section.availability": "Disponibilité",
        "partner.catalog.field.title": "Titre du service",
        "partner.catalog.field.description": "Description",
        "partner.catalog.field.category": "Catégorie",
        "partner.catalog.field.pricing_unit": "Unité de facturation",
        "partner.catalog.field.partner_price":
            "Prix partenaire (HT commission)",
        "partner.catalog.field.currency": "Devise",
        "partner.catalog.field.payment_mode": "Mode de paiement",
        "partner.catalog.field.city": "Ville",
        "partner.catalog.field.country": "Pays",
        "partner.catalog.field.region": "Région (optionnel)",
        "partner.catalog.field.tags": "Tags (séparés par des virgules)",
        "partner.catalog.field.available":
            "Service disponible à la réservation",
        "partner.catalog.placeholder.title":
            "Ex. : Croisière privée au coucher du soleil",
        "partner.catalog.placeholder.description":
            "Décrivez votre service en détail...",
        "partner.catalog.placeholder.city": "Paris",
        "partner.catalog.placeholder.country": "France",
        "partner.catalog.placeholder.region": "Île-de-France",
        "partner.catalog.placeholder.tags": "paris, nature, aventure",
        "partner.catalog.preview.commission": "Commission Wandireo ({rate}%) :",
        "partner.catalog.preview.client_price": "Prix affiché client :",
        "partner.catalog.action.cancel": "Annuler",
        "partner.catalog.action.confirm_delete": "Oui, supprimer",
        "partner.catalog.action.save": "Enregistrer les modifications",
        "partner.catalog.action.create": "Créer le service",
        "partner.catalog.action.add_service": "Ajouter un service",
        "partner.catalog.toast.service_disabled": "Service désactivé.",
        "partner.catalog.toast.service_enabled": "Service activé.",
        "partner.catalog.toast.toggle_error":
            "Impossible de mettre à jour la disponibilité du service.",
        "partner.catalog.toast.service_deleted": "Service supprimé.",
        "partner.catalog.toast.delete_error":
            "Impossible de supprimer le service.",
        "partner.catalog.toast.service_created": "Service créé.",
        "partner.catalog.toast.service_updated": "Service mis à jour.",
        "partner.catalog.toast.save_error":
            "Impossible de sauvegarder ce service.",
        "partner.catalog.back_dashboard": "Retour au tableau de bord",
        "partner.catalog.page_title": "Mon catalogue",
        "partner.catalog.page_subtitle":
            "{services} service{services_suffix} - {active} actif{active_suffix}",
        "partner.catalog.empty.title": "Votre catalogue est vide.",
        "partner.catalog.empty.subtitle":
            "Ajoutez votre premier service pour le rendre visible sur Wandireo.",
        "partner.catalog.category.activity": "Activité",
        "partner.catalog.category.boat": "Bateau",
        "partner.catalog.category.stay": "Hébergement",
        "partner.catalog.category.car": "Voiture",
        "partner.catalog.pricing_unit.person": "Par personne",
        "partner.catalog.pricing_unit.group": "Par groupe",
        "partner.catalog.pricing_unit.day": "Par jour",
        "partner.catalog.pricing_unit.half_day": "Par demi-journée",
        "partner.catalog.pricing_unit.week": "Par semaine",
        "partner.catalog.pricing_unit.night": "Par nuit",
        "partner.catalog.payment_mode.on_site": "Paiement sur place",
        "partner.catalog.payment_mode.commission_online":
            "Commission en ligne + reste sur place",
        "partner.catalog.payment_mode.full_online": "Paiement en ligne",
        "partner.catalog.payment_mode.connected_account":
            "Compte connecté Stripe",
        "partner.catalog.section.activity": "Détails de l'activité",
        "partner.catalog.section.boat": "Détails du bateau",
        "partner.catalog.section.stay": "Détails de l'hébergement",
        "partner.catalog.section.car": "Détails du véhicule",
        "partner.catalog.field.activity_type": "Type d'activité",
        "partner.catalog.field.group_type": "Type de groupe",
        "partner.catalog.field.duration": "Durée",
        "partner.catalog.field.duration_unit": "Unité de durée",
        "partner.catalog.field.difficulty": "Difficulté",
        "partner.catalog.field.intensity": "Intensité physique",
        "partner.catalog.field.min_participants": "Participants min.",
        "partner.catalog.field.max_participants": "Participants max.",
        "partner.catalog.field.min_age": "Âge minimum (ans)",
        "partner.catalog.field.meeting_point": "Point de rendez-vous",
        "partner.catalog.field.schedule_start_times":
            "Horaires de départ (séparés par des virgules)",
        "partner.catalog.field.languages":
            "Langues disponibles (codes ISO, virgules)",
        "partner.catalog.field.medical_clearance":
            "Certificat médical d'aptitude requis",
        "partner.catalog.field.equipment_provided":
            "Équipement fourni par le prestataire",
        "partner.catalog.field.days_available": "Jours disponibles (virgules)",
        "partner.catalog.field.certification_required":
            "Certification requise (optionnel)",
        "partner.catalog.field.included":
            "Inclus dans le prix (un élément par ligne)",
        "partner.catalog.field.not_included":
            "Non inclus (un élément par ligne)",
        "partner.catalog.field.boat_type": "Type de bateau",
        "partner.catalog.field.boat_name": "Nom du bateau",
        "partner.catalog.field.passenger_capacity": "Capacité passagers",
        "partner.catalog.field.sleeping_berths": "Couchages",
        "partner.catalog.field.length_meters": "Longueur (m)",
        "partner.catalog.field.manufacture_year": "Année de construction",
        "partner.catalog.field.engine_type": "Type de propulsion",
        "partner.catalog.field.rental_mode": "Mode de location",
        "partner.catalog.field.boat_cabins": "Cabines",
        "partner.catalog.field.boat_bathrooms": "Salles de bain",
        "partner.catalog.field.deposit_eur": "Caution (EUR)",
        "partner.catalog.field.departure_ports": "Ports de départ (virgules)",
        "partner.catalog.field.navigation_area":
            "Zones de navigation (virgules)",
        "partner.catalog.field.boat_amenities": "Équipements à bord (virgules)",
        "partner.catalog.field.license_required": "Permis de navigation requis",
        "partner.catalog.field.license_type": "Type de permis requis",
        "partner.catalog.field.fuel_included": "Carburant inclus",
        "partner.catalog.field.insurance_included": "Assurance incluse",
        "partner.catalog.field.engine_power_kw":
            "Puissance moteur (kW, optionnel)",
        "partner.catalog.field.day_charter":
            "Disponible à la journée (day charter)",
        "partner.catalog.field.week_charter":
            "Disponible à la semaine (week charter)",
        "partner.catalog.field.accommodation_type": "Type d'hébergement",
        "partner.catalog.field.cancellation_policy": "Politique d'annulation",
        "partner.catalog.field.max_guests": "Voyageurs max.",
        "partner.catalog.field.bedrooms": "Chambres",
        "partner.catalog.field.stay_bathrooms": "Salles de bain",
        "partner.catalog.field.minimum_stay_nights": "Nuits minimum",
        "partner.catalog.field.check_in_time": "Heure d'arrivée",
        "partner.catalog.field.check_out_time": "Heure de départ",
        "partner.catalog.field.stay_amenities": "Équipements (virgules)",
        "partner.catalog.field.breakfast_included": "Petit-déjeuner inclus",
        "partner.catalog.field.pets_allowed": "Animaux de compagnie acceptés",
        "partner.catalog.field.smoking_allowed": "Fumeurs autorisés",
        "partner.catalog.field.star_rating": "Classement étoiles (hôtels)",
        "partner.catalog.field.total_surface": "Surface totale (m², optionnel)",
        "partner.catalog.field.distance_to_beach": "Distance à la plage (m)",
        "partner.catalog.field.distance_to_city": "Distance centre-ville (km)",
        "partner.catalog.field.house_rules":
            "Règles de la maison (une par ligne)",
        "partner.catalog.field.nearby_attractions":
            "Attractions à proximité (virgules)",
        "partner.catalog.field.accessibility_features":
            "Accessibilité (virgules, optionnel)",
        "partner.catalog.field.vehicle_type": "Type de véhicule",
        "partner.catalog.field.year": "Année",
        "partner.catalog.field.brand": "Marque",
        "partner.catalog.field.model": "Modèle",
        "partner.catalog.field.transmission": "Boîte de vitesses",
        "partner.catalog.field.fuel_type": "Carburant",
        "partner.catalog.field.seats": "Places",
        "partner.catalog.field.doors": "Portes",
        "partner.catalog.field.driver_min_age": "Âge min. conducteur",
        "partner.catalog.field.license_years_required": "Permis depuis (ans)",
        "partner.catalog.field.mileage_limit":
            "Kilométrage (nombre ou ILLIMITE)",
        "partner.catalog.field.additional_driver_fee":
            "Conducteur supp. (EUR/jour)",
        "partner.catalog.field.pickup_locations":
            "Lieux de prise en charge (virgules)",
        "partner.catalog.field.extra_mileage_fee":
            "Tarif km supplémentaire (EUR/km)",
        "partner.catalog.field.small_bags": "Petits bagages (cabine)",
        "partner.catalog.field.large_suitcases": "Grandes valises",
        "partner.catalog.field.air_conditioning": "Climatisation",
        "partner.catalog.field.full_insurance":
            "Assurance tous risques incluse",
        "partner.catalog.field.delivery_available": "Livraison possible",
        "partner.catalog.field.delivery_locations":
            "Lieux de livraison (virgules)",
        "partner.catalog.field.additional_driver_allowed":
            "Conducteur supplémentaire autorisé",
        "partner.catalog.placeholder.meeting_point":
            "Ex. : Port de la Bourdonnais, 75007 Paris",
        "partner.catalog.placeholder.days_available":
            "LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE",
        "partner.catalog.placeholder.certification_required":
            "Ex. : PADI Open Water, Permis de chasse sous-marine",
        "partner.catalog.placeholder.included":
            "Accueil avec boisson\nGuide certifié bilingue\nÉquipement complet",
        "partner.catalog.placeholder.not_included":
            "Transport\nAssurance\nRepas",
        "partner.catalog.placeholder.boat_name": "Cap Soleil",
        "partner.catalog.placeholder.departure_ports":
            "Port de Cannes, Port d'Antibes",
        "partner.catalog.placeholder.navigation_area":
            "Côte d'Azur, Îles de Lérins",
        "partner.catalog.placeholder.boat_amenities":
            "GPS, VHF, Paddles, Snorkeling",
        "partner.catalog.placeholder.license_type":
            "Ex. : Permis côtier, Permis hauturier",
        "partner.catalog.placeholder.stay_amenities":
            "Piscine, WiFi, Climatisation, Parking",
        "partner.catalog.placeholder.house_rules":
            "Arrivée entre 14h et 20h\nPas de fête\nAnimaux interdits dans les chambres",
        "partner.catalog.placeholder.nearby_attractions":
            "Plage, Restaurants, Marché local",
        "partner.catalog.placeholder.accessibility_features":
            "Accès PMR, Ascenseur, Sans escaliers",
        "partner.catalog.placeholder.brand": "Renault",
        "partner.catalog.placeholder.model": "Clio",
        "partner.catalog.placeholder.mileage_limit": "ILLIMITE",
        "partner.catalog.placeholder.pickup_locations":
            "Aéroport, Centre-ville",
        "partner.catalog.placeholder.delivery_locations":
            "Aéroport CDG, Hôtel, Centre-ville",
        "partner.catalog.activity_type.hiking": "Randonnée",
        "partner.catalog.activity_type.diving": "Plongée",
        "partner.catalog.activity_type.kayak": "Kayak",
        "partner.catalog.activity_type.surf": "Surf",
        "partner.catalog.activity_type.snorkeling": "Snorkeling",
        "partner.catalog.activity_type.skydiving": "Parachutisme",
        "partner.catalog.activity_type.climbing": "Escalade",
        "partner.catalog.activity_type.cultural_cruise": "Croisière culturelle",
        "partner.catalog.activity_type.cycling": "Vélo",
        "partner.catalog.activity_type.beach_yoga": "Yoga plage",
        "partner.catalog.activity_type.quad_buggy": "Quad / Buggy",
        "partner.catalog.activity_type.whale_watching": "Observation cétacés",
        "partner.catalog.group_type.shared": "Groupe partagé",
        "partner.catalog.group_type.private": "Groupe privé",
        "partner.catalog.group_type.choice": "Au choix",
        "partner.catalog.duration_unit.minutes": "Minutes",
        "partner.catalog.duration_unit.hours": "Heures",
        "partner.catalog.duration_unit.days": "Jours",
        "partner.catalog.duration_unit.minutes_short": "min",
        "partner.catalog.duration_unit.hours_short": "h",
        "partner.catalog.duration_unit.days_short": "j",
        "partner.catalog.difficulty.all_levels": "Tous niveaux",
        "partner.catalog.difficulty.beginner": "Débutant",
        "partner.catalog.difficulty.intermediate": "Intermédiaire",
        "partner.catalog.difficulty.advanced": "Avancé",
        "partner.catalog.difficulty.expert": "Expert",
        "partner.catalog.intensity.low": "Faible",
        "partner.catalog.intensity.moderate": "Modérée",
        "partner.catalog.intensity.high": "Élevée",
        "partner.catalog.boat_type.sailboat": "Voilier",
        "partner.catalog.boat_type.catamaran": "Catamaran",
        "partner.catalog.boat_type.motor_yacht": "Yacht à moteur",
        "partner.catalog.boat_type.rib": "Semi-rigide",
        "partner.catalog.boat_type.schooner": "Goélette",
        "partner.catalog.boat_type.barge": "Péniche",
        "partner.catalog.engine_type.sail_only": "Voile uniquement",
        "partner.catalog.engine_type.motor_only": "Moteur uniquement",
        "partner.catalog.engine_type.sail_and_motor": "Voile et moteur",
        "partner.catalog.rental_mode.with_skipper": "Avec skipper",
        "partner.catalog.rental_mode.without_skipper": "Sans skipper",
        "partner.catalog.rental_mode.bareboat": "Bare-boat",
        "partner.catalog.rental_mode.full_crew": "Avec équipage complet",
        "partner.catalog.stay_type.hotel": "Hôtel",
        "partner.catalog.stay_type.villa": "Villa",
        "partner.catalog.stay_type.apartment": "Appartement",
        "partner.catalog.stay_type.bungalow": "Bungalow",
        "partner.catalog.stay_type.guest_house": "Maison d'hôtes",
        "partner.catalog.stay_type.bastide": "Bastide",
        "partner.catalog.stay_type.riad": "Riad",
        "partner.catalog.stay_type.lodge": "Lodge",
        "partner.catalog.cancellation.flexible": "Flexible",
        "partner.catalog.cancellation.moderate": "Modérée",
        "partner.catalog.cancellation.strict": "Stricte",
        "partner.catalog.cancellation.non_refundable": "Non remboursable",
        "partner.catalog.star_rating.unrated": "Non classé",
        "partner.catalog.star_rating.1": "★ 1 étoile",
        "partner.catalog.star_rating.2": "★★ 2 étoiles",
        "partner.catalog.star_rating.3": "★★★ 3 étoiles",
        "partner.catalog.star_rating.4": "★★★★ 4 étoiles",
        "partner.catalog.star_rating.5": "★★★★★ 5 étoiles",
        "partner.catalog.vehicle_type.city_car": "Citadine",
        "partner.catalog.vehicle_type.sedan": "Berline",
        "partner.catalog.vehicle_type.suv": "SUV",
        "partner.catalog.vehicle_type.convertible": "Cabriolet",
        "partner.catalog.vehicle_type.minivan": "Monospace",
        "partner.catalog.vehicle_type.utility": "Utilitaire",
        "partner.catalog.vehicle_type.quad": "Quad",
        "partner.catalog.vehicle_type.scooter_125": "Scooter 125",
        "partner.catalog.transmission.manual": "Manuelle",
        "partner.catalog.transmission.automatic": "Automatique",
        "partner.catalog.fuel.gasoline": "Essence",
        "partner.catalog.fuel.diesel": "Diesel",
        "partner.catalog.fuel.electric": "Électrique",
        "partner.catalog.fuel.hybrid": "Hybride",
        "partner.catalog.fuel.lpg": "GPL",
        "partner.catalog.card.partner_price": "Prix partenaire",
        "partner.catalog.card.commission": "Commission ({rate}%)",
        "partner.catalog.card.client_price": "Prix client",
        "partner.catalog.card.read_only_offer":
            "Offre synchronisée en lecture seule",
        "partner.catalog.action.enable": "Activer",
        "partner.catalog.action.disable": "Désactiver",
        "partner.catalog.action.edit": "Modifier",
        "partner.catalog.action.delete": "Supprimer",
        "partner.catalog.status.active": "Actif",
        "partner.catalog.status.inactive": "Inactif",
        "partner.catalog.delete.confirm_prompt": "Supprimer définitivement ?",
        "partner.catalog.meta.participants": "{min}–{max} pers.",
        "partner.catalog.meta.passengers": "{count} pass.",
        "partner.catalog.meta.travelers": "{count} voyageurs",
        "partner.catalog.meta.bedrooms": "{count} ch.",
        "partner.catalog.meta.minimum_nights": "min. {count} nuit{suffix}",

        "service.form.pricing_unit.person": "Par personne",
        "service.form.pricing_unit.group": "Par groupe",
        "service.form.pricing_unit.day": "Par jour",
        "service.form.pricing_unit.night": "Par nuit",
        "service.form.pricing_unit.week": "Par semaine",
        "service.form.pricing_unit.half_day": "Par demi-journée",
        "service.form.rule_type.weekend": "Week-end",
        "service.form.rule_type.seasonal": "Saisonnier",
        "service.form.rule_type.duration": "Long séjour",
        "service.form.adjustment.percentage": "Pourcentage",
        "service.form.adjustment.fixed": "Montant fixe (EUR)",
        "service.form.city.choose": "Choisir une ville",
        "service.form.city.lagos": "Lagos",
        "service.form.city.alvor": "Alvor",
        "service.form.city.portimao": "Portimão",
        "service.form.city.silves": "Silves",
        "service.form.city.benagil": "Benagil",
        "service.form.city.armacao_de_pera": "Armação de Pêra",
        "service.form.city.vilamoura": "Vilamoura",
        "service.form.city.albufeira": "Albufeira",
        "service.form.guidance.activity.title":
            "Points attendus pour une activité",
        "service.form.guidance.activity.1":
            "Décrivez clairement l'expérience, le niveau requis et ce qui est inclus.",
        "service.form.guidance.activity.2":
            "Renseignez une ville précise et un prix lisible par personne ou par groupe.",
        "service.form.guidance.activity.3":
            "Ajoutez des images qui montrent l'activité en situation réelle.",
        "service.form.guidance.boat.title": "Points attendus pour un bateau",
        "service.form.guidance.boat.1":
            "Choisissez la sous-catégorie adaptée : yacht, catamaran, jet-ski ou location simple.",
        "service.form.guidance.boat.2":
            "Complétez les attributs techniques comme longueur, cabines, vitesse ou carburant.",
        "service.form.guidance.boat.3":
            "Vérifiez que les extras utiles comme skipper ou carburant sont bien visibles.",
        "service.form.guidance.stay.title":
            "Points attendus pour un hébergement",
        "service.form.guidance.stay.1":
            "Précisez la capacité réelle et les attributs de confort comme chambres, salles de bain, WiFi ou piscine.",
        "service.form.guidance.stay.2":
            "Soignez les images de couverture et la localisation exacte.",
        "service.form.guidance.stay.3":
            "Utilisez des extras clairs comme ménage final ou petit-déjeuner si nécessaire.",
        "service.form.guidance.car.title": "Points attendus pour une voiture",
        "service.form.guidance.car.1":
            "Choisissez la bonne sous-catégorie : SUV, luxe, électrique ou citadine.",
        "service.form.guidance.car.2":
            "Renseignez les attributs utiles comme transmission, carburant, portes et climatisation.",
        "service.form.guidance.car.3":
            "Ajoutez des extras simples à comprendre, par exemple chauffeur ou livraison.",
        "service.form.external.title": "Offre externe en lecture seule",
        "service.form.external.subtitle":
            "Cette offre est synchronisée depuis une source externe et ne peut pas être modifiée ici.",
        "service.form.external.back": "Retour au catalogue",
        "service.form.toast.images_uploaded_one": "1 image téléversée.",
        "service.form.toast.images_uploaded_other":
            "{count} images téléversées.",
        "service.form.toast.images_upload_error":
            "Le téléversement des images a échoué.",
        "service.form.error.title_required": "Le titre est obligatoire.",
        "service.form.error.description_required":
            "La description est obligatoire.",
        "service.form.error.category_required":
            "Choisissez une catégorie détaillée.",
        "service.form.error.city_required": "La ville est obligatoire.",
        "service.form.error.country_required": "Le pays est obligatoire.",
        "service.form.error.price_positive": "Saisissez un prix positif.",
        "service.form.error.image_required":
            "Ajoutez au moins une image pour ce service.",
        "service.form.error.required_attributes":
            "Les attributs obligatoires doivent être renseignés.",
        "service.form.error.fix_before_continue":
            "Veuillez corriger les erreurs avant de continuer.",
        "service.form.toast.save_update": "Service mis à jour avec succès.",
        "service.form.toast.save_create": "Service créé avec succès.",
        "service.form.toast.save_error":
            "La sauvegarde du service a échoué. Vérifiez les données puis réessayez.",
        "service.form.toast.ical_saved": "Configuration iCal enregistrée.",
        "service.form.toast.ical_save_error":
            "Impossible d'enregistrer la configuration iCal.",
        "service.form.error.rule_name_value":
            "Renseignez un nom de règle et une valeur de tarification.",
        "service.form.error.rule_dates":
            "Les dates sont obligatoires pour une règle saisonnière.",
        "service.form.error.rule_min_units":
            "Le nombre minimal d'unités est obligatoire.",
        "service.form.toast.rule_created": "Règle tarifaire ajoutée.",
        "service.form.toast.rule_create_error":
            "Impossible d'enregistrer la règle tarifaire.",
        "service.form.toast.rule_deleted": "Règle tarifaire supprimée.",
        "service.form.toast.rule_delete_error":
            "Impossible de supprimer la règle tarifaire.",
        "service.form.toast.ical_sync_result":
            "{count} événement(s) importé(s) depuis le calendrier externe.",
        "service.form.toast.ical_sync_error":
            "La synchronisation iCal a échoué.",
        "service.form.toast.ical_copy": "Lien iCal copié.",
        "service.form.toast.ical_copy_error":
            "Impossible de copier le lien iCal.",
        "service.form.breadcrumb.catalog_admin": "Catalogue admin",
        "service.form.breadcrumb.catalog": "Catalogue",
        "service.form.breadcrumb.edit": "Modifier le service",
        "service.form.breadcrumb.new": "Nouveau service",
        "service.form.title.edit": "Modifier le service",
        "service.form.title.create": "Créer un service",
        "service.form.subtitle.edit":
            "Modifiez les informations de votre service.",
        "service.form.subtitle.create":
            "Renseignez les informations principales de votre nouvelle offre.",
        "service.form.section.general": "Informations générales",
        "service.form.partner_optional": "Partenaire propriétaire optionnel",
        "service.form.partner.none_assigned": "Aucun partenaire assigné",
        "service.form.partner.none_available": "Aucun partenaire disponible",
        "service.form.partner.hint_none":
            "Créez ou validez d'abord un partenaire avant de publier un service depuis l'admin.",
        "service.form.partner.hint_optional":
            "Vous pouvez laisser ce champ vide pour créer un service non rattaché à un partenaire.",
        "service.form.label.title": "Titre du service",
        "service.form.placeholder.title":
            "Ex. : plongée sous-marine sur la Côte d’Azur",
        "service.form.label.description": "Description",
        "service.form.placeholder.description":
            "Décrivez votre service de manière détaillée...",
        "service.form.label.category": "Catégorie",
        "service.form.label.detailed_category": "Catégorie détaillée",
        "service.form.choose_category": "Choisir une catégorie",
        "service.form.no_admin_category": "Aucune catégorie admin disponible",
        "service.form.available": "Service disponible à la réservation",
        "service.form.label.subcategory": "Sous-catégorie",
        "service.form.choose_subcategory": "Choisir une sous-catégorie",
        "service.form.structure.title": "Structure appliquée",
        "service.form.structure.subtitle":
            "La catégorie détaillée choisie pilote les sous-catégories, attributs et extras de cette offre.",
        "service.form.structure.manage": "Gérer la structure",
        "service.form.structure.choose_hint":
            "Choisissez une catégorie détaillée pour afficher la structure attendue.",
        "service.form.structure.none_active":
            "Aucune structure admin active n’est disponible pour ce type de service.",
        "service.form.structure.active": "Catégorie active",
        "service.form.structure.subcategories": "Sous-catégories",
        "service.form.structure.selected": "Sélectionnée",
        "service.form.structure.none_subcategories":
            "Aucune sous-catégorie admin configurée.",
        "service.form.structure.attributes": "Attributs attendus",
        "service.form.structure.required_count":
            "{required} obligatoire(s) sur {total}",
        "service.form.structure.required": "Obligatoire",
        "service.form.structure.optional": "Optionnel",
        "service.form.structure.filter": "Filtre",
        "service.form.structure.none_attributes":
            "Aucun attribut dynamique pour cette catégorie détaillée.",
        "service.form.structure.extras": "Extras hérités",
        "service.form.structure.none_extras":
            "Aucun extra actif défini sur cette catégorie.",
        "service.form.section.guidance": "Aide de saisie",
        "service.form.guidance.structure": "Structure : {name}",
        "service.form.section.dynamic_attributes": "Attributs dynamiques",
        "service.form.choose": "Choisir",
        "service.form.section.location": "Localisation",
        "service.form.label.city": "Ville",
        "service.form.label.country": "Pays",
        "service.form.placeholder.country": "Ex : Portugal",
        "service.form.label.region": "Région",
        "service.form.placeholder.region": "Ex : Algarve",
        "service.form.section.pricing": "Tarification",
        "service.form.label.price": "Votre prix (EUR)",
        "service.form.placeholder.price": "Ex : 85.00",
        "service.form.label.pricing_unit": "Unité de facturation",
        "service.form.client_price": "Prix affiché au client :",
        "service.form.client_price_note":
            "(inclut {rate}% de commission Wandireo)",
        "service.form.dynamic_rules": "Règles tarifaires dynamiques",
        "service.form.dynamic_rules_hint_create":
            "Enregistrez d'abord le service pour ajouter des règles de week-end, de saison ou de long séjour.",
        "service.form.rule.name": "Nom de la règle",
        "service.form.rule.name_placeholder": "Ex : Majoration week-end",
        "service.form.rule.type": "Type de règle",
        "service.form.rule.adjustment": "Ajustement",
        "service.form.rule.value": "Valeur",
        "service.form.rule.value_placeholder": "Ex : 15",
        "service.form.rule.priority": "Priorité",
        "service.form.rule.start": "Début",
        "service.form.rule.end": "Fin",
        "service.form.rule.min_units": "Unités minimales",
        "service.form.rule.min_units_placeholder": "Ex : 7",
        "service.form.rule.backend_hint":
            "Les règles sont appliquées côté backend au moment de la réservation. Le prix de base reste le prix d'appel.",
        "service.form.rule.adding": "Ajout...",
        "service.form.rule.add": "Ajouter la règle",
        "service.form.rule.min_units_display": "{count} unités minimum",
        "service.form.rule.priority_display": "Priorité {priority}",
        "service.form.delete": "Supprimer",
        "service.form.label.payment_mode": "Mode de paiement",
        "service.form.label.booking_mode": "Mode de réservation",
        "service.form.booking_mode.request": "Demande de réservation",
        "service.form.booking_mode.instant": "Instant booking",
        "service.form.section.media": "Médias & Tags",
        "service.form.label.images": "Images du service",
        "service.form.images_hint":
            "Téléversez une ou plusieurs images. La première image sera utilisée comme image principale.",
        "service.form.images_uploading": "Téléversement en cours...",
        "service.form.image.alt": "Aperçu {index}",
        "service.form.image.primary": "Image principale",
        "service.form.image.label": "Image {index}",
        "service.form.image.cover": "Couverture",
        "service.form.label.video": "URL vidéo",
        "service.form.label.tags": "Tags",
        "service.form.tags_placeholder":
            "plongée, mer, débutant (séparés par des virgules)",
        "service.form.tags_hint": "Séparez les tags par des virgules.",
        "service.form.featured": "Mettre en avant ce service",
        "service.form.section.ical": "Synchronisation iCal",
        "service.form.ical.create_hint":
            "Enregistrez d'abord le service pour activer l'import/export iCal.",
        "service.form.ical.unavailable_hint":
            "iCal est réservé aux hébergements et aux bateaux.",
        "service.form.ical.import_url": "URL du calendrier externe",
        "service.form.ical.import_hint":
            "Wandireo importe ce flux comme une source de blocage pour éviter les doubles réservations.",
        "service.form.ical.export_url": "Lien export Wandireo",
        "service.form.ical.export_placeholder":
            "Lien disponible après chargement",
        "service.form.ical.export_hint":
            "Utilisez ce lien dans Airbnb, Booking ou tout autre canal externe pour bloquer les dates Wandireo.",
        "service.form.ical.status": "Statut :",
        "service.form.ical.last_sync": "Dernière sync :",
        "service.form.ical.never": "Jamais",
        "service.form.ical.imported_events": "Événements importés :",
        "service.form.ical.saving": "Enregistrement...",
        "service.form.ical.save_url": "Enregistrer l'URL",
        "service.form.ical.syncing": "Synchronisation...",
        "service.form.ical.sync_now": "Synchroniser maintenant",
        "service.form.ical.copy_export": "Copier le lien export",
        "service.form.actions.cancel": "Annuler",
        "service.form.actions.saving": "Enregistrement...",
        "service.form.actions.uploading": "Téléversement...",
        "service.form.actions.save_changes": "Enregistrer les modifications",
        "service.form.actions.create": "Créer le service",

        "legal.title": "Mentions légales",
        "legal.updated": "Dernière mise à jour : 1er janvier 2026",
        "legal.section_1.title": "1. Éditeur du site",
        "legal.section_1.field_1.label": "Raison sociale",
        "legal.section_1.field_1.value": "Wandireo SAS",
        "legal.section_1.field_2.label": "Forme juridique",
        "legal.section_1.field_2.value": "Société par actions simplifiée (SAS)",
        "legal.section_1.field_3.label": "Capital social",
        "legal.section_1.field_3.value": "10 000 €",
        "legal.section_1.field_4.label": "Siège social",
        "legal.section_1.field_4.value":
            "12 Rue de l'Innovation, 75001 Paris, France",
        "legal.section_1.field_5.label": "RCS",
        "legal.section_1.field_5.value": "Paris — 123 456 789",
        "legal.section_1.field_6.label": "N° TVA intracommunautaire",
        "legal.section_1.field_6.value": "FR12 123456789",
        "legal.section_1.field_7.label": "Directeur de publication",
        "legal.section_1.field_7.value": "Wandireo Admin",
        "legal.section_1.field_8.label": "Contact",
        "legal.section_1.field_8.value": "wandireo.bookings@gmail.com",
        "legal.section_2.title": "2. Hébergement",
        "legal.section_2.field_1.label": "Hébergeur",
        "legal.section_2.field_1.value": "Amazon Web Services EMEA SARL",
        "legal.section_2.field_2.label": "Adresse",
        "legal.section_2.field_2.value":
            "38 Avenue John F. Kennedy, L-1855 Luxembourg",
        "legal.section_2.field_3.label": "Région",
        "legal.section_2.field_3.value": "eu-west-3 (Paris)",
        "legal.section_3.title": "3. Propriété intellectuelle",
        "legal.section_3.p1":
            "L'ensemble des éléments composant le site Wandireo (marque, logo, textes, images, graphismes, code source, structure) sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle et sont la propriété exclusive de Wandireo SAS, sauf mention contraire.",
        "legal.section_3.p2":
            "Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de Wandireo SAS.",
        "legal.section_4.title": "4. Limitation de responsabilité",
        "legal.section_4.p1":
            "Wandireo SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, la société ne peut garantir l'exhaustivité ni l'exactitude de ces informations, et décline toute responsabilité pour toute inexactitude, erreur ou omission.",
        "legal.section_4.p2":
            "Wandireo SAS ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.",
        "legal.section_5.title": "5. Liens hypertextes",
        "legal.section_5.p1":
            "Le site Wandireo peut contenir des liens vers des sites tiers. Ces liens sont fournis uniquement pour la commodité des utilisateurs. Wandireo SAS n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.",
        "legal.section_6.title": "6. Droit applicable",
        "legal.section_6.p1":
            "Le présent site est régi par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes mentions légales, la compétence exclusive est attribuée aux tribunaux de Paris.",
        "legal.section_7.title": "7. Médiateur de la consommation",
        "legal.section_7.p1":
            "Conformément à l'article L.616-1 du Code de la consommation, Wandireo SAS propose un dispositif de médiation de la consommation. Le médiateur désigné est :",
        "legal.section_7.mediator":
            "CMAP (Centre de Médiation et d'Arbitrage de Paris)",
        "legal.section_7.address":
            ", 39 avenue Franklin D. Roosevelt, 75008 Paris — ",
        "legal.section_7.website": "www.cmap.fr",

        "privacy.title": "Politique de confidentialité",
        "privacy.updated": "Dernière mise à jour : 1er janvier 2026",
        "privacy.section_1.title": "1. Responsable du traitement",
        "privacy.section_1.p1":
            "Le responsable du traitement de vos données personnelles est la société Wandireo SAS, société par actions simplifiée, dont le siège social est situé au 12 Rue de l'Innovation, 75001 Paris, France.",
        "privacy.section_1.p2": "Contact DPO : ",
        "privacy.section_2.title": "2. Données collectées",
        "privacy.section_2.p1":
            "Dans le cadre de l'utilisation de la plateforme Wandireo, nous collectons les données suivantes :",
        "privacy.section_2.item_1":
            "Données d'identification : nom, prénom, adresse e-mail, numéro de téléphone.",
        "privacy.section_2.item_2":
            "Données de connexion : adresse IP, identifiants de session, logs d'accès.",
        "privacy.section_2.item_3":
            "Données de paiement : informations de carte bancaire traitées de manière sécurisée via Stripe (nous ne stockons pas les numéros de carte complets).",
        "privacy.section_2.item_4":
            "Données de navigation : pages consultées, durée des sessions, type d'appareil.",
        "privacy.section_2.item_5":
            "Données transactionnelles : historique des réservations, avis déposés, favoris.",
        "privacy.section_3.title": "3. Finalités du traitement",
        "privacy.section_3.p1":
            "Vos données sont traitées pour les finalités suivantes :",
        "privacy.section_3.item_1":
            "Gestion de votre compte utilisateur et authentification.",
        "privacy.section_3.item_2": "Traitement et suivi de vos réservations.",
        "privacy.section_3.item_3": "Traitement des paiements en ligne.",
        "privacy.section_3.item_4":
            "Envoi de confirmations et de communications transactionnelles.",
        "privacy.section_3.item_5":
            "Amélioration de nos services et personnalisation de votre expérience.",
        "privacy.section_3.item_6":
            "Respect de nos obligations légales et réglementaires.",
        "privacy.section_3.item_7":
            "Prévention des fraudes et sécurisation des transactions.",
        "privacy.section_4.title": "4. Base légale du traitement",
        "privacy.section_4.p1": "Les traitements sont fondés sur :",
        "privacy.section_4.item_1":
            "L'exécution du contrat : gestion des réservations, paiements.",
        "privacy.section_4.item_2":
            "L'obligation légale : conservation des factures, conformité fiscale.",
        "privacy.section_4.item_3":
            "L'intérêt légitime : prévention des fraudes, amélioration du service.",
        "privacy.section_4.item_4":
            "Votre consentement : communications marketing (révocable à tout moment).",
        "privacy.section_5.title": "5. Durée de conservation",
        "privacy.section_5.p1":
            "Vos données sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées :",
        "privacy.section_5.item_1":
            "Données de compte actif : durée de la relation contractuelle.",
        "privacy.section_5.item_2":
            "Données de paiement : 5 ans à des fins de conformité fiscale et comptable.",
        "privacy.section_5.item_3": "Logs de connexion : 12 mois.",
        "privacy.section_5.item_4":
            "Après fermeture du compte : archivage pendant 3 ans pour les besoins probatoires.",
        "privacy.section_6.title": "6. Partage des données",
        "privacy.section_6.p1": "Vos données peuvent être partagées avec :",
        "privacy.section_6.item_1":
            "Les partenaires prestataires : pour l'exécution de votre réservation.",
        "privacy.section_6.item_2":
            "Stripe : pour le traitement sécurisé des paiements.",
        "privacy.section_6.item_3":
            "Nos sous-traitants techniques : hébergement, emailing, analytics (liés par des clauses de confidentialité strictes).",
        "privacy.section_6.item_4":
            "Les autorités compétentes : si requis par la loi.",
        "privacy.section_6.p2":
            "Nous ne vendons jamais vos données personnelles à des tiers.",
        "privacy.section_7.title": "7. Vos droits",
        "privacy.section_7.p1":
            "Conformément au Règlement général sur la protection des données (RGPD), vous disposez des droits suivants sur vos données personnelles :",
        "privacy.section_7.item_1":
            "Droit d'accès : obtenir une copie de vos données.",
        "privacy.section_7.item_2":
            "Droit de rectification : corriger des données inexactes.",
        "privacy.section_7.item_3":
            "Droit à l'effacement : demander la suppression de vos données.",
        "privacy.section_7.item_4":
            "Droit à la portabilité : recevoir vos données dans un format structuré.",
        "privacy.section_7.item_5":
            "Droit d'opposition : vous opposer à certains traitements.",
        "privacy.section_7.item_6":
            "Droit à la limitation : limiter le traitement de vos données.",
        "privacy.section_7.p2":
            "Pour exercer ces droits, contactez notre DPO à ",
        "privacy.section_7.p3":
            ". Vous disposez également du droit de déposer une réclamation auprès de la CNIL.",
        "privacy.section_8.title": "8. Cookies",
        "privacy.section_8.p1":
            "La plateforme utilise des cookies techniques nécessaires à son fonctionnement, ainsi que des cookies analytiques et de mesure d'audience. Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.",
        "privacy.section_9.title": "9. Sécurité",
        "privacy.section_9.p1":
            "Wandireo met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération, notamment : chiffrement TLS en transit, hachage des mots de passe, contrôle d'accès strict.",

        "terms.title": "Conditions générales d'utilisation",
        "terms.updated": "Dernière mise à jour : 1er janvier 2026",
        "terms.section_1.title": "1. Objet",
        "terms.section_1.p1":
            "Les présentes Conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Wandireo, accessible à l'adresse wandireo.com, éditée par la société Wandireo SAS, société par actions simplifiée au capital de 10 000 €, immatriculée au RCS de Paris sous le numéro 123 456 789.",
        "terms.section_1.p2":
            "Toute utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez cesser immédiatement d'utiliser la plateforme.",
        "terms.section_2.title": "2. Description du service",
        "terms.section_2.p1":
            "Wandireo est une marketplace de services touristiques permettant à des prestataires (partenaires) de proposer leurs offres d'activités, de location de bateaux, d'hébergements et de voitures à des clients voyageurs.",
        "terms.section_2.p2":
            "Wandireo agit en qualité d'intermédiaire entre les clients et les partenaires prestataires.",
        "terms.section_3.title": "3. Accès à la plateforme",
        "terms.section_3.p1":
            "L'accès à la plateforme est ouvert à toute personne physique majeure ou personne morale disposant d'une adresse e-mail valide et d'un accès à Internet.",
        "terms.section_3.p2":
            "Wandireo se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnité.",
        "terms.section_4.title": "4. Création de compte",
        "terms.section_4.p1":
            "Pour accéder à l'ensemble des fonctionnalités de la plateforme, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.",
        "terms.section_4.p2":
            "Toute connexion effectuée avec les identifiants d'un utilisateur est présumée effectuée par cet utilisateur.",
        "terms.section_5.title": "5. Conditions de réservation",
        "terms.section_5.p1":
            "La réservation d'un service est ferme et définitive dès lors que le client a validé son panier et procédé au paiement conformément au mode de paiement défini par le prestataire. Trois modes sont disponibles :",
        "terms.section_5.item_1":
            "Paiement intégral en ligne : le montant total est prélevé au moment de la réservation.",
        "terms.section_5.item_2":
            "Commission en ligne, solde sur place : seuls les frais de service Wandireo sont prélevés en ligne.",
        "terms.section_5.item_3":
            "Paiement intégral sur place : aucun montant n'est prélevé en ligne.",
        "terms.section_6.title": "6. Commissions et tarification",
        "terms.section_6.p1":
            "Wandireo prélève une commission sur chaque transaction réalisée via la plateforme. Le taux de commission est défini contractuellement avec chaque partenaire. Le prix affiché au client inclut toujours la commission Wandireo.",
        "terms.section_7.title": "7. Responsabilités",
        "terms.section_7.p1":
            "Wandireo agit en qualité d'intermédiaire et ne peut être tenu responsable de la qualité, de la sécurité ou de la conformité des services proposés par les partenaires. Chaque partenaire est seul responsable du contenu de ses offres et de l'exécution de ses prestations.",
        "terms.section_8.title": "8. Propriété intellectuelle",
        "terms.section_8.p1":
            "L'ensemble des éléments de la plateforme (marque, logos, textes, images, interface) sont la propriété exclusive de Wandireo SAS et sont protégés par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation écrite préalable.",
        "terms.section_9.title": "9. Droit applicable et juridiction",
        "terms.section_9.p1":
            "Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de Paris seront seuls compétents.",
        "terms.section_10.title": "10. Contact",
        "terms.section_10.p1":
            "Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante : ",
    },
    pt: {},
    en: {},
    es: {},
    it: {},
    de: {},
};

translations.fr = {
    ...translations.fr,
    ...buildPublicPagesFrTranslations(),
};

const i18nResources = Object.fromEntries(
    Object.entries(translations).map(([locale, catalog]) => [
        locale,
        { translation: catalog },
    ]),
) as Record<Locale, { translation: Record<string, string> }>;

const translatedLocales: Locale[] = ["pt", "en", "es", "it", "de"];

for (const locale of translatedLocales) {
    translations[locale] = {
        ...translations.fr,
        ...buildSharedUiTranslations(locale),
        "nav.home":
            locale === "en"
                ? "Home"
                : locale === "pt"
                  ? "Inicio"
                  : locale === "es"
                    ? "Inicio"
                    : locale === "it"
                      ? "Home"
                      : "Startseite",
        "nav.search":
            locale === "en"
                ? "Search"
                : locale === "pt"
                  ? "Pesquisar"
                  : locale === "es"
                    ? "Buscar"
                    : locale === "it"
                      ? "Ricerca"
                      : "Suche",
        "nav.login":
            locale === "en"
                ? "Login"
                : locale === "pt"
                  ? "Entrar"
                  : locale === "es"
                    ? "Iniciar sesion"
                    : locale === "it"
                      ? "Accedi"
                      : "Anmelden",
        "nav.register":
            locale === "en"
                ? "Register"
                : locale === "pt"
                  ? "Registar"
                  : locale === "es"
                    ? "Registrarse"
                    : locale === "it"
                      ? "Registrati"
                      : "Registrieren",
        "nav.logout":
            locale === "en"
                ? "Logout"
                : locale === "pt"
                  ? "Sair"
                  : locale === "es"
                    ? "Cerrar sesion"
                    : locale === "it"
                      ? "Esci"
                      : "Abmelden",
        "nav.partner":
            locale === "en"
                ? "Partner area"
                : locale === "pt"
                  ? "Area parceiro"
                  : locale === "es"
                    ? "Area socio"
                    : locale === "it"
                      ? "Area partner"
                      : "Partnerbereich",
        "nav.admin":
            locale === "en"
                ? "Administration"
                : locale === "pt"
                  ? "Administracao"
                  : locale === "es"
                    ? "Administracion"
                    : locale === "it"
                      ? "Amministrazione"
                      : "Verwaltung",
        "nav.become_partner":
            locale === "en"
                ? "Become a partner"
                : locale === "pt"
                  ? "Tornar-se parceiro"
                  : locale === "es"
                    ? "Hazte socio"
                    : locale === "it"
                      ? "Diventa partner"
                      : "Partner werden",
        "common.loading":
            locale === "en"
                ? "Loading..."
                : locale === "pt"
                  ? "A carregar..."
                  : locale === "es"
                    ? "Cargando..."
                    : locale === "it"
                      ? "Caricamento..."
                      : "Laden...",
        "common.close":
            locale === "en"
                ? "Close"
                : locale === "pt"
                  ? "Fechar"
                  : locale === "es"
                    ? "Cerrar"
                    : locale === "it"
                      ? "Chiudi"
                      : "Schliessen",
        "common.cancel":
            locale === "en"
                ? "Cancel"
                : locale === "pt"
                  ? "Cancelar"
                  : locale === "es"
                    ? "Cancelar"
                    : locale === "it"
                      ? "Annulla"
                      : "Abbrechen",
        "common.create":
            locale === "en"
                ? "Create"
                : locale === "pt"
                  ? "Criar"
                  : locale === "es"
                    ? "Crear"
                    : locale === "it"
                      ? "Crea"
                      : "Erstellen",
        "common.save":
            locale === "en"
                ? "Save"
                : locale === "pt"
                  ? "Guardar"
                  : locale === "es"
                    ? "Guardar"
                    : locale === "it"
                      ? "Salva"
                      : "Speichern",
        "common.system":
            locale === "en"
                ? "System"
                : locale === "pt"
                  ? "Sistema"
                  : locale === "es"
                    ? "Sistema"
                    : locale === "it"
                      ? "Sistema"
                      : "System",
        "common.light":
            locale === "en"
                ? "Light"
                : locale === "pt"
                  ? "Claro"
                  : locale === "es"
                    ? "Claro"
                    : locale === "it"
                      ? "Chiaro"
                      : "Hell",
        "common.dark":
            locale === "en"
                ? "Dark"
                : locale === "pt"
                  ? "Escuro"
                  : locale === "es"
                    ? "Oscuro"
                    : locale === "it"
                      ? "Scuro"
                      : "Dunkel",
        "theme.change":
            locale === "en"
                ? "Change theme"
                : locale === "pt"
                  ? "Mudar tema"
                  : locale === "es"
                    ? "Cambiar tema"
                    : locale === "it"
                      ? "Cambia tema"
                      : "Theme wechseln",
        "language.change":
            locale === "en"
                ? "Change language"
                : locale === "pt"
                  ? "Mudar idioma"
                  : locale === "es"
                    ? "Cambiar idioma"
                    : locale === "it"
                      ? "Cambia lingua"
                      : "Sprache wechseln",
        "header.logo_aria":
            locale === "en"
                ? "Wandireo - Back to home"
                : locale === "pt"
                  ? "Wandireo - Voltar ao inicio"
                  : locale === "es"
                    ? "Wandireo - Volver al inicio"
                    : locale === "it"
                      ? "Wandireo - Torna alla home"
                      : "Wandireo - Zur Startseite",
        "header.primary_nav_aria":
            locale === "en"
                ? "Main navigation"
                : locale === "pt"
                  ? "Navegacao principal"
                  : locale === "es"
                    ? "Navegacion principal"
                    : locale === "it"
                      ? "Navigazione principale"
                      : "Hauptnavigation",
        "header.open_menu":
            locale === "en"
                ? "Open navigation menu"
                : locale === "pt"
                  ? "Abrir menu de navegacao"
                  : locale === "es"
                    ? "Abrir menu de navegacion"
                    : locale === "it"
                      ? "Apri menu di navigazione"
                      : "Navigationsmenu offnen",
        "header.dashboard":
            locale === "en"
                ? "Dashboard"
                : locale === "pt"
                  ? "Painel"
                  : locale === "es"
                    ? "Panel"
                    : locale === "it"
                      ? "Dashboard"
                      : "Dashboard",
        "header.catalog":
            locale === "en"
                ? "Catalog"
                : locale === "pt"
                  ? "Catalogo"
                  : locale === "es"
                    ? "Catalogo"
                    : locale === "it"
                      ? "Catalogo"
                      : "Katalog",
        "header.admin_users":
            locale === "en"
                ? "Users"
                : locale === "pt"
                  ? "Utilizadores"
                  : locale === "es"
                    ? "Usuarios"
                    : locale === "it"
                      ? "Utenti"
                      : "Benutzer",
        "sidebar.mobile_nav":
            locale === "en"
                ? "Mobile navigation menu"
                : locale === "pt"
                  ? "Menu de navegacao movel"
                  : locale === "es"
                    ? "Menu de navegacion movil"
                    : locale === "it"
                      ? "Menu di navigazione mobile"
                      : "Mobiles Navigationsmenu",
        "sidebar.logo_aria":
            locale === "en"
                ? "Wandireo - Back to home"
                : locale === "pt"
                  ? "Wandireo - Voltar ao inicio"
                  : locale === "es"
                    ? "Wandireo - Volver al inicio"
                    : locale === "it"
                      ? "Wandireo - Torna alla home"
                      : "Wandireo - Zur Startseite",
        "sidebar.close_menu":
            locale === "en"
                ? "Close menu"
                : locale === "pt"
                  ? "Fechar menu"
                  : locale === "es"
                    ? "Cerrar menu"
                    : locale === "it"
                      ? "Chiudi menu"
                      : "Menu schliessen",
        "sidebar.service_categories":
            locale === "en"
                ? "Service categories"
                : locale === "pt"
                  ? "Categorias de servico"
                  : locale === "es"
                    ? "Categorias de servicio"
                    : locale === "it"
                      ? "Categorie di servizio"
                      : "Servicekategorien",
        "sidebar.discover":
            locale === "en"
                ? "Explore"
                : locale === "pt"
                  ? "Descobrir"
                  : locale === "es"
                    ? "Descubrir"
                    : locale === "it"
                      ? "Scopri"
                      : "Entdecken",
        "sidebar.additional_links":
            locale === "en"
                ? "Additional links"
                : locale === "pt"
                  ? "Links adicionais"
                  : locale === "es"
                    ? "Enlaces adicionales"
                    : locale === "it"
                      ? "Link aggiuntivi"
                      : "Zusatzliche Links",
        "sidebar.brand": "Wandireo",
        "sidebar.contact_us":
            locale === "en"
                ? "Contact us"
                : locale === "pt"
                  ? "Contacte-nos"
                  : locale === "es"
                    ? "Contactanos"
                    : locale === "it"
                      ? "Contattaci"
                      : "Kontaktieren Sie uns",
        "sidebar.create_account":
            locale === "en"
                ? "Create account"
                : locale === "pt"
                  ? "Criar conta"
                  : locale === "es"
                    ? "Crear cuenta"
                    : locale === "it"
                      ? "Crea account"
                      : "Konto erstellen",
        "sidebar.role.partner":
            locale === "en"
                ? "Partner"
                : locale === "pt"
                  ? "Parceiro"
                  : locale === "es"
                    ? "Socio"
                    : locale === "it"
                      ? "Partner"
                      : "Partner",
        "sidebar.role.admin":
            locale === "en"
                ? "Administrator"
                : locale === "pt"
                  ? "Administrador"
                  : locale === "es"
                    ? "Administrador"
                    : locale === "it"
                      ? "Amministratore"
                      : "Administrator",
        "sidebar.role.traveler":
            locale === "en"
                ? "Traveler"
                : locale === "pt"
                  ? "Viajante"
                  : locale === "es"
                    ? "Viajero"
                    : locale === "it"
                      ? "Viaggiatore"
                      : "Reisender",
        "dashboard.avatar_label":
            locale === "en"
                ? "Avatar of {name}"
                : locale === "pt"
                  ? "Avatar de {name}"
                  : locale === "es"
                    ? "Avatar de {name}"
                    : locale === "it"
                      ? "Avatar di {name}"
                      : "Avatar von {name}",
        "partner.dashboard.avatar_label":
            locale === "en"
                ? "Initials for {company}"
                : locale === "pt"
                  ? "Iniciais de {company}"
                  : locale === "es"
                    ? "Iniciales de {company}"
                    : locale === "it"
                      ? "Iniziali di {company}"
                      : "Initialen von {company}",
        "partner.dashboard.catalog_aria":
            locale === "en"
                ? "Open catalog management"
                : locale === "pt"
                  ? "Abrir gestao do catalogo"
                  : locale === "es"
                    ? "Abrir gestion del catalogo"
                    : locale === "it"
                      ? "Apri gestione catalogo"
                      : "Katalogverwaltung offnen",
        "partner.dashboard.bookings_aria":
            locale === "en"
                ? "Open booking management"
                : locale === "pt"
                  ? "Abrir gestao das reservas"
                  : locale === "es"
                    ? "Abrir gestion de reservas"
                    : locale === "it"
                      ? "Apri gestione prenotazioni"
                      : "Buchungsverwaltung offnen",
        "partner.dashboard.pending_badge":
            locale === "en"
                ? "{count} pending requests"
                : locale === "pt"
                  ? "{count} pedidos pendentes"
                  : locale === "es"
                    ? "{count} solicitudes pendientes"
                    : locale === "it"
                      ? "{count} richieste in attesa"
                      : "{count} ausstehende Anfragen",
        "partner.dashboard.status.confirmed":
            locale === "en"
                ? "Confirmed"
                : locale === "pt"
                  ? "Confirmada"
                  : locale === "es"
                    ? "Confirmada"
                    : locale === "it"
                      ? "Confermata"
                      : "Bestatigt",
        "partner.dashboard.status.pending":
            locale === "en"
                ? "Pending"
                : locale === "pt"
                  ? "Pendente"
                  : locale === "es"
                    ? "Pendiente"
                    : locale === "it"
                      ? "In attesa"
                      : "Ausstehend",
        "partner.dashboard.status.cancelled":
            locale === "en"
                ? "Cancelled"
                : locale === "pt"
                  ? "Cancelada"
                  : locale === "es"
                    ? "Cancelada"
                    : locale === "it"
                      ? "Annullata"
                      : "Storniert",
        "footer.logo_aria":
            locale === "en"
                ? "Wandireo - Back to home"
                : locale === "pt"
                  ? "Wandireo - Voltar ao inicio"
                  : locale === "es"
                    ? "Wandireo - Volver al inicio"
                    : locale === "it"
                      ? "Wandireo - Torna alla home"
                      : "Wandireo - Zur Startseite",
        "footer.faq": "FAQ",
        "footer.social.whatsapp":
            locale === "en"
                ? "Contact Wandireo on WhatsApp"
                : locale === "pt"
                  ? "Contactar a Wandireo no WhatsApp"
                  : locale === "es"
                    ? "Contactar con Wandireo por WhatsApp"
                    : locale === "it"
                      ? "Contattare Wandireo su WhatsApp"
                      : "Wandireo uber WhatsApp kontaktieren",
        "footer.social.instagram": "Instagram",
        "footer.social.tiktok": "TikTok",
        "blog.read_more":
            locale === "en"
                ? "Read article"
                : locale === "pt"
                  ? "Ler artigo"
                  : locale === "es"
                    ? "Leer articulo"
                    : locale === "it"
                      ? "Leggi l'articolo"
                      : "Artikel lesen",
        "support.new_ticket":
            locale === "en"
                ? "New ticket"
                : locale === "pt"
                  ? "Novo ticket"
                  : locale === "es"
                    ? "Nuevo ticket"
                    : locale === "it"
                      ? "Nuovo ticket"
                      : "Neues Ticket",
        "support.ticket_subject":
            locale === "en"
                ? "Subject"
                : locale === "pt"
                  ? "Assunto"
                  : locale === "es"
                    ? "Asunto"
                    : locale === "it"
                      ? "Oggetto"
                      : "Betreff",
        "support.ticket_message":
            locale === "en"
                ? "Message"
                : locale === "pt"
                  ? "Mensagem"
                  : locale === "es"
                    ? "Mensaje"
                    : locale === "it"
                      ? "Messaggio"
                      : "Nachricht",
        "support.ticket_date":
            locale === "en"
                ? "Date"
                : locale === "pt"
                  ? "Data"
                  : locale === "es"
                    ? "Fecha"
                    : locale === "it"
                      ? "Data"
                      : "Datum",
        "support.ticket_actions":
            locale === "en"
                ? "Actions"
                : locale === "pt"
                  ? "Acoes"
                  : locale === "es"
                    ? "Acciones"
                    : locale === "it"
                      ? "Azioni"
                      : "Aktionen",
        "support.ticket_initial_message":
            locale === "en"
                ? "Initial message"
                : locale === "pt"
                  ? "Mensagem inicial"
                  : locale === "es"
                    ? "Mensaje inicial"
                    : locale === "it"
                      ? "Messaggio iniziale"
                      : "Erste Nachricht",
        "checkout.steps.cart":
            locale === "en"
                ? "Cart"
                : locale === "pt"
                  ? "Carrinho"
                  : locale === "es"
                    ? "Carrito"
                    : locale === "it"
                      ? "Carrello"
                      : "Warenkorb",
        "checkout.steps.information":
            locale === "en"
                ? "Details"
                : locale === "pt"
                  ? "Informações"
                  : locale === "es"
                    ? "Información"
                    : locale === "it"
                      ? "Informazioni"
                      : "Informationen",
        "checkout.steps.payment":
            locale === "en"
                ? "Payment"
                : locale === "pt"
                  ? "Pagamento"
                  : locale === "es"
                    ? "Pago"
                    : locale === "it"
                      ? "Pagamento"
                      : "Zahlung",
        "checkout.steps.confirmation":
            locale === "en"
                ? "Confirmation"
                : locale === "pt"
                  ? "Confirmação"
                  : locale === "es"
                    ? "Confirmación"
                    : locale === "it"
                      ? "Conferma"
                      : "Bestätigung",
        "checkout.title":
            locale === "en"
                ? "Traveller information"
                : locale === "pt"
                  ? "Informações do viajante"
                  : locale === "es"
                    ? "Información del viajero"
                    : locale === "it"
                      ? "Informazioni del viaggiatore"
                      : "Reisendeninformationen",
        "checkout.subtitle":
            locale === "en"
                ? "These details will be shared with the provider to prepare your booking."
                : locale === "pt"
                  ? "Estas informações serão enviadas ao parceiro para preparar a sua reserva."
                  : locale === "es"
                    ? "Estos datos se compartirán con el proveedor para preparar su reserva."
                    : locale === "it"
                      ? "Questi dati saranno condivisi con il partner per preparare la prenotazione."
                      : "Diese Angaben werden an den Anbieter übermittelt, um Ihre Buchung vorzubereiten.",
        "checkout.identity":
            locale === "en"
                ? "Identity"
                : locale === "pt"
                  ? "Identidade"
                  : locale === "es"
                    ? "Identidad"
                    : locale === "it"
                      ? "Identità"
                      : "Identität",
        "checkout.contact":
            locale === "en"
                ? "Contact details"
                : locale === "pt"
                  ? "Contacto"
                  : locale === "es"
                    ? "Datos de contacto"
                    : locale === "it"
                      ? "Contatti"
                      : "Kontaktdaten",
        "checkout.special_requests":
            locale === "en"
                ? "Special requests"
                : locale === "pt"
                  ? "Pedidos especiais"
                  : locale === "es"
                    ? "Solicitudes especiales"
                    : locale === "it"
                      ? "Richieste speciali"
                      : "Besondere Wünsche",
        "checkout.optional":
            locale === "en"
                ? "optional"
                : locale === "pt"
                  ? "opcional"
                  : locale === "es"
                    ? "opcional"
                    : locale === "it"
                      ? "facoltativo"
                      : "optional",
        "checkout.first_name":
            locale === "en"
                ? "First name"
                : locale === "pt"
                  ? "Nome"
                  : locale === "es"
                    ? "Nombre"
                    : locale === "it"
                      ? "Nome"
                      : "Vorname",
        "checkout.last_name":
            locale === "en"
                ? "Last name"
                : locale === "pt"
                  ? "Apelido"
                  : locale === "es"
                    ? "Apellido"
                    : locale === "it"
                      ? "Cognome"
                      : "Nachname",
        "checkout.nationality":
            locale === "en"
                ? "Nationality"
                : locale === "pt"
                  ? "Nacionalidade"
                  : locale === "es"
                    ? "Nacionalidad"
                    : locale === "it"
                      ? "Nazionalità"
                      : "Nationalität",
        "checkout.nationality_placeholder":
            locale === "en"
                ? "e.g. French, Belgian, Swiss..."
                : locale === "pt"
                  ? "Ex.: Francesa, Belga, Suíça..."
                  : locale === "es"
                    ? "Ej.: Francesa, Belga, Suiza..."
                    : locale === "it"
                      ? "Es.: Francese, Belga, Svizzera..."
                      : "z. B. Französisch, Belgisch, Schweizerisch...",
        "checkout.email":
            locale === "en"
                ? "Email address"
                : locale === "pt"
                  ? "E-mail"
                  : locale === "es"
                    ? "Correo electrónico"
                    : locale === "it"
                      ? "Indirizzo e-mail"
                      : "E-Mail-Adresse",
        "checkout.email_placeholder":
            locale === "en"
                ? "your@email.com"
                : locale === "pt"
                  ? "o.seu@email.com"
                  : locale === "es"
                    ? "su@email.com"
                    : locale === "it"
                      ? "tuo@email.com"
                      : "ihre@email.de",
        "checkout.email_hint":
            locale === "en"
                ? "Your booking confirmation will be sent to this address."
                : locale === "pt"
                  ? "A confirmação da reserva será enviada para este endereço."
                  : locale === "es"
                    ? "La confirmación de la reserva se enviará a esta dirección."
                    : locale === "it"
                      ? "La conferma della prenotazione sarà inviata a questo indirizzo."
                      : "Die Buchungsbestätigung wird an diese Adresse gesendet.",
        "checkout.phone":
            locale === "en"
                ? "Phone number"
                : locale === "pt"
                  ? "Telefone"
                  : locale === "es"
                    ? "Teléfono"
                    : locale === "it"
                      ? "Telefono"
                      : "Telefon",
        "checkout.phone_placeholder":
            locale === "en"
                ? "+33 6 12 34 56 78"
                : locale === "pt"
                  ? "+351 912 345 678"
                  : locale === "es"
                    ? "+34 612 345 678"
                    : locale === "it"
                      ? "+39 312 345 6789"
                      : "+49 151 234 56789",
        "checkout.phone_hint":
            locale === "en"
                ? "Useful if anything changes on the day of the activity."
                : locale === "pt"
                  ? "Útil em caso de imprevisto no dia da atividade."
                  : locale === "es"
                    ? "Útil en caso de imprevisto el día de la actividad."
                    : locale === "it"
                      ? "Utile in caso di imprevisti il giorno dell’attività."
                      : "Hilfreich bei kurzfristigen Änderungen am Aktivitätstag.",
        "checkout.message_label":
            locale === "en"
                ? "Message to the provider"
                : locale === "pt"
                  ? "Mensagem ao parceiro"
                  : locale === "es"
                    ? "Mensaje al proveedor"
                    : locale === "it"
                      ? "Messaggio al partner"
                      : "Nachricht an den Anbieter",
        "checkout.message_placeholder":
            locale === "en"
                ? "Allergies, accessibility, birthday, special preferences..."
                : locale === "pt"
                  ? "Alergias, acessibilidade, aniversário, preferências especiais..."
                  : locale === "es"
                    ? "Alergias, accesibilidad, cumpleaños, preferencias especiales..."
                    : locale === "it"
                      ? "Allergie, accessibilità, compleanno, preferenze particolari..."
                      : "Allergien, Barrierefreiheit, Geburtstag, besondere Wünsche...",
        "checkout.back":
            locale === "en"
                ? "Back to cart"
                : locale === "pt"
                  ? "Voltar ao carrinho"
                  : locale === "es"
                    ? "Volver al carrito"
                    : locale === "it"
                      ? "Torna al carrello"
                      : "Zurück zum Warenkorb",
        "checkout.continue":
            locale === "en"
                ? "Continue — Payment"
                : locale === "pt"
                  ? "Continuar — Pagamento"
                  : locale === "es"
                    ? "Continuar — Pago"
                    : locale === "it"
                      ? "Continua — Pagamento"
                      : "Weiter — Zahlung",
        "checkout.order":
            locale === "en"
                ? "Your booking"
                : locale === "pt"
                  ? "A sua reserva"
                  : locale === "es"
                    ? "Su reserva"
                    : locale === "it"
                      ? "La tua prenotazione"
                      : "Ihre Buchung",
        "checkout.partner_price":
            locale === "en"
                ? "Provider price"
                : locale === "pt"
                  ? "Preço do parceiro"
                  : locale === "es"
                    ? "Precio del proveedor"
                    : locale === "it"
                      ? "Prezzo del partner"
                      : "Anbieterpreis",
        "checkout.extras": locale === "it" ? "Extra" : "Extras",
        "checkout.service_fee":
            locale === "en"
                ? "Service fee"
                : locale === "pt"
                  ? "Taxa de serviço"
                  : locale === "es"
                    ? "Gastos de servicio"
                    : locale === "it"
                      ? "Commissione di servizio"
                      : "Servicegebühr",
        "checkout.total_vat":
            locale === "en"
                ? "Total incl. tax"
                : locale === "pt"
                  ? "Total com IVA"
                  : locale === "es"
                    ? "Total con impuestos"
                    : locale === "it"
                      ? "Totale IVA inclusa"
                      : "Gesamt inkl. MwSt.",
        "checkout.errors.first_name":
            locale === "en"
                ? "First name is required."
                : locale === "pt"
                  ? "O nome é obrigatório."
                  : locale === "es"
                    ? "El nombre es obligatorio."
                    : locale === "it"
                      ? "Il nome è obbligatorio."
                      : "Der Vorname ist erforderlich.",
        "checkout.errors.last_name":
            locale === "en"
                ? "Last name is required."
                : locale === "pt"
                  ? "O apelido é obrigatório."
                  : locale === "es"
                    ? "El apellido es obligatorio."
                    : locale === "it"
                      ? "Il cognome è obbligatorio."
                      : "Der Nachname ist erforderlich.",
        "checkout.errors.email_required":
            locale === "en"
                ? "Email address is required."
                : locale === "pt"
                  ? "O e-mail é obrigatório."
                  : locale === "es"
                    ? "El correo electrónico es obligatorio."
                    : locale === "it"
                      ? "L'indirizzo e-mail è obbligatorio."
                      : "Die E-Mail-Adresse ist erforderlich.",
        "checkout.errors.email_invalid":
            locale === "en"
                ? "Please enter a valid email address."
                : locale === "pt"
                  ? "Introduza um e-mail válido."
                  : locale === "es"
                    ? "Introduzca un correo electrónico válido."
                    : locale === "it"
                      ? "Inserisci un indirizzo e-mail valido."
                      : "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        "checkout.errors.phone":
            locale === "en"
                ? "Phone number is required."
                : locale === "pt"
                  ? "O telefone é obrigatório."
                  : locale === "es"
                    ? "El teléfono es obligatorio."
                    : locale === "it"
                      ? "Il telefono è obbligatorio."
                      : "Die Telefonnummer ist erforderlich.",
        "checkout.errors.nationality":
            locale === "en"
                ? "Nationality is required."
                : locale === "pt"
                  ? "A nacionalidade é obrigatória."
                  : locale === "es"
                    ? "La nacionalidad es obligatoria."
                    : locale === "it"
                      ? "La nazionalità è obbligatoria."
                      : "Die Nationalität ist erforderlich.",
        "payment.steps.cart":
            locale === "en"
                ? "Cart"
                : locale === "pt"
                  ? "Carrinho"
                  : locale === "es"
                    ? "Carrito"
                    : locale === "it"
                      ? "Carrello"
                      : "Warenkorb",
        "payment.steps.information":
            locale === "en"
                ? "Details"
                : locale === "pt"
                  ? "Informações"
                  : locale === "es"
                    ? "Información"
                    : locale === "it"
                      ? "Informazioni"
                      : "Informationen",
        "payment.steps.confirmation":
            locale === "en"
                ? "Confirmation"
                : locale === "pt"
                  ? "Confirmação"
                  : locale === "es"
                    ? "Confirmación"
                    : locale === "it"
                      ? "Conferma"
                      : "Bestätigung",
        "payment.title":
            locale === "en"
                ? "Complete your booking"
                : locale === "pt"
                  ? "Finalizar a reserva"
                  : locale === "es"
                    ? "Finalizar la reserva"
                    : locale === "it"
                      ? "Completa la prenotazione"
                      : "Buchung abschließen",
        "payment.subtitle":
            locale === "en"
                ? "This step confirms the booking and saves the amount validated by the server."
                : locale === "pt"
                  ? "Este passo confirma a reserva e guarda o valor validado pelo servidor."
                  : locale === "es"
                    ? "Este paso confirma la reserva y guarda el importe validado por el servidor."
                    : locale === "it"
                      ? "Questo passaggio conferma la prenotazione e salva l’importo validato dal server."
                      : "Dieser Schritt bestätigt die Buchung und speichert den vom Server validierten Betrag.",
        "payment.summary_title":
            locale === "en"
                ? "Validation summary"
                : locale === "pt"
                  ? "Resumo de validação"
                  : locale === "es"
                    ? "Resumen de validación"
                    : locale === "it"
                      ? "Riepilogo di convalida"
                      : "Bestätigungsübersicht",
        "payment.traveler":
            locale === "en"
                ? "Traveller"
                : locale === "pt"
                  ? "Viajante"
                  : locale === "es"
                    ? "Viajero"
                    : locale === "it"
                      ? "Viaggiatore"
                      : "Reisender",
        "payment.email":
            locale === "en"
                ? "Email"
                : locale === "pt"
                  ? "E-mail"
                  : locale === "es"
                    ? "Correo electrónico"
                    : locale === "it"
                      ? "E-mail"
                      : "E-Mail",
        "payment.service":
            locale === "en"
                ? "Service"
                : locale === "pt"
                  ? "Serviço"
                  : locale === "es"
                    ? "Servicio"
                    : locale === "it"
                      ? "Servizio"
                      : "Service",
        "payment.extras": locale === "it" ? "Extra" : "Extras",
        "payment.total":
            locale === "en"
                ? "Total amount"
                : locale === "pt"
                  ? "Montante total"
                  : locale === "es"
                    ? "Importe total"
                    : locale === "it"
                      ? "Importo totale"
                      : "Gesamtbetrag",
        "payment.pay_later":
            locale === "en"
                ? "To be paid later"
                : locale === "pt"
                  ? "A pagar mais tarde"
                  : locale === "es"
                    ? "A pagar más tarde"
                    : locale === "it"
                      ? "Da pagare più tardi"
                      : "Später zu zahlen",
        "payment.pay_now":
            locale === "en"
                ? "To pay now"
                : locale === "pt"
                  ? "A pagar agora"
                  : locale === "es"
                    ? "A pagar ahora"
                    : locale === "it"
                      ? "Da pagare ora"
                      : "Jetzt zu zahlen",
        "payment.syncing":
            locale === "en"
                ? "Checking the amount with the server..."
                : locale === "pt"
                  ? "A verificar o valor com o servidor..."
                  : locale === "es"
                    ? "Comprobando el importe con el servidor..."
                    : locale === "it"
                      ? "Verifica dell’importo con il server..."
                      : "Betrag wird mit dem Server geprüft...",
        "payment.sync_error":
            locale === "en"
                ? "The amount could not be revalidated with the server."
                : locale === "pt"
                  ? "Não foi possível voltar a validar o valor com o servidor."
                  : locale === "es"
                    ? "No se pudo volver a validar el importe con el servidor."
                    : locale === "it"
                      ? "Impossibile verificare di nuovo l’importo con il server."
                      : "Der Betrag konnte nicht erneut mit dem Server geprüft werden.",
        "payment.submit_error":
            locale === "en"
                ? "The booking could not be saved. Please try again."
                : locale === "pt"
                  ? "Não foi possível registar a reserva. Tente novamente."
                  : locale === "es"
                    ? "No se pudo registrar la reserva. Inténtelo de nuevo."
                    : locale === "it"
                      ? "Impossibile registrare la prenotazione. Riprova."
                      : "Die Buchung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        "payment.back":
            locale === "en"
                ? "Back"
                : locale === "pt"
                  ? "Voltar"
                  : locale === "es"
                    ? "Volver"
                    : locale === "it"
                      ? "Indietro"
                      : "Zurück",
        "payment.confirming":
            locale === "en"
                ? "Saving..."
                : locale === "pt"
                  ? "A guardar..."
                  : locale === "es"
                    ? "Guardando..."
                    : locale === "it"
                      ? "Salvataggio..."
                      : "Speichern...",
        "payment.verifying":
            locale === "en"
                ? "Checking..."
                : locale === "pt"
                  ? "A verificar..."
                  : locale === "es"
                    ? "Verificando..."
                    : locale === "it"
                      ? "Verifica..."
                      : "Prüfung...",
        "payment.confirm":
            locale === "en"
                ? "Confirm booking"
                : locale === "pt"
                  ? "Confirmar reserva"
                  : locale === "es"
                    ? "Confirmar reserva"
                    : locale === "it"
                      ? "Conferma prenotazione"
                      : "Buchung bestätigen",
        "payment.order":
            locale === "en"
                ? "Your booking"
                : locale === "pt"
                  ? "A sua reserva"
                  : locale === "es"
                    ? "Su reserva"
                    : locale === "it"
                      ? "La tua prenotazione"
                      : "Ihre Buchung",
        "payment.customer":
            locale === "en"
                ? "Traveller"
                : locale === "pt"
                  ? "Viajante"
                  : locale === "es"
                    ? "Viajero"
                    : locale === "it"
                      ? "Viaggiatore"
                      : "Reisender",
        "payment.partner_price":
            locale === "en"
                ? "Provider price"
                : locale === "pt"
                  ? "Preço do parceiro"
                  : locale === "es"
                    ? "Precio del proveedor"
                    : locale === "it"
                      ? "Prezzo del partner"
                      : "Anbieterpreis",
        "payment.service_fee":
            locale === "en"
                ? "Service fee"
                : locale === "pt"
                  ? "Taxa de serviço"
                  : locale === "es"
                    ? "Gastos de servicio"
                    : locale === "it"
                      ? "Commissione di servizio"
                      : "Servicegebühr",
        "payment.total_vat":
            locale === "en"
                ? "Total incl. tax"
                : locale === "pt"
                  ? "Total com IVA"
                  : locale === "es"
                    ? "Total con impuestos"
                    : locale === "it"
                      ? "Totale IVA inclusa"
                      : "Gesamt inkl. MwSt.",
        "confirmation.empty":
            locale === "en"
                ? "No confirmation found for reference"
                : locale === "pt"
                  ? "Nenhuma confirmação encontrada para a referência"
                  : locale === "es"
                    ? "No se encontró ninguna confirmación para la referencia"
                    : locale === "it"
                      ? "Nessuna conferma trovata per il riferimento"
                      : "Keine Bestätigung für die Referenz gefunden",
        "confirmation.back_home":
            locale === "en"
                ? "Back to home"
                : locale === "pt"
                  ? "Voltar ao início"
                  : locale === "es"
                    ? "Volver al inicio"
                    : locale === "it"
                      ? "Torna alla home"
                      : "Zur Startseite",
        "confirmation.title":
            locale === "en"
                ? "Booking confirmed!"
                : locale === "pt"
                  ? "Reserva confirmada!"
                  : locale === "es"
                    ? "¡Reserva confirmada!"
                    : locale === "it"
                      ? "Prenotazione confermata!"
                      : "Buchung bestätigt!",
        "confirmation.subtitle":
            locale === "en"
                ? "Your booking has been successfully recorded. A summary will be sent to"
                : locale === "pt"
                  ? "A sua reserva foi registada com sucesso. Um resumo será enviado para"
                  : locale === "es"
                    ? "Su reserva se ha registrado correctamente. Se enviará un resumen a"
                    : locale === "it"
                      ? "La tua prenotazione è stata registrata con successo. Un riepilogo sarà inviato a"
                      : "Ihre Buchung wurde erfolgreich registriert. Eine Zusammenfassung wird gesendet an",
        "confirmation.reference":
            locale === "en"
                ? "Reference"
                : locale === "pt"
                  ? "Referência"
                  : locale === "es"
                    ? "Referencia"
                    : locale === "it"
                      ? "Riferimento"
                      : "Referenz",
        "confirmation.stay":
            locale === "en"
                ? "Your stay"
                : locale === "pt"
                  ? "A sua estadia"
                  : locale === "es"
                    ? "Su estancia"
                    : locale === "it"
                      ? "Il tuo soggiorno"
                      : "Ihr Aufenthalt",
        "confirmation.start_date":
            locale === "en"
                ? "Start date"
                : locale === "pt"
                  ? "Data de início"
                  : locale === "es"
                    ? "Fecha de inicio"
                    : locale === "it"
                      ? "Data di inizio"
                      : "Startdatum",
        "confirmation.end_date":
            locale === "en"
                ? "End date"
                : locale === "pt"
                  ? "Data de fim"
                  : locale === "es"
                    ? "Fecha de fin"
                    : locale === "it"
                      ? "Data di fine"
                      : "Enddatum",
        "confirmation.slot":
            locale === "en"
                ? "Time slot"
                : locale === "pt"
                  ? "Horário"
                  : locale === "es"
                    ? "Horario"
                    : locale === "it"
                      ? "Fascia oraria"
                      : "Zeitfenster",
        "confirmation.participants":
            locale === "en"
                ? "Participants"
                : locale === "pt"
                  ? "Participantes"
                  : locale === "es"
                    ? "Participantes"
                    : locale === "it"
                      ? "Partecipanti"
                      : "Teilnehmer",
        "confirmation.participant":
            locale === "en"
                ? "participant"
                : locale === "pt"
                  ? "participante"
                  : locale === "es"
                    ? "participante"
                    : locale === "it"
                      ? "partecipante"
                      : "Teilnehmer",
        "confirmation.participants_plural":
            locale === "en"
                ? "participants"
                : locale === "pt"
                  ? "participantes"
                  : locale === "es"
                    ? "participantes"
                    : locale === "it"
                      ? "partecipanti"
                      : "Teilnehmer",
        "confirmation.nights":
            locale === "en"
                ? "Nights"
                : locale === "pt"
                  ? "Noites"
                  : locale === "es"
                    ? "Noches"
                    : locale === "it"
                      ? "Notti"
                      : "Nächte",
        "confirmation.days":
            locale === "en"
                ? "Days"
                : locale === "pt"
                  ? "Dias"
                  : locale === "es"
                    ? "Días"
                    : locale === "it"
                      ? "Giorni"
                      : "Tage",
        "confirmation.traveler":
            locale === "en"
                ? "Main traveller"
                : locale === "pt"
                  ? "Viajante principal"
                  : locale === "es"
                    ? "Viajero principal"
                    : locale === "it"
                      ? "Viaggiatore principale"
                      : "Hauptreisender",
        "confirmation.full_name":
            locale === "en"
                ? "Full name"
                : locale === "pt"
                  ? "Nome completo"
                  : locale === "es"
                    ? "Nombre completo"
                    : locale === "it"
                      ? "Nome completo"
                      : "Vollständiger Name",
        "confirmation.email":
            locale === "en"
                ? "Email"
                : locale === "pt"
                  ? "E-mail"
                  : locale === "es"
                    ? "Correo electrónico"
                    : locale === "it"
                      ? "E-mail"
                      : "E-Mail",
        "confirmation.phone":
            locale === "en"
                ? "Phone"
                : locale === "pt"
                  ? "Telefone"
                  : locale === "es"
                    ? "Teléfono"
                    : locale === "it"
                      ? "Telefono"
                      : "Telefon",
        "confirmation.nationality":
            locale === "en"
                ? "Nationality"
                : locale === "pt"
                  ? "Nacionalidade"
                  : locale === "es"
                    ? "Nacionalidad"
                    : locale === "it"
                      ? "Nazionalità"
                      : "Nationalität",
        "confirmation.requests":
            locale === "en"
                ? "Special requests"
                : locale === "pt"
                  ? "Pedidos especiais"
                  : locale === "es"
                    ? "Solicitudes especiales"
                    : locale === "it"
                      ? "Richieste speciali"
                      : "Besondere Wünsche",
        "confirmation.payment_summary":
            locale === "en"
                ? "Payment summary"
                : locale === "pt"
                  ? "Resumo do pagamento"
                  : locale === "es"
                    ? "Resumen del pago"
                    : locale === "it"
                      ? "Riepilogo del pagamento"
                      : "Zahlungsübersicht",
        "confirmation.partner_price":
            locale === "en"
                ? "Provider price"
                : locale === "pt"
                  ? "Preço do parceiro"
                  : locale === "es"
                    ? "Precio del proveedor"
                    : locale === "it"
                      ? "Prezzo del partner"
                      : "Anbieterpreis",
        "confirmation.service_fee":
            locale === "en"
                ? "Service fee"
                : locale === "pt"
                  ? "Taxa de serviço"
                  : locale === "es"
                    ? "Gastos de servicio"
                    : locale === "it"
                      ? "Commissione di servizio"
                      : "Servicegebühr",
        "confirmation.total":
            locale === "en"
                ? "Total incl. tax"
                : locale === "pt"
                  ? "Total com IVA"
                  : locale === "es"
                    ? "Total con impuestos"
                    : locale === "it"
                      ? "Totale IVA inclusa"
                      : "Gesamt inkl. MwSt.",
        "confirmation.paid_online":
            locale === "en"
                ? "Paid online"
                : locale === "pt"
                  ? "Pago online"
                  : locale === "es"
                    ? "Pagado online"
                    : locale === "it"
                      ? "Pagato online"
                      : "Online bezahlt",
        "confirmation.pay_onsite":
            locale === "en"
                ? "To pay on site"
                : locale === "pt"
                  ? "A pagar no local"
                  : locale === "es"
                    ? "A pagar en el lugar"
                    : locale === "it"
                      ? "Da pagare sul posto"
                      : "Vor Ort zu zahlen",
        "confirmation.cash_guaranteed":
            locale === "en"
                ? "Booking guaranteed — Pay on site"
                : locale === "pt"
                  ? "Reserva garantida — Pagamento no local"
                  : locale === "es"
                    ? "Reserva garantizada — Pago en el lugar"
                    : locale === "it"
                      ? "Prenotazione garantita — Pagamento sul posto"
                      : "Buchung garantiert — Zahlung vor Ort",
        "confirmation.commission_paid":
            locale === "en"
                ? "Commission paid online"
                : locale === "pt"
                  ? "Comissão paga online"
                  : locale === "es"
                    ? "Comisión pagada online"
                    : locale === "it"
                      ? "Commissione pagata online"
                      : "Provision online bezahlt",
        "confirmation.payment_received":
            locale === "en"
                ? "Payment received"
                : locale === "pt"
                  ? "Pagamento recebido"
                  : locale === "es"
                    ? "Pago recibido"
                    : locale === "it"
                      ? "Pagamento ricevuto"
                      : "Zahlung erhalten",
        "confirmation.next_steps":
            locale === "en"
                ? "Next steps"
                : locale === "pt"
                  ? "Próximos passos"
                  : locale === "es"
                    ? "Próximos pasos"
                    : locale === "it"
                      ? "Prossimi passi"
                      : "Nächste Schritte",
        "confirmation.next1_title":
            locale === "en"
                ? "Email confirmation"
                : locale === "pt"
                  ? "Confirmação por e-mail"
                  : locale === "es"
                    ? "Confirmación por correo"
                    : locale === "it"
                      ? "Conferma via e-mail"
                      : "E-Mail-Bestätigung",
        "confirmation.next1_desc":
            locale === "en"
                ? "A full summary will be sent to your email address within a few minutes."
                : locale === "pt"
                  ? "Um resumo completo será enviado para o seu e-mail dentro de alguns minutos."
                  : locale === "es"
                    ? "Se enviará un resumen completo a su correo electrónico en unos minutos."
                    : locale === "it"
                      ? "Un riepilogo completo sarà inviato al tuo indirizzo e-mail entro pochi minuti."
                      : "Eine vollständige Zusammenfassung wird innerhalb weniger Minuten an Ihre E-Mail-Adresse gesendet.",
        "confirmation.next2_title":
            locale === "en"
                ? "Provider follow-up"
                : locale === "pt"
                  ? "Contacto do parceiro"
                  : locale === "es"
                    ? "Contacto del proveedor"
                    : locale === "it"
                      ? "Contatto del partner"
                      : "Kontakt durch den Anbieter",
        "confirmation.next2_desc":
            locale === "en"
                ? "The provider will contact you within 24 hours to finalise the logistics."
                : locale === "pt"
                  ? "O parceiro entrará em contacto consigo em 24 horas para finalizar os detalhes."
                  : locale === "es"
                    ? "El proveedor se pondrá en contacto con usted en 24 horas para finalizar la logística."
                    : locale === "it"
                      ? "Il partner ti contatterà entro 24 ore per definire i dettagli logistici."
                      : "Der Anbieter wird Sie innerhalb von 24 Stunden kontaktieren, um die Details abzustimmen.",
        "confirmation.next3_title":
            locale === "en"
                ? "Enjoy your experience"
                : locale === "pt"
                  ? "Aproveite a experiência"
                  : locale === "es"
                    ? "Disfrute de la experiencia"
                    : locale === "it"
                      ? "Goditi l’esperienza"
                      : "Genießen Sie Ihr Erlebnis",
        "confirmation.next3_desc":
            locale === "en"
                ? "All that is left is to get ready for your trip."
                : locale === "pt"
                  ? "Só falta preparar as malas."
                  : locale === "es"
                    ? "Solo queda preparar las maletas."
                    : locale === "it"
                      ? "Non resta che preparare i bagagli."
                      : "Jetzt müssen Sie nur noch Ihre Koffer packen.",
        "confirmation.discover_more":
            locale === "en"
                ? "Discover more activities"
                : locale === "pt"
                  ? "Descobrir mais atividades"
                  : locale === "es"
                    ? "Descubrir más actividades"
                    : locale === "it"
                      ? "Scopri altre attività"
                      : "Weitere Aktivitäten entdecken",
        ...buildFareHarborTranslations(locale),
    };
}

export function useTranslation() {
    const { props, url } = usePage<{
        locale?: Locale;
        supportedLocales?: Locale[];
        fallbackLocale?: Locale;
    }>();
    const locale = props.locale || FALLBACK_LOCALE;
    const { t: rawTranslate, i18n: i18nInstance } = useI18nextTranslation();

    useEffect(() => {
        if (i18nInstance.language !== locale) {
            void i18nInstance.changeLanguage(locale);
        }

        document.documentElement.lang = locale;
        window.localStorage.setItem("wandireo-locale", locale);
    }, [i18nInstance, locale]);

    const t = useCallback(
        (key: string): string => {
            const fallbackLocale = props.fallbackLocale || FALLBACK_LOCALE;

            return rawTranslate(key, {
                defaultValue:
                    translations[locale]?.[key] ??
                    translations[fallbackLocale]?.[key] ??
                    translations.fr[key] ??
                    key,
            });
        },
        [locale, props.fallbackLocale, rawTranslate],
    );

    const setLocale = (newLocale: Locale) => {
        const targetLocale = normalizeLocale(newLocale) ?? FALLBACK_LOCALE;
        const maxAge = 365 * 24 * 60 * 60;

        document.cookie = `locale=${targetLocale};path=/;max-age=${maxAge};SameSite=Lax`;
        window.localStorage.setItem("wandireo-locale", targetLocale);
        window.location.assign(withLocale(url, targetLocale));
    };

    return {
        t,
        locale,
        intlLocale: INTL_LOCALES[locale],
        setLocale,
    };
}

if (!i18n.isInitialized) {
    void i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources: i18nResources,
            lng: FALLBACK_LOCALE,
            fallbackLng: FALLBACK_LOCALE,
            supportedLngs: Object.keys(i18nResources),
            interpolation: {
                escapeValue: false,
            },
            detection: {
                order: ["htmlTag", "cookie", "localStorage", "navigator"],
                caches: ["localStorage", "cookie"],
                lookupCookie: "locale",
                lookupLocalStorage: "wandireo-locale",
            },
        });
}
