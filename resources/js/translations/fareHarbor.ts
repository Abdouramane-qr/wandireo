import type { Locale } from "@/lib/locale";

export function buildFareHarborTranslations(
    locale: Locale,
): Record<string, string> {
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
                "service.external_price_not_provided":
                    "O parceiro não comunicou o preço total desta atividade.",
                "service.external_deposit_required":
                    "Caução de {amount} exigida",
                "service.external_deposit_only_summary":
                    "Preço total não comunicado. Caução de {amount} exigida.",
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
                "admin.services.fareharbor.toast.partner_created":
                    "Conta de parceiro criada para {name}:",
                "admin.services.fareharbor.toast.partner_error":
                    "Não foi possível criar a conta de parceiro FareHarbor.",
                "admin.services.fareharbor.status.idle": "Em espera",
                "admin.services.fareharbor.status.syncing": "Sincronizando",
                "admin.services.fareharbor.status.success": "Sucesso",
                "admin.services.fareharbor.status.failed": "Falhou",
                "admin.services.fareharbor.partner_summary": "Parceiro: {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "Nenhum parceiro atribuído",
                "admin.services.fareharbor.partner_no_account":
                    "Sem conta de parceiro",
                "admin.services.fareharbor.partner_create_with_company":
                    "Criar a conta de parceiro ao mesmo tempo",
                "admin.services.fareharbor.partner_label": "Conta de parceiro",
                "admin.services.fareharbor.partner_create":
                    "Criar a conta de parceiro",
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
                "service.external_price_not_provided":
                    "The partner did not provide the total price for this activity.",
                "service.external_deposit_required":
                    "Deposit of {amount} required",
                "service.external_deposit_only_summary":
                    "Total price not provided. Deposit of {amount} required.",
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
                "admin.services.fareharbor.toast.partner_created":
                    "Partner account created for {name}:",
                "admin.services.fareharbor.toast.partner_error":
                    "Unable to create the FareHarbor partner account.",
                "admin.services.fareharbor.status.idle": "Idle",
                "admin.services.fareharbor.status.syncing": "Syncing",
                "admin.services.fareharbor.status.success": "Success",
                "admin.services.fareharbor.status.failed": "Failed",
                "admin.services.fareharbor.partner_summary": "Partner: {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "No partner assigned",
                "admin.services.fareharbor.partner_no_account":
                    "No partner account",
                "admin.services.fareharbor.partner_create_with_company":
                    "Create the partner account at the same time",
                "admin.services.fareharbor.partner_label": "Partner account",
                "admin.services.fareharbor.partner_create":
                    "Create the partner account",
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
                "service.external_price_not_provided":
                    "El socio no comunicó el precio total de esta actividad.",
                "service.external_deposit_required":
                    "Depósito de {amount} requerido",
                "service.external_deposit_only_summary":
                    "Precio total no comunicado. Depósito de {amount} requerido.",
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
                "admin.services.fareharbor.toast.partner_created":
                    "Cuenta de socio creada para {name}:",
                "admin.services.fareharbor.toast.partner_error":
                    "No se pudo crear la cuenta de socio de FareHarbor.",
                "admin.services.fareharbor.status.idle": "En espera",
                "admin.services.fareharbor.status.syncing": "Sincronizando",
                "admin.services.fareharbor.status.success": "Éxito",
                "admin.services.fareharbor.status.failed": "Falló",
                "admin.services.fareharbor.partner_summary": "Socio: {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "Ningún socio asignado",
                "admin.services.fareharbor.partner_no_account":
                    "Sin cuenta de socio",
                "admin.services.fareharbor.partner_create_with_company":
                    "Crear la cuenta de socio al mismo tiempo",
                "admin.services.fareharbor.partner_label": "Cuenta de socio",
                "admin.services.fareharbor.partner_create":
                    "Crear la cuenta de socio",
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
                "service.external_price_not_provided":
                    "Il partner non ha comunicato il prezzo totale di questa attività.",
                "service.external_deposit_required":
                    "Deposito di {amount} richiesto",
                "service.external_deposit_only_summary":
                    "Prezzo totale non comunicato. Deposito di {amount} richiesto.",
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
                "admin.services.fareharbor.items_count": "{count} elemento(i)",
                "admin.services.fareharbor.last_sync":
                    "Ultima sincronizzazione:",
                "admin.services.fareharbor.never_synced": "Mai sincronizzato",
                "admin.services.fareharbor.enabled": "Attivo",
                "admin.services.fareharbor.sync_items": "Sincronizza elementi",
                "admin.services.fareharbor.sync_details":
                    "Sincronizza dettagli",
                "admin.services.fareharbor.sync": "Sincronizza",
                "admin.services.fareharbor.toast.required":
                    "Il nome e lo slug FareHarbor sono obbligatori.",
                "admin.services.fareharbor.toast.created":
                    "Azienda FareHarbor aggiunta.",
                "admin.services.fareharbor.toast.create_error":
                    "Impossibile aggiungere l’azienda FareHarbor.",
                "admin.services.fareharbor.toast.updated":
                    "Configurazione FareHarbor aggiornata.",
                "admin.services.fareharbor.toast.update_error":
                    "Aggiornamento FareHarbor non riuscito.",
                "admin.services.fareharbor.toast.sync_success":
                    "Sincronizzazione avviata per {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "Sincronizzazione non riuscita per {name}.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Sincronizzazione globale FareHarbor completata.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "Sincronizzazione globale FareHarbor non riuscita.",
                "admin.services.fareharbor.toast.partner_created":
                    "Account partner creato per {name}:",
                "admin.services.fareharbor.toast.partner_error":
                    "Impossibile creare l'account partner FareHarbor.",
                "admin.services.fareharbor.status.idle": "In attesa",
                "admin.services.fareharbor.status.syncing": "Sincronizzazione",
                "admin.services.fareharbor.status.success": "Successo",
                "admin.services.fareharbor.status.failed": "Non riuscito",
                "admin.services.fareharbor.partner_summary": "Partner: {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "Nessun partner assegnato",
                "admin.services.fareharbor.partner_no_account":
                    "Nessun account partner",
                "admin.services.fareharbor.partner_create_with_company":
                    "Crea contemporaneamente l'account partner",
                "admin.services.fareharbor.partner_label": "Account partner",
                "admin.services.fareharbor.partner_create":
                    "Crea l'account partner",
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
                "service.external_realtime": "Verfügbarkeit in Echtzeit.",
                "service.external_price_label": "Preis",
                "service.external_price_total_label":
                    "Gesamtpreis vom Partner mitgeteilt",
                "service.external_price_total_unknown":
                    "Gesamtpreis nicht mitgeteilt",
                "service.external_price_not_provided":
                    "Der Partner hat den Gesamtpreis für diese Aktivität nicht mitgeteilt.",
                "service.external_deposit_required":
                    "Anzahlung von {amount} erforderlich",
                "service.external_deposit_only_summary":
                    "Gesamtpreis nicht mitgeteilt. Anzahlung von {amount} erforderlich.",
                "service.external_commission_guaranteed":
                    "Die Wandireo-Provision bleibt garantiert.",
                "service.external_price_confirmed_partner":
                    "Der endgültige Betrag wird vor der Buchungsbestätigung mitgeteilt.",
                "service.external_price_unavailable": "Preis auf Anfrage",
                "admin.services.fareharbor.eyebrow": "Externe Integration",
                "admin.services.fareharbor.subtitle":
                    "{companies} Unternehmen verfolgt, {services} Service(s) importiert.",
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
                    "Keine FareHarbor-Unternehmen konfiguriert.",
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
                    "FareHarbor-Unternehmen hinzugefügt.",
                "admin.services.fareharbor.toast.create_error":
                    "FareHarbor-Unternehmen konnte nicht hinzugefügt werden.",
                "admin.services.fareharbor.toast.updated":
                    "FareHarbor-Konfiguration aktualisiert.",
                "admin.services.fareharbor.toast.update_error":
                    "FareHarbor-Aktualisierung fehlgeschlagen.",
                "admin.services.fareharbor.toast.sync_success":
                    "Synchronisierung für {name} gestartet.",
                "admin.services.fareharbor.toast.sync_error":
                    "Synchronisierung für {name} fehlgeschlagen.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Globale FareHarbor-Synchronisierung abgeschlossen.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "Globale FareHarbor-Synchronisierung fehlgeschlagen.",
                "admin.services.fareharbor.toast.partner_created":
                    "Partnerkonto erstellt für {name}:",
                "admin.services.fareharbor.toast.partner_error":
                    "Das FareHarbor-Partnerkonto konnte nicht erstellt werden.",
                "admin.services.fareharbor.status.idle": "Leerlauf",
                "admin.services.fareharbor.status.syncing": "Synchronisiert",
                "admin.services.fareharbor.status.success": "Erfolg",
                "admin.services.fareharbor.status.failed": "Fehlgeschlagen",
                "admin.services.fareharbor.partner_summary": "Partner: {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "Kein Partner zugewiesen",
                "admin.services.fareharbor.partner_no_account":
                    "Kein Partnerkonto",
                "admin.services.fareharbor.partner_create_with_company":
                    "Partnerkonto gleichzeitig erstellen",
                "admin.services.fareharbor.partner_label": "Partnerkonto",
                "admin.services.fareharbor.partner_create":
                    "Partnerkonto erstellen",
            };
        case "fr":
        default:
            return {
                "service.external_badge": "Disponibilité en direct",
                "service.external_powered_by": "Réservation sur Wandireo",
                "service.external_title": "Réservation disponible sur Wandireo",
                "service.external_desc":
                    "La disponibilité est synchronisée en temps réel pour cette activité.",
                "service.external_cta": "Réserver",
                "service.external_note":
                    "La disponibilité affichée est synchronisée en temps réel.",
                "service.external_realtime": "Disponibilité en temps réel.",
                "service.external_price_label": "Prix",
                "service.external_price_total_label":
                    "Prix total communiqué par le partenaire",
                "service.external_price_total_unknown": "Total non communiqué",
                "service.external_price_not_provided":
                    "Le partenaire n’a pas communiqué le prix total de cette activité.",
                "service.external_deposit_required":
                    "Caution de {amount} requise",
                "service.external_deposit_only_summary":
                    "Prix total non communiqué. Caution de {amount} requise.",
                "service.external_commission_guaranteed":
                    "La commission Wandireo reste garantie.",
                "service.external_price_confirmed_partner":
                    "Le montant final est communiqué avant la validation de la réservation.",
                "service.external_price_unavailable": "Prix sur demande",
                "admin.services.fareharbor.eyebrow": "Intégration externe",
                "admin.services.fareharbor.subtitle":
                    "{companies} entreprise(s) suivie(s), {services} service(s) importé(s).",
                "admin.services.fareharbor.sync_all": "Tout synchroniser",
                "admin.services.fareharbor.display_name_placeholder":
                    "Nom affiché",
                "admin.services.fareharbor.slug_placeholder": "company-slug",
                "admin.services.fareharbor.items": "Éléments",
                "admin.services.fareharbor.details": "Détails",
                "admin.services.fareharbor.add": "Ajouter",
                "admin.services.fareharbor.loading":
                    "Chargement de la configuration FareHarbor...",
                "admin.services.fareharbor.empty":
                    "Aucune entreprise FareHarbor configurée.",
                "admin.services.fareharbor.items_count": "{count} élément(s)",
                "admin.services.fareharbor.last_sync":
                    "Dernière synchronisation :",
                "admin.services.fareharbor.never_synced": "Jamais synchronisé",
                "admin.services.fareharbor.enabled": "Actif",
                "admin.services.fareharbor.sync_items":
                    "Synchroniser les éléments",
                "admin.services.fareharbor.sync_details":
                    "Synchroniser les détails",
                "admin.services.fareharbor.sync": "Synchroniser",
                "admin.services.fareharbor.toast.required":
                    "Le nom et le slug FareHarbor sont obligatoires.",
                "admin.services.fareharbor.toast.created":
                    "Entreprise FareHarbor ajoutée.",
                "admin.services.fareharbor.toast.create_error":
                    "Impossible d’ajouter l’entreprise FareHarbor.",
                "admin.services.fareharbor.toast.updated":
                    "Configuration FareHarbor mise à jour.",
                "admin.services.fareharbor.toast.update_error":
                    "La mise à jour FareHarbor a échoué.",
                "admin.services.fareharbor.toast.sync_success":
                    "Synchronisation lancée pour {name}.",
                "admin.services.fareharbor.toast.sync_error":
                    "La synchronisation de {name} a échoué.",
                "admin.services.fareharbor.toast.sync_all_success":
                    "Synchronisation globale FareHarbor terminée.",
                "admin.services.fareharbor.toast.sync_all_error":
                    "La synchronisation globale FareHarbor a échoué.",
                "admin.services.fareharbor.toast.partner_created":
                    "Compte partenaire créé pour {name} :",
                "admin.services.fareharbor.toast.partner_error":
                    "Impossible de créer le compte partenaire FareHarbor.",
                "admin.services.fareharbor.status.idle": "En attente",
                "admin.services.fareharbor.status.syncing": "Synchronisation",
                "admin.services.fareharbor.status.success": "Succès",
                "admin.services.fareharbor.status.failed": "Échec",
                "admin.services.fareharbor.partner_summary":
                    "Partenaire : {name}",
                "admin.services.fareharbor.partner_none_assigned":
                    "Aucun partenaire assigné",
                "admin.services.fareharbor.partner_no_account":
                    "Aucun compte partenaire",
                "admin.services.fareharbor.partner_create_with_company":
                    "Créer le compte partenaire en même temps",
                "admin.services.fareharbor.partner_label": "Compte partenaire",
                "admin.services.fareharbor.partner_create":
                    "Créer le compte partenaire",
            };
    }
}
