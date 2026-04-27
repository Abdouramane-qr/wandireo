export function buildAuthBookingDeTranslations(): Record<string, string> {
    return {
        "auth.login.title": "Anmelden",
        "auth.login.subtitle":
            "Finden Sie Ihre Buchungen wieder und setzen Sie Ihre Reise auf Wandireo fort.",
        "auth.login.email": "E-Mail-Adresse",
        "auth.login.email_placeholder": "sie@beispiel.de",
        "auth.login.password": "Passwort",
        "auth.login.password_placeholder": "Ihr Passwort",
        "auth.login.submit": "Weiter",
        "auth.login.forgot": "Passwort vergessen?",
        "auth.login.no_account": "Noch kein Konto?",
        "auth.login.create_account": "Konto erstellen",
        "auth.login.partner_prompt": "Bieten Sie Services an?",
        "auth.login.partner_cta": "Partner werden",
        "auth.login.error.required":
            "Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.",
        "auth.login.error.invalid":
            "E-Mail-Adresse oder Passwort ist falsch.",
        "auth.password.show": "Passwort anzeigen",
        "auth.password.hide": "Passwort ausblenden",

        "auth.register.title": "Konto erstellen",
        "auth.register.subtitle":
            "Erstellen Sie Ihr Konto, um einfacher zu buchen und Ihre Auswahl wiederzufinden.",
        "auth.register.first_name": "Vorname",
        "auth.register.last_name": "Nachname",
        "auth.register.password": "Passwort",
        "auth.register.confirm_password": "Passwort bestaetigen",
        "auth.register.password_hint": "Mindestens 6 Zeichen",
        "auth.register.confirm_placeholder": "Wiederholen Sie Ihr Passwort",
        "auth.register.accept_terms_prefix": "Ich akzeptiere die",
        "auth.register.accept_terms_join": "und die",
        "auth.register.terms": "Nutzungsbedingungen",
        "auth.register.privacy": "Datenschutzerklaerung",
        "auth.register.submit": "Mein kostenloses Konto erstellen",
        "auth.register.have_account": "Sie haben bereits ein Konto?",
        "auth.register.login": "Anmelden",
        "auth.register.error.first_name": "Der Vorname ist erforderlich.",
        "auth.register.error.last_name": "Der Nachname ist erforderlich.",
        "auth.register.error.email_required":
            "Die E-Mail-Adresse ist erforderlich.",
        "auth.register.error.email_invalid":
            "Die E-Mail-Adresse ist ungueltig.",
        "auth.register.error.password_required":
            "Das Passwort ist erforderlich.",
        "auth.register.error.password_length":
            "Das Passwort muss mindestens 6 Zeichen enthalten.",
        "auth.register.error.password_match":
            "Die Passwoerter stimmen nicht ueberein.",
        "auth.register.error.accept_terms":
            "Sie muessen die Nutzungsbedingungen akzeptieren.",

        "cart.empty_message":
            "Ihr Warenkorb ist derzeit leer. Waehlen Sie ein Angebot, um Ihre Buchung zu starten.",
        "cart.back_catalog": "Angebote entdecken",
        "cart.steps_aria": "Buchungsschritte",
        "cart.step.cart": "Warenkorb",
        "cart.step.info": "Informationen",
        "cart.step.payment": "Zahlung",
        "cart.step.confirmation": "Bestaetigung",
        "cart.title": "Ihre Buchung",
        "cart.subtitle":
            "Pruefen Sie Ihre Auswahl, bevor Sie die Daten des Reisenden eingeben.",
        "cart.service_aria": "Ausgewaehlter Service",
        "cart.reviews": "Bewertungen",
        "cart.selection_title": "Zusammenfassung",
        "cart.selection.dates": "Datum",
        "cart.selection.dates_plural": "Daten",
        "cart.selection.time_slot": "Zeitfenster",
        "cart.selection.quantity": "Anzahl",
        "cart.selection.destination": "Reiseziel",
        "cart.selection.extras": "Extras",
        "cart.summary_aria": "Zusammenfassung und Preis",
        "cart.summary_title": "Preisuebersicht",
        "cart.payment_mode.full_cash_on_site.label": "Vor Ort bezahlen",
        "cart.payment_mode.full_cash_on_site.description":
            "Keine Online-Zahlung. Die Zahlung erfolgt vor Ort gemaess den Bedingungen des Angebots.",
        "cart.payment_mode.commission_online_rest_on_site.label":
            "Anzahlung online, Rest vor Ort",
        "cart.payment_mode.commission_online_rest_on_site.description":
            "Der online faellige Teil wird jetzt bezahlt. Der Restbetrag wird vor Ort beglichen.",
        "cart.payment_mode.full_online.label": "Online-Zahlung",
        "cart.payment_mode.full_online.description":
            "Der online faellige Betrag wird jetzt auf Wandireo bezahlt.",
        "cart.payment_mode.connected_account.label": "Online-Zahlung",
        "cart.payment_mode.connected_account.description":
            "Die Online-Zahlung wird bei der Buchung verarbeitet.",
        "cart.payment_mode.external_redirect.label": "Externe Buchung",
        "cart.payment_mode.external_redirect.description":
            "Die Buchung wird ausserhalb des Wandireo-Buchungsprozesses abgeschlossen.",
        "cart.price.partner": "Anbieterpreis",
        "cart.price.extras": "Extras",
        "cart.price.fees": "Servicegebuehren",
        "cart.price.onsite": "Vor Ort zu zahlen",
        "cart.price.now": "Jetzt zu zahlender Betrag",
        "cart.price.free": "0 EUR (kostenlos)",
        "cart.price.total": "Gesamt inkl. MwSt.",
        "cart.price.pay_online": "Jetzt bezahlen",
        "cart.secure.cash":
            "Garantierte Buchung. Die Zahlung erfolgt vor Ort gemaess den Servicebedingungen.",
        "cart.secure.online":
            "Sichere Zahlung auf Wandireo. Der angezeigte Betrag ist der fuer Ihre Buchung bestaetigte Betrag.",
        "cart.cta.continue": "Weiter",
        "cart.cta.edit": "Auswahl bearbeiten",
        "cart.quantity.participant_one": "1 Teilnehmer",
        "cart.quantity.participant_other": "{count} Teilnehmer",
        "cart.quantity.night_one": "1 Nacht",
        "cart.quantity.night_other": "{count} Naechte",
        "cart.quantity.day_one": "1 Tag",
        "cart.quantity.day_other": "{count} Tage",

        "checkout.steps.cart": "Warenkorb",
        "checkout.steps.information": "Informationen",
        "checkout.steps.payment": "Zahlung",
        "checkout.steps.confirmation": "Bestaetigung",
        "checkout.title": "Angaben zum Reisenden",
        "checkout.subtitle":
            "Diese Informationen werden verwendet, um Ihre Buchung vorzubereiten und einen reibungslosen Ablauf des Services zu gewaehrleisten.",
        "checkout.identity": "Identitaet",
        "checkout.contact": "Kontaktdaten",
        "checkout.special_requests": "Nuetzliche Informationen",
        "checkout.optional": "optional",
        "checkout.first_name": "Vorname",
        "checkout.last_name": "Nachname",
        "checkout.nationality": "Nationalitaet",
        "checkout.nationality_placeholder":
            "z. B. Deutsch, Franzoesisch, Belgisch...",
        "checkout.email": "E-Mail-Adresse",
        "checkout.email_placeholder": "ihre@email.de",
        "checkout.email_hint":
            "Die Buchungszusammenfassung und Aktualisierungen werden an diese Adresse gesendet.",
        "checkout.phone": "Telefon",
        "checkout.phone_placeholder": "+49 151 234 56789",
        "checkout.phone_hint":
            "Nuetzlich, falls der Partner Sie am Tag des Services schnell erreichen muss.",
        "checkout.message_label": "Zusaetzliche Nachricht",
        "checkout.message_placeholder":
            "Einschraenkungen, Allergien, besondere Wuensche oder nuetzliche Details...",
        "checkout.back": "Zurueck zum Warenkorb",
        "checkout.continue": "Weiter zur Zahlung",
        "checkout.order": "Ihre Buchung",
        "checkout.partner_price": "Anbieterpreis",
        "checkout.extras": "Extras",
        "checkout.service_fee": "Servicegebuehren",
        "checkout.total_vat": "Gesamt inkl. MwSt.",
        "checkout.errors.first_name": "Der Vorname ist erforderlich.",
        "checkout.errors.last_name": "Der Nachname ist erforderlich.",
        "checkout.errors.email_required":
            "Die E-Mail-Adresse ist erforderlich.",
        "checkout.errors.email_invalid":
            "Bitte geben Sie eine gueltige E-Mail-Adresse ein.",
        "checkout.errors.phone": "Die Telefonnummer ist erforderlich.",
        "checkout.errors.nationality":
            "Die Nationalitaet ist erforderlich.",

        "payment.steps.cart": "Warenkorb",
        "payment.steps.information": "Informationen",
        "payment.steps.payment": "Zahlung",
        "payment.steps.confirmation": "Bestaetigung",
        "payment.title": "Buchung bestaetigen",
        "payment.subtitle":
            "Pruefen Sie die Informationen ein letztes Mal vor der endgueltigen Bestaetigung.",
        "payment.summary_title": "Zusammenfassung vor der Bestaetigung",
        "payment.traveler": "Reisender",
        "payment.email": "E-Mail",
        "payment.service": "Service",
        "payment.extras": "Extras",
        "payment.total": "Gesamt",
        "payment.pay_later": "Vor Ort bezahlen",
        "payment.pay_now": "Jetzt bezahlen",
        "payment.syncing": "Betrag wird geprueft...",
        "payment.sync_error":
            "Der Betrag konnte nicht erneut ueberprueft werden.",
        "payment.submit_error":
            "Die Buchung kann derzeit nicht bestaetigt werden. Bitte versuchen Sie es erneut.",
        "payment.back": "Zurueck",
        "payment.confirming": "Speichern...",
        "payment.verifying": "Pruefung...",
        "payment.confirm": "Bestaetigen und buchen",
        "payment.order": "Ihre Buchung",
        "payment.customer": "Hauptreisender",
        "payment.partner_price": "Anbieterpreis",
        "payment.service_fee": "Servicegebuehren",
        "payment.total_vat": "Gesamt inkl. MwSt.",

        "confirmation.steps_aria": "Buchungsschritte",
        "confirmation.empty_title": "Bestaetigung nicht gefunden",
        "confirmation.empty":
            "Fuer diese Referenz wurde keine Bestaetigung gefunden.",
        "confirmation.empty_desc":
            "Diese Referenz entspricht keiner verfuegbaren Buchung.",
        "confirmation.back_home": "Zurueck zur Startseite",
        "confirmation.title": "Buchung bestaetigt!",
        "confirmation.subtitle":
            "Ihre Buchung wurde erfolgreich erfasst. Eine Zusammenfassung wird gesendet an",
        "confirmation.reference": "Referenz",
        "confirmation.stay": "Ihre Buchung",
        "confirmation.start_date": "Startdatum",
        "confirmation.end_date": "Enddatum",
        "confirmation.slot": "Zeitfenster",
        "confirmation.participants": "Teilnehmer",
        "confirmation.participant": "Teilnehmer",
        "confirmation.participants_plural": "Teilnehmer",
        "confirmation.nights": "Naechte",
        "confirmation.days": "Tage",
        "confirmation.traveler": "Hauptreisender",
        "confirmation.full_name": "Vollstaendiger Name",
        "confirmation.email": "E-Mail",
        "confirmation.phone": "Telefon",
        "confirmation.nationality": "Nationalitaet",
        "confirmation.requests": "Zusaetzliche Informationen",
        "confirmation.payment_summary": "Zahlungsuebersicht",
        "confirmation.partner_price": "Anbieterpreis",
        "confirmation.service_fee": "Servicegebuehren",
        "confirmation.total": "Gesamt inkl. MwSt.",
        "confirmation.paid_online": "Online bezahlt",
        "confirmation.pay_onsite": "Vor Ort bezahlen",
        "confirmation.cash_guaranteed":
            "Garantierte Buchung, Zahlung vor Ort",
        "confirmation.commission_paid": "Provision online bezahlt",
        "confirmation.payment_received": "Zahlung erhalten",
        "confirmation.next_steps": "Wie geht es weiter?",
        "confirmation.next1_title": "E-Mail-Bestaetigung",
        "confirmation.next1_desc":
            "Sie erhalten in den naechsten Minuten eine vollstaendige Zusammenfassung per E-Mail.",
        "confirmation.next2_title": "Kontakt durch den Anbieter",
        "confirmation.next2_desc":
            "Der Partner kann Sie kontaktieren, falls praktische Details geklaert werden muessen.",
        "confirmation.next3_title": "Geniessen Sie Ihr Erlebnis",
        "confirmation.next3_desc":
            "Jetzt bleibt Ihnen nur noch, Ihr Erlebnis zu geniessen.",
        "confirmation.discover_more": "Weitere Aktivitaeten entdecken",
    };
}
