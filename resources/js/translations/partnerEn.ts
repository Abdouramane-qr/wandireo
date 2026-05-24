export function buildPartnerEnTranslations(): Record<string, string> {
    return {
        // Dashboard
        "partner.dashboard.stats": "Overall Statistics",
        "partner.dashboard.revenue_total": "Total Revenue",
        "partner.dashboard.revenue_month": "Monthly Revenue",
        "partner.dashboard.bookings_month_one": "Booking this month",
        "partner.dashboard.bookings_month_other": "Bookings this month",
        "partner.dashboard.pending_one": "pending booking",
        "partner.dashboard.pending_other": "pending bookings",
        "partner.dashboard.catalog": "My Catalog",
        "partner.dashboard.reservations": "My Bookings",
        "partner.dashboard.management": "Management",
        "partner.dashboard.recent": "Recent Activity",
        "partner.dashboard.see_all": "See all",
        "partner.dashboard.shortcuts": "Shortcuts",
        "partner.dashboard.empty": "No data to display at the moment.",
        "partner.dashboard.up_to_date": "Everything is up to date.",
        "partner.dashboard.member_since": "Partner since {date}",
        "partner.dashboard.finance_title": "Financial tracking",
        "partner.dashboard.finance_loading": "Refreshing...",
        "partner.dashboard.finance_net": "Partner net",
        "partner.dashboard.finance_receivable": "Receivable",
        "partner.dashboard.finance_on_hold": "On hold",
        "partner.dashboard.finance_paid": "Paid",
        "partner.dashboard.finance_confirmed_bookings":
            "{count} confirmed booking(s)",
        "partner.dashboard.finance_receivable_sub": "Pending or scheduled",
        "partner.dashboard.finance_on_hold_sub": "Held by Wandireo",
        "partner.dashboard.finance_paid_sub": "Already marked as paid",

        // Profile & Status
        "partner.profile.title": "Partner Profile",
        "partner.profile.since": "Partner since",
        "partner.profile.commission": "Commission rate",
        "partner.profile.rating": "Average rating",
        "partner.profile.sales": "Total sales",
        "partner.profile.catalog_title": "Service Catalog",
        "partner.profile.catalog_manage": "Manage catalog",
        "partner.profile.add_service": "Add a service",
        "partner.profile.first_service":
            "Create your first service to get started.",
        "partner.profile.empty": "No active services at the moment.",
        "partner.profile.account_title": "Partner contact details",
        "partner.profile.account_subtitle":
            "Update the real email used for partner communication, along with the contact details used by the Wandireo team.",
        "partner.profile.tax_title": "Tax profile",
        "partner.profile.tax_subtitle":
            "These details prepare accounting exports and partner invoicing.",
        "partner.profile.field.company_name": "Company",
        "partner.profile.field.email": "Partner email",
        "partner.profile.field.phone": "Phone",
        "partner.profile.field.business_address": "Business address",
        "partner.profile.field.legal_company_name": "Legal company name",
        "partner.profile.field.tax_country": "Tax country (ISO)",
        "partner.profile.field.vat_number": "VAT number",
        "partner.profile.field.business_registration_number":
            "Business registration number",
        "partner.profile.field.billing_email": "Billing email",
        "partner.profile.save": "Save details",
        "partner.profile.save_loading": "Saving...",
        "partner.profile.save_success_title": "Profile updated",
        "partner.profile.save_success_desc":
            "Partner details were saved successfully.",
        "partner.profile.save_error_title": "Update failed",
        "partner.profile.save_error_desc":
            "Unable to update partner details right now.",
        "partner.documents.title": "Compliance documents",
        "partner.documents.subtitle":
            "Add the documents needed for administrative review of your partner account.",
        "partner.documents.field.type": "Document type",
        "partner.documents.field.expires_at": "Expiration date",
        "partner.documents.field.file": "PDF or image file",
        "partner.documents.upload": "Upload",
        "partner.documents.uploading": "Uploading...",
        "partner.documents.upload_missing": "Please select a file.",
        "partner.documents.upload_success": "Document uploaded.",
        "partner.documents.upload_error": "Unable to upload this document.",
        "partner.documents.loading": "Loading documents...",
        "partner.documents.empty": "No document uploaded yet.",
        "partner.documents.file": "Document",
        "partner.documents.type.business_registration": "Business registration",
        "partner.documents.type.tax_certificate": "Tax certificate",
        "partner.documents.type.insurance": "Insurance",
        "partner.documents.type.identity": "Identity document",
        "partner.documents.type.other": "Other document",
        "partner.documents.status.uploaded": "Uploaded",
        "partner.documents.status.under_review": "Under review",
        "partner.documents.status.validated": "Validated",
        "partner.documents.status.rejected": "Rejected",
        "partner.documents.status.expired": "Expired",
        "partner.compliance.title": "Compliance summary",
        "partner.compliance.progress": "{completed}/{total} steps",
        "partner.compliance.ready":
            "Your dossier is ready for commercial operations.",
        "partner.compliance.in_progress":
            "Complete the remaining points to secure your dossier.",
        "partner.compliance.account_approved": "Account approved",
        "partner.compliance.contract_signed": "Contract signed",
        "partner.compliance.tax_profile_complete": "Tax profile complete",
        "partner.compliance.documents_validated": "Documents validated",
        "partner.compliance.document_counts":
            "{validated} validated · {pending} in review · {blocked} blocking",

        // Pending & Validation
        "partner.pending.title.pending": "Application under review",
        "partner.pending.title.approved": "Account activated!",
        "partner.pending.title.rejected": "Application rejected",
        "partner.pending.title.suspended": "Account suspended",
        "partner.pending.message.pending":
            "Your application is currently being reviewed by our team. We will contact you very shortly.",
        "partner.pending.message.approved":
            "Your account has been validated. You can now access your dashboard.",
        "partner.pending.message.approved_unsigned":
            "Your account has been approved. Sign the contract to unlock your partner dashboard.",
        "partner.pending.message.rejected":
            "Unfortunately, your application was not accepted.",
        "partner.pending.message.rejected_with_reason":
            "Your application was rejected for the following reason: {reason}",
        "partner.pending.message.suspended":
            "Your account has been temporarily suspended. Please contact support.",
        "partner.pending.admin_validation": "Admin validation",
        "partner.pending.contract_status": "Contract status",
        "partner.pending.account_status": "Account status",
        "partner.pending.contract_signature": "Contract signature",
        "partner.pending.download_contract": "Download contract",
        "partner.pending.open_dashboard": "Access dashboard",
        "partner.pending.back_home": "Back to home",
        "partner.pending.company": "Company",
        "partner.pending.contact": "Primary contact",
        "partner.pending.date_missing": "Not provided",
        "partner.pending.status.account.pending": "Pending",
        "partner.pending.status.account.approved": "Approved",
        "partner.pending.status.account.rejected": "Rejected",
        "partner.pending.status.account.suspended": "Suspended",
        "partner.pending.status.contract.not_sent": "Not sent",
        "partner.pending.status.contract.pending_signature":
            "Pending signature",
        "partner.pending.status.contract.signed": "Signed",
        "partner.pending.status.contract.rejected": "Rejected",
        "partner.pending.contract_sign_title": "Sign the contract",
        "partner.pending.contract_sign_message":
            "Download the contract if needed, then confirm acceptance to unlock your partner access.",
        "partner.pending.contract_sign_acknowledge":
            "I confirm that I have read and accepted the partner contract.",
        "partner.pending.contract_sign_cta": "Sign contract",
        "partner.pending.contract_sign_loading": "Signing...",
        "partner.pending.contract_sign_success":
            "Contract signed successfully.",
        "partner.pending.contract_sign_error":
            "Unable to sign the contract right now.",
        "partner.pending.contract_accept_required":
            "You must confirm contract acceptance before signing.",

        // Bookings Management
        "partner.bookings.title": "Booking Management",
        "partner.bookings.back_dashboard": "Back to dashboard",
        "partner.bookings.tabs_aria": "Booking filters",
        "partner.bookings.tab.all": "All",
        "partner.bookings.tab.pending": "To confirm",
        "partner.bookings.tab.confirmed": "Confirmed",
        "partner.bookings.tab.cancelled": "Cancelled",
        "partner.bookings.count_one": "booking found",
        "partner.bookings.count_other": "bookings found",
        "partner.bookings.empty_status": "No {status} bookings.",
        "partner.bookings.empty_prefix": "You have no bookings",
        "partner.bookings.empty_suffix": "at the moment.",
        "partner.bookings.status.pending": "Pending",
        "partner.bookings.status.confirmed": "Confirmed",
        "partner.bookings.status.cancelled": "Cancelled",
        "partner.bookings.accept": "Confirm",
        "partner.bookings.reject": "Reject",
        "partner.bookings.toast.confirm_success":
            "Booking successfully confirmed.",
        "partner.bookings.toast.confirm_error": "Error during confirmation.",
        "partner.bookings.toast.reject_success": "Booking rejected.",
        "partner.bookings.toast.reject_error": "Error during rejection.",

        // Reject Modal
        "partner.bookings.reject_modal.title": "Reject booking",
        "partner.bookings.reject_modal.description":
            "Please indicate the reason for rejection (unavailability, technical issue, etc.). The customer will be informed.",
        "partner.bookings.reject_modal.submit": "Confirm rejection",
        "partner.bookings.reject_modal.cancel": "Cancel",
        "partner.bookings.reject_modal.submitting": "Processing...",
        "partner.bookings.reject_modal.error": "Please provide a reason.",

        // Catalog Management
        "partner.catalog.page_title": "My Catalog",
        "partner.catalog.page_subtitle":
            "Manage your offers, prices and availability in real time.",
        "partner.catalog.back_dashboard": "Back to dashboard",
        "partner.catalog.action.add_service": "Add an offer",
        "partner.catalog.action.edit": "Edit",
        "partner.catalog.action.delete": "Delete",
        "partner.catalog.action.enable": "Enable",
        "partner.catalog.action.create": "Create offer",
        "partner.catalog.action.save": "Save changes",
        "partner.catalog.action.cancel": "Cancel",
        "partner.catalog.empty.title": "Your catalog is empty",
        "partner.catalog.empty.subtitle":
            "Start by adding your first activity, boat or accommodation to receive your first bookings.",

        // Categories
        "partner.catalog.category.activity": "Activity",
        "partner.catalog.category.boat": "Boat",
        "partner.catalog.category.car": "Car",
        "partner.catalog.category.stay": "Accommodation",

        // Form Sections
        "partner.catalog.section.general": "General Information",
        "partner.catalog.section.location": "Location",
        "partner.catalog.section.pricing": "Pricing & Payment",
        "partner.catalog.section.availability": "Availability",
        "partner.catalog.section.activity": "Activity Details",
        "partner.catalog.section.boat": "Boat Details",
        "partner.catalog.section.car": "Vehicle Details",
        "partner.catalog.section.stay": "Accommodation Details",

        // Fields
        "partner.catalog.field.title": "Offer title",
        "partner.catalog.field.category": "Category",
        "partner.catalog.field.description": "Detailed description",
        "partner.catalog.field.country": "Country",
        "partner.catalog.field.region": "Region",
        "partner.catalog.field.city": "City",
        "partner.catalog.field.meeting_point": "Meeting point / Address",
        "partner.catalog.field.partner_price": "Partner price (net)",
        "partner.catalog.field.pricing_unit": "Pricing unit",
        "partner.catalog.field.payment_mode": "Payment mode",
        "partner.catalog.field.currency": "Currency",
        "partner.catalog.currency.eur": "EUR — Euro",
        "partner.catalog.currency.usd": "USD — US Dollar",
        "partner.catalog.currency.gbp": "GBP — British Pound",
        "partner.catalog.field.available": "Available",
        "partner.catalog.field.min_age": "Minimum age",
        "partner.catalog.field.max_guests": "Maximum capacity",
        "partner.catalog.field.duration": "Duration",
        "partner.catalog.field.languages": "Languages spoken",
        "partner.catalog.field.included": "Included in price",
        "partner.catalog.field.not_included": "Not included",
        "partner.catalog.field.tags": "Tags / Keywords",
        "partner.catalog.field.house_rules": "House rules",
        "partner.catalog.field.license_required": "License required",
        "partner.catalog.field.license_type": "License type",

        // Specific Fields
        "partner.catalog.field.brand": "Brand",
        "partner.catalog.field.model": "Model",
        "partner.catalog.field.year": "Year",
        "partner.catalog.field.seats": "Number of seats",
        "partner.catalog.field.doors": "Number of doors",
        "partner.catalog.field.small_bags": "Small bags",
        "partner.catalog.field.bedrooms": "Bedrooms",
        "partner.catalog.field.pets_allowed": "Pets allowed",
        "partner.catalog.field.smoking_allowed": "Smoking allowed",
        "partner.catalog.field.air_conditioning": "Air conditioning",
        "partner.catalog.field.boat_name": "Boat name",
        "partner.catalog.field.boat_cabins": "Cabins",
        "partner.catalog.field.boat_amenities": "Onboard amenities",
        "partner.catalog.field.engine_power_kw": "Engine power (kW)",
        "partner.catalog.field.fuel_included": "Fuel included",
        "partner.catalog.field.full_insurance": "Full insurance",
        "partner.catalog.field.deposit_eur": "Deposit (€)",
        "partner.catalog.field.day_charter": "Day rental",
        "partner.catalog.field.week_charter": "Week rental",

        // Placeholders
        "partner.catalog.placeholder.title": "e.g., Benagil Caves Excursion",
        "partner.catalog.placeholder.country": "Portugal",
        "partner.catalog.placeholder.region": "Algarve",
        "partner.catalog.placeholder.city": "Albufeira",
        "partner.catalog.placeholder.tags": "caves, dolphins, family...",

        // Pricing Units
        "partner.catalog.pricing_unit.person": "per person",
        "partner.catalog.pricing_unit.group": "per group",
        "partner.catalog.pricing_unit.night": "per night",
        "partner.catalog.pricing_unit.day": "per day",
        "partner.catalog.pricing_unit.week": "per week",
        "partner.catalog.pricing_unit.half_day": "per half-day",

        // Payment Modes
        "partner.catalog.payment_mode.full_online": "100% Online payment",
        "partner.catalog.payment_mode.commission_online":
            "Online commission, balance on site",
        "partner.catalog.payment_mode.on_site": "Full payment on site",
        "partner.catalog.payment_mode.connected_account":
            "Connected Stripe account",

        // Boat Types
        "partner.catalog.boat_type.catamaran": "Catamaran",
        "partner.catalog.boat_type.motor_yacht": "Motor Yacht",
        "partner.catalog.boat_type.sailboat": "Sailboat",
        "partner.catalog.boat_type.rib": "RIB",
        "partner.catalog.boat_type.schooner": "Schooner",
        "partner.catalog.boat_type.barge": "Barge",

        // Rental Modes
        "partner.catalog.rental_mode.with_skipper": "With skipper",
        "partner.catalog.rental_mode.without_skipper": "Without skipper",
        "partner.catalog.rental_mode.bareboat": "Bareboat",
        "partner.catalog.rental_mode.full_crew": "Full crew",

        // Car Types
        "partner.catalog.vehicle_type.city_car": "City car",
        "partner.catalog.vehicle_type.sedan": "Sedan",
        "partner.catalog.vehicle_type.suv": "SUV",
        "partner.catalog.vehicle_type.convertible": "Convertible",
        "partner.catalog.vehicle_type.minivan": "Minivan",
        "partner.catalog.vehicle_type.utility": "Utility",
        "partner.catalog.vehicle_type.quad": "Quad / Buggy",
        "partner.catalog.vehicle_type.scooter_125": "Scooter 125cc",

        // Stay Types
        "partner.catalog.stay_type.villa": "Villa",
        "partner.catalog.stay_type.apartment": "Apartment",
        "partner.catalog.stay_type.guest_house": "Guest house",
        "partner.catalog.stay_type.hotel": "Hotel",
        "partner.catalog.stay_type.bastide": "Bastide",
        "partner.catalog.stay_type.riad": "Riad",
        "partner.catalog.stay_type.lodge": "Lodge",
        "partner.catalog.stay_type.bungalow": "Bungalow",

        // Difficulties
        "partner.catalog.difficulty.beginner": "Beginner",
        "partner.catalog.difficulty.intermediate": "Intermediate",
        "partner.catalog.difficulty.advanced": "Advanced",
        "partner.catalog.difficulty.expert": "Expert",
        "partner.catalog.difficulty.all_levels": "All levels",

        // Activity Types
        "partner.catalog.activity_type.surf": "Surf",
        "partner.catalog.activity_type.kayak": "Kayak / Paddle",
        "partner.catalog.activity_type.diving": "Diving",
        "partner.catalog.activity_type.hiking": "Hiking",
        "partner.catalog.activity_type.cycling": "Cycling",
        "partner.catalog.activity_type.quad_buggy": "Quad / Buggy",
        "partner.catalog.activity_type.whale_watching": "Dolphin watching",
        "partner.catalog.activity_type.snorkeling": "Snorkeling",
        "partner.catalog.activity_type.beach_yoga": "Yoga",
        "partner.catalog.activity_type.skydiving": "Skydiving",
        "partner.catalog.activity_type.climbing": "Climbing",

        // Modal Labels
        "partner.catalog.modal.create_title": "New offer",
        "partner.catalog.modal.edit_title": "Edit offer",
        "partner.catalog.modal.close": "Close",

        // Meta Labels
        "partner.catalog.meta.participants": "participants",
        "partner.catalog.meta.travelers": "travelers",
        "partner.catalog.meta.passengers": "passengers",
        "partner.catalog.meta.bedrooms": "bedrooms",
        "partner.catalog.meta.minimum_nights": "min nights",

        // Preview
        "partner.catalog.preview.client_price":
            "Client display price (incl. tax)",
        "partner.catalog.preview.commission": "Wandireo commission",

        // Toasts & Errors
        "partner.catalog.toast.service_created": "Offer successfully created.",
        "partner.catalog.toast.service_updated": "Changes successfully saved.",
        "partner.catalog.toast.service_deleted": "Offer deleted.",
        "partner.catalog.toast.service_enabled": "Offer is now active.",
        "partner.catalog.toast.service_disabled": "Offer disabled.",
        "partner.catalog.toast.save_error": "Error during save.",
        "partner.catalog.toast.delete_error": "Error during deletion.",
        "partner.catalog.toast.toggle_error": "Error during status change.",

        "partner.catalog.error.title_required": "Title is required.",
        "service.form.url_placeholder": "https://...",
        "partner.catalog.error.description_required":
            "Description is required.",
        "partner.catalog.error.price_positive": "Price must be positive.",
        "partner.catalog.error.city_required": "City is required.",
        "partner.catalog.error.country_required": "Country is required.",
        "partner.catalog.error.brand_required": "Brand is required.",
        "partner.catalog.error.model_required": "Model is required.",
        "partner.catalog.error.boat_name_required": "Boat name is required.",

        // Missing dashboard labels
        "partner.dashboard.title": "Partner dashboard",
        "partner.dashboard.action_required": "Action required",
        "partner.dashboard.avatar_label": "{company} avatar",
        "partner.dashboard.catalog_aria": "Open partner catalog",
        "partner.dashboard.bookings_aria": "Open partner bookings",
        "partner.dashboard.active_service_one": "active offer",
        "partner.dashboard.active_service_other": "active offers",
        "partner.dashboard.process_one": "{count} booking to process",
        "partner.dashboard.process_other": "{count} bookings to process",
        "partner.dashboard.pending_badge": "{count} pending requests",
        "partner.dashboard.status.confirmed": "Confirmed",
        "partner.dashboard.status.pending": "Pending",
        "partner.dashboard.status.cancelled": "Cancelled",
        "partner.dashboard.offers_overview": "Catalog overview",
        "partner.dashboard.active_services": "Active offers",
        "partner.dashboard.inactive_services": "Hidden offers",
        "partner.dashboard.external_services": "Synced offers",
        "partner.dashboard.action_new_offer": "Add an offer",
        "partner.dashboard.action_profile": "View profile",

        // Missing profile labels
        "partner.profile.active_services": "Active offers",
        "partner.profile.imported_services": "Synced offers",
        "partner.profile.hidden_services": "Hidden offers",
        "partner.profile.catalog_edit": "Edit",

        // Missing bookings labels
        "partner.bookings.booking_id": "Booking {id}",
        "partner.bookings.received_on": "Received on {date}",
        "partner.bookings.participants_one": "participant",
        "partner.bookings.participants_other": "participants",
        "partner.bookings.extras": "Extras: {summary}",
        "partner.bookings.reason": "Reason: {reason}",
        "partner.bookings.pending_badge": "{count} pending",
        "partner.bookings.status_aria": "Status {status}",
        "partner.bookings.reject_modal.placeholder":
            "Example: no availability, weather, maintenance...",
        "partner.bookings.summary.total": "Total",
        "partner.bookings.summary.pending": "To confirm",
        "partner.bookings.summary.confirmed": "Confirmed",
        "partner.bookings.summary.cancelled": "Cancelled",
        "partner.bookings.external.label":
            "External booking: {status} · Ref. {reference}",
        "partner.bookings.external.reference_missing": "not available",
        "partner.bookings.external.status.confirmed": "confirmed",
        "partner.bookings.external.status.pending": "pending",
        "partner.bookings.external.status.failed": "failed",

        // Missing catalog labels
        "partner.catalog.card.partner_price": "Partner price",
        "partner.catalog.card.client_price": "Client price",
        "partner.catalog.card.commission": "Commission {rate}%",
        "partner.catalog.card.read_only_offer":
            "Synced offer: edit from the partner source.",
        "partner.catalog.card.open_public": "Open public page",
        "partner.catalog.card.local": "Local",
        "partner.catalog.card.external": "Synced",
        "partner.catalog.card.updated": "Updated: {date}",
        "partner.catalog.action.confirm_delete": "Confirm",
        "partner.catalog.delete.confirm_prompt":
            "Delete this offer permanently?",
        "partner.catalog.filters.aria": "Partner catalog filters",
        "partner.catalog.filters.search": "Search",
        "partner.catalog.filters.search_placeholder":
            "Title, city, category, source...",
        "partner.catalog.filters.status": "Status",
        "partner.catalog.filters.source": "Source",
        "partner.catalog.filters.all_categories": "All categories",
        "partner.catalog.filters.all_statuses": "All statuses",
        "partner.catalog.filters.all_sources": "All sources",
        "partner.catalog.filters.reset": "Reset",
        "partner.catalog.filters.empty_title": "No offers match",
        "partner.catalog.filters.empty_subtitle":
            "Adjust your filters to find your products.",
        "partner.catalog.summary.total": "Total offers",
        "partner.catalog.summary.active": "Active offers",
        "partner.catalog.summary.external": "Synced offers",
        "partner.catalog.summary.hidden": "Hidden offers",
        "partner.catalog.status.active": "Active",
        "partner.catalog.status.inactive": "Hidden",

        // Registration
        "partner.register.company": "Company information",
        "partner.register.company_name": "Company name",
        "partner.register.business_email": "Business email",
        "partner.register.address": "Headquarters address",
        "partner.register.error.first_name": "First name is required.",
        "partner.register.error.last_name": "Last name is required.",
        "partner.register.error.email": "Invalid email address.",
        "partner.register.error.password": "At least 6 characters.",
        "partner.register.error.company": "Company name is required.",
        "partner.register.error.address": "Address is required.",
    };
}
