export function buildPartnerItTranslations(): Record<string, string> {
    return {
        "partner.dashboard.stats": "Statistiche generali",
        "partner.dashboard.revenue_total": "Ricavo totale",
        "partner.dashboard.revenue_month": "Ricavo del mese",
        "partner.dashboard.bookings_month_one": "Prenotazione questo mese",
        "partner.dashboard.bookings_month_other":
            "Prenotazioni questo mese",
        "partner.dashboard.pending_one": "prenotazione in attesa",
        "partner.dashboard.pending_other": "prenotazioni in attesa",
        "partner.dashboard.catalog": "Il mio catalogo",
        "partner.dashboard.reservations": "Le mie prenotazioni",
        "partner.dashboard.management": "Gestione",
        "partner.dashboard.recent": "Attivita recenti",
        "partner.dashboard.see_all": "Vedi tutto",
        "partner.dashboard.shortcuts": "Scorciatoie",
        "partner.dashboard.empty": "Nessun dato da mostrare al momento.",
        "partner.dashboard.up_to_date": "Tutto e aggiornato.",
        "partner.dashboard.member_since": "Partner dal {date}",

        "partner.profile.title": "Profilo partner",
        "partner.profile.since": "Partner dal",
        "partner.profile.commission": "Tasso di commissione",
        "partner.profile.rating": "Valutazione media",
        "partner.profile.sales": "Vendite totali",
        "partner.profile.catalog_title": "Catalogo servizi",
        "partner.profile.catalog_manage": "Gestisci il catalogo",
        "partner.profile.add_service": "Aggiungi un servizio",
        "partner.profile.first_service":
            "Crea il tuo primo servizio per iniziare.",
        "partner.profile.empty": "Nessun servizio attivo al momento.",

        "partner.pending.title.pending": "Domanda in fase di revisione",
        "partner.pending.title.approved": "Account attivato!",
        "partner.pending.title.rejected": "Domanda rifiutata",
        "partner.pending.title.suspended": "Account sospeso",
        "partner.pending.message.pending":
            "La tua domanda e attualmente in revisione da parte del nostro team. Ti contatteremo molto presto.",
        "partner.pending.message.approved":
            "Il tuo account e stato convalidato. Ora puoi accedere alla tua dashboard.",
        "partner.pending.message.rejected":
            "Purtroppo la tua domanda non e stata accettata.",
        "partner.pending.message.rejected_with_reason":
            "La tua domanda e stata rifiutata per il seguente motivo: {reason}",
        "partner.pending.message.suspended":
            "Il tuo account e stato sospeso temporaneamente. Contatta il supporto.",
        "partner.pending.admin_validation": "Convalida amministratore",
        "partner.pending.contract_status": "Stato del contratto",
        "partner.pending.account_status": "Stato dell'account",
        "partner.pending.contract_signature": "Firma del contratto",
        "partner.pending.download_contract": "Scarica il contratto",
        "partner.pending.open_dashboard": "Accedi alla dashboard",
        "partner.pending.back_home": "Torna alla home",
        "partner.pending.company": "Azienda",
        "partner.pending.contact": "Contatto principale",
        "partner.pending.date_missing": "Non indicato",
        "partner.pending.status.account.pending": "In attesa",
        "partner.pending.status.account.approved": "Approvato",
        "partner.pending.status.account.rejected": "Rifiutato",
        "partner.pending.status.account.suspended": "Sospeso",
        "partner.pending.status.contract.not_sent": "Non inviato",
        "partner.pending.status.contract.pending_signature":
            "Firma in attesa",
        "partner.pending.status.contract.signed": "Firmato",
        "partner.pending.status.contract.rejected": "Rifiutato",

        "partner.bookings.title": "Gestione prenotazioni",
        "partner.bookings.back_dashboard": "Torna alla dashboard",
        "partner.bookings.tabs_aria": "Filtri prenotazioni",
        "partner.bookings.tab.all": "Tutte",
        "partner.bookings.tab.pending": "Da confermare",
        "partner.bookings.tab.confirmed": "Confermate",
        "partner.bookings.tab.cancelled": "Annullate",
        "partner.bookings.count_one": "prenotazione trovata",
        "partner.bookings.count_other": "prenotazioni trovate",
        "partner.bookings.empty_status": "Nessuna prenotazione {status}.",
        "partner.bookings.empty_prefix": "Non hai prenotazioni",
        "partner.bookings.empty_suffix": "al momento.",
        "partner.bookings.status.pending": "In attesa",
        "partner.bookings.status.confirmed": "Confermata",
        "partner.bookings.status.cancelled": "Annullata",
        "partner.bookings.accept": "Conferma",
        "partner.bookings.reject": "Rifiuta",
        "partner.bookings.toast.confirm_success":
            "Prenotazione confermata con successo.",
        "partner.bookings.toast.confirm_error":
            "Errore durante la conferma.",
        "partner.bookings.toast.reject_success": "Prenotazione rifiutata.",
        "partner.bookings.toast.reject_error":
            "Errore durante il rifiuto.",

        "partner.bookings.reject_modal.title": "Rifiuta prenotazione",
        "partner.bookings.reject_modal.description":
            "Indica il motivo del rifiuto (indisponibilita, problema tecnico, ecc.). Il cliente ne verra informato.",
        "partner.bookings.reject_modal.submit": "Conferma il rifiuto",
        "partner.bookings.reject_modal.cancel": "Annulla",
        "partner.bookings.reject_modal.submitting": "Elaborazione...",
        "partner.bookings.reject_modal.error": "Inserisci un motivo.",

        "partner.catalog.page_title": "Il mio catalogo",
        "partner.catalog.page_subtitle":
            "Gestisci le tue offerte, i prezzi e la disponibilita in tempo reale.",
        "partner.catalog.back_dashboard": "Torna alla dashboard",
        "partner.catalog.action.add_service": "Aggiungi un'offerta",
        "partner.catalog.action.edit": "Modifica",
        "partner.catalog.action.delete": "Elimina",
        "partner.catalog.action.enable": "Attiva",
        "partner.catalog.action.create": "Crea offerta",
        "partner.catalog.action.save": "Salva le modifiche",
        "partner.catalog.action.cancel": "Annulla",
        "partner.catalog.empty.title": "Il tuo catalogo e vuoto",
        "partner.catalog.empty.subtitle":
            "Inizia aggiungendo la tua prima attivita, barca o alloggio per ricevere le prime prenotazioni.",

        "partner.catalog.category.activity": "Attivita",
        "partner.catalog.category.boat": "Barca",
        "partner.catalog.category.car": "Auto",
        "partner.catalog.category.stay": "Alloggio",

        "partner.catalog.section.general": "Informazioni generali",
        "partner.catalog.section.location": "Localizzazione",
        "partner.catalog.section.pricing": "Prezzi e pagamento",
        "partner.catalog.section.availability": "Disponibilita",
        "partner.catalog.section.activity": "Dettagli attivita",
        "partner.catalog.section.boat": "Dettagli barca",
        "partner.catalog.section.car": "Dettagli veicolo",
        "partner.catalog.section.stay": "Dettagli alloggio",

        "partner.catalog.field.title": "Titolo dell'offerta",
        "partner.catalog.field.category": "Categoria",
        "partner.catalog.field.description": "Descrizione dettagliata",
        "partner.catalog.field.country": "Paese",
        "partner.catalog.field.region": "Regione",
        "partner.catalog.field.city": "Citta",
        "partner.catalog.field.meeting_point": "Punto di incontro / Indirizzo",
        "partner.catalog.field.partner_price": "Prezzo partner (netto)",
        "partner.catalog.field.pricing_unit": "Unita di prezzo",
        "partner.catalog.field.payment_mode": "Modalita di pagamento",
        "partner.catalog.field.currency": "Valuta",
        "partner.catalog.currency.eur": "EUR - Euro",
        "partner.catalog.currency.usd": "USD - Dollaro USA",
        "partner.catalog.currency.gbp": "GBP - Sterlina britannica",
        "partner.catalog.field.available": "Disponibile",
        "partner.catalog.field.min_age": "Eta minima",
        "partner.catalog.field.max_guests": "Capacita massima",
        "partner.catalog.field.duration": "Durata",
        "partner.catalog.field.languages": "Lingue parlate",
        "partner.catalog.field.included": "Incluso nel prezzo",
        "partner.catalog.field.not_included": "Non incluso",
        "partner.catalog.field.tags": "Tag / Parole chiave",
        "partner.catalog.field.house_rules": "Regole della casa",
        "partner.catalog.field.license_required": "Patente richiesta",
        "partner.catalog.field.license_type": "Tipo di patente",

        "partner.catalog.field.brand": "Marca",
        "partner.catalog.field.model": "Modello",
        "partner.catalog.field.year": "Anno",
        "partner.catalog.field.seats": "Numero di posti",
        "partner.catalog.field.doors": "Numero di porte",
        "partner.catalog.field.small_bags": "Bagagli piccoli",
        "partner.catalog.field.bedrooms": "Camere",
        "partner.catalog.field.pets_allowed": "Animali ammessi",
        "partner.catalog.field.smoking_allowed": "Fumatori ammessi",
        "partner.catalog.field.air_conditioning": "Aria condizionata",
        "partner.catalog.field.boat_name": "Nome della barca",
        "partner.catalog.field.boat_cabins": "Cabine",
        "partner.catalog.field.boat_amenities": "Dotazioni di bordo",
        "partner.catalog.field.engine_power_kw": "Potenza motore (kW)",
        "partner.catalog.field.fuel_included": "Carburante incluso",
        "partner.catalog.field.full_insurance": "Assicurazione completa",
        "partner.catalog.field.deposit_eur": "Cauzione (EUR)",
        "partner.catalog.field.day_charter": "Noleggio giornaliero",
        "partner.catalog.field.week_charter": "Noleggio settimanale",

        "partner.catalog.placeholder.title":
            "Es: Escursione alle grotte di Benagil",
        "partner.catalog.placeholder.country": "Portogallo",
        "partner.catalog.placeholder.region": "Algarve",
        "partner.catalog.placeholder.city": "Albufeira",
        "partner.catalog.placeholder.tags": "grotte, delfini, famiglia...",

        "partner.catalog.pricing_unit.person": "per persona",
        "partner.catalog.pricing_unit.group": "per gruppo",
        "partner.catalog.pricing_unit.night": "per notte",
        "partner.catalog.pricing_unit.day": "per giorno",
        "partner.catalog.pricing_unit.week": "per settimana",
        "partner.catalog.pricing_unit.half_day": "per mezza giornata",

        "partner.catalog.payment_mode.full_online":
            "Pagamento 100% online",
        "partner.catalog.payment_mode.commission_online":
            "Commissione online, saldo in loco",
        "partner.catalog.payment_mode.on_site":
            "Pagamento completo in loco",
        "partner.catalog.payment_mode.connected_account":
            "Account Stripe collegato",

        "partner.catalog.boat_type.catamaran": "Catamarano",
        "partner.catalog.boat_type.motor_yacht": "Motor yacht",
        "partner.catalog.boat_type.sailboat": "Barca a vela",
        "partner.catalog.boat_type.rib": "Gommone",
        "partner.catalog.boat_type.schooner": "Goletta",
        "partner.catalog.boat_type.barge": "Chiattа",

        "partner.catalog.rental_mode.with_skipper": "Con skipper",
        "partner.catalog.rental_mode.without_skipper": "Senza skipper",
        "partner.catalog.rental_mode.bareboat": "Bareboat",
        "partner.catalog.rental_mode.full_crew": "Equipaggio completo",

        "partner.catalog.vehicle_type.city_car": "City car",
        "partner.catalog.vehicle_type.sedan": "Berlina",
        "partner.catalog.vehicle_type.suv": "SUV",
        "partner.catalog.vehicle_type.convertible": "Cabriolet",
        "partner.catalog.vehicle_type.minivan": "Minivan",
        "partner.catalog.vehicle_type.utility": "Veicolo commerciale",
        "partner.catalog.vehicle_type.quad": "Quad / Buggy",
        "partner.catalog.vehicle_type.scooter_125": "Scooter 125cc",

        "partner.catalog.stay_type.villa": "Villa",
        "partner.catalog.stay_type.apartment": "Appartamento",
        "partner.catalog.stay_type.guest_house": "Guest house",
        "partner.catalog.stay_type.hotel": "Hotel",
        "partner.catalog.stay_type.bastide": "Bastide",
        "partner.catalog.stay_type.riad": "Riad",
        "partner.catalog.stay_type.lodge": "Lodge",
        "partner.catalog.stay_type.bungalow": "Bungalow",

        "partner.catalog.difficulty.beginner": "Principiante",
        "partner.catalog.difficulty.intermediate": "Intermedio",
        "partner.catalog.difficulty.advanced": "Avanzato",
        "partner.catalog.difficulty.expert": "Esperto",
        "partner.catalog.difficulty.all_levels": "Tutti i livelli",

        "partner.catalog.activity_type.surf": "Surf",
        "partner.catalog.activity_type.kayak": "Kayak / Paddle",
        "partner.catalog.activity_type.diving": "Immersioni",
        "partner.catalog.activity_type.hiking": "Escursionismo",
        "partner.catalog.activity_type.cycling": "Ciclismo",
        "partner.catalog.activity_type.quad_buggy": "Quad / Buggy",
        "partner.catalog.activity_type.whale_watching":
            "Osservazione dei delfini",
        "partner.catalog.activity_type.snorkeling": "Snorkeling",
        "partner.catalog.activity_type.beach_yoga": "Yoga",
        "partner.catalog.activity_type.skydiving": "Paracadutismo",
        "partner.catalog.activity_type.climbing": "Arrampicata",

        "partner.catalog.modal.create_title": "Nuova offerta",
        "partner.catalog.modal.edit_title": "Modifica offerta",
        "partner.catalog.modal.close": "Chiudi",

        "partner.catalog.meta.participants": "partecipanti",
        "partner.catalog.meta.travelers": "viaggiatori",
        "partner.catalog.meta.passengers": "passeggeri",
        "partner.catalog.meta.bedrooms": "camere",
        "partner.catalog.meta.minimum_nights": "notti minime",

        "partner.catalog.preview.client_price":
            "Prezzo mostrato al cliente (IVA inclusa)",

        "partner.catalog.toast.service_created":
            "Offerta creata con successo.",
        "partner.catalog.toast.service_updated":
            "Modifiche salvate con successo.",
        "partner.catalog.toast.service_deleted": "Offerta eliminata.",
        "partner.catalog.toast.service_enabled":
            "L'offerta e ora attiva.",
        "partner.catalog.toast.service_disabled":
            "L'offerta e stata disattivata.",
        "partner.catalog.toast.save_error":
            "Errore durante il salvataggio.",
        "partner.catalog.toast.delete_error":
            "Errore durante l'eliminazione.",
        "partner.catalog.toast.toggle_error":
            "Errore durante il cambio di stato.",

        "partner.catalog.error.title_required": "Il titolo e obbligatorio.",
        "service.form.error.fr_title_required":
            "Il titolo FR e obbligatorio.",
        "service.form.error.fr_description_required":
            "La descrizione FR e obbligatoria.",
        "service.form.field.required": "Obbligatorio",
        "service.form.field.optional": "Facoltativo",
        "service.form.url_placeholder": "https://...",
        "partner.catalog.error.description_required":
            "La descrizione e obbligatoria.",
        "partner.catalog.error.price_positive":
            "Il prezzo deve essere positivo.",
        "partner.catalog.error.city_required": "La citta e obbligatoria.",
        "partner.catalog.error.country_required": "Il paese e obbligatorio.",
        "partner.catalog.error.brand_required": "La marca e obbligatoria.",
        "partner.catalog.error.model_required": "Il modello e obbligatorio.",
        "partner.catalog.error.boat_name_required":
            "Il nome della barca e obbligatorio.",

        "partner.register.company": "Informazioni aziendali",
        "partner.register.company_name": "Nome dell'azienda",
        "partner.register.business_email": "E-mail professionale",
        "partner.register.address": "Indirizzo della sede",
        "partner.register.error.first_name": "Il nome e obbligatorio.",
        "partner.register.error.last_name": "Il cognome e obbligatorio.",
        "partner.register.error.email": "Indirizzo e-mail non valido.",
        "partner.register.error.password": "Almeno 6 caratteri.",
        "partner.register.error.company":
            "Il nome dell'azienda e obbligatorio.",
        "partner.register.error.address": "L'indirizzo e obbligatorio.",
    };
}
