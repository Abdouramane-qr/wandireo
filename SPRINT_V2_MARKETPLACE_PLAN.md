# Sprint V2 Marketplace - Partner Autonomy + Moderation + Compliance

## Objective

Transformer la V1 operationnelle en une vraie marketplace SaaS scalable, avec :

- autonomie partenaire encadree
- moderation admin traçable
- socle fiscal et contractuel
- readiness multi-partenaire
- securite operationnelle
- meilleure confiance client

Ce sprint ne cherche pas a ajouter plus de fonctionnalites visibles. Il cherche a poser la couche de gouvernance qui permet de grandir sans casser :

- reservation
- paiement Stripe
- synchro providers externes
- administration quotidienne

## Final Status - 2026-05-19

Sprint V2 is finalized in the current working tree.

Delivered scope:

- service moderation lifecycle with review, approval, publication, rejection, suspension, and traceable events
- partner compliance documents, contract state, fiscal profile, and partner-facing compliance summary
- generic audit log for sensitive governance, moderation, document, and finance actions
- action-level admin permission middleware with scoped permission keys and legacy admin compatibility
- admin finance summary, finance CSV export, payout readiness fields, and payout status updates
- partner finance visibility for gross volume, commission, net amount, and payout buckets
- public client trust badges based on partner approval, signed contract, and validated documents
- admin operational dashboard queue, compliance counters, transaction risk triage, and support button polish

Final validation:

- targeted PHPUnit coverage passed for moderation, public visibility, partner documents, audit log, admin permissions, admin booking operations, user profile, Stripe checkout, and external booking flows during the sprint
- frontend validation passed with `npm run types:check`, targeted Prettier checks, and `npm run build`
- Docker app image was rebuilt with `docker compose up -d --build app`
- Laravel caches were cleared with `php artisan optimize:clear`
- Docker `app` service is healthy after the final rebuild

## Guiding Principle

La regle de fond est la suivante :

1. tout ce qui touche a la publication, aux contrats, a la fiscalite et aux suspensions doit etre explicite
2. tout ce qui touche a la reservation et au paiement doit rester stable
3. toute action sensible doit laisser une trace exploitable
4. le partenaire doit gagner en autonomie, mais jamais sans garde-fou

## Current Diagnosis

### Already strong

- booking and payment core are already production-oriented
- external booking orchestration is generic and extensible
- partner/admin/client spaces already exist
- admin has operational controls for users, services, support, reviews and analytics
- service content is already translatable and structurally rich

### Initial gaps addressed in this sprint

- explicit service moderation lifecycle has been introduced
- partner compliance workspace and document review are in place
- audit trail now covers moderation, documents, partner governance, and payout changes
- action-level permission checks protect sensitive admin endpoints
- finance, payout readiness, and export foundations are available
- partner-facing revenue and compliance summaries are visible

### Main risks

- partner can expose content too directly
- admin decisions are not yet fully traceable
- fiscal readiness is partial
- support load will grow if status changes stay implicit
- role-based access alone will not scale

## Scope of V2

### In scope

- partner lifecycle
- service lifecycle
- moderation workflow
- contract and document management
- tax/compliance base
- audit log
- permission model evolution
- partner revenue visibility
- admin moderation dashboard

### Out of scope for now

- full multi-tenant white-label
- advanced payout automation
- AI moderation
- multi-country tax engine
- reputation system advanced

## Proposed Workstreams

### Workstream 1: Partner Governance

Goal:

- let partners manage their profile, services, documents and compliance in one place
- make partner status and onboarding state explicit

Deliverables:

- partner status model
- contract status model
- document upload area
- partner profile v2
- compliance dashboard for partner

### Workstream 2: Service Moderation

Goal:

- control what goes live
- separate draft, review, approval and publication

Deliverables:

- service moderation statuses
- admin review queue
- rejection reason capture
- publication/suspension actions
- moderation history

### Workstream 3: Finance and Compliance

Goal:

- prepare the platform for real partner settlement and fiscal traceability

Deliverables:

- partner tax profile
- commission visibility
- payout status model
- accounting export foundation
- contract and invoice readiness

### Workstream 4: RBAC and Security

Goal:

- stop relying only on global roles
- allow precise operation access

Deliverables:

- permission map
- action-based checks for sensitive endpoints
- admin moderation permissions
- partner scoped permissions
- audit events for sensitive actions

### Workstream 5: Client Trust Layer

Goal:

- improve trust, clarity and conversion

Deliverables:

- visible partner validation status where relevant
- clearer booking and service status exposure
- service confidence signals
- stronger support visibility for reservation issues

## Target Workflows

### Partner onboarding

```text
Invite or register
-> partner_status = PENDING_APPROVAL
-> contract uploaded / signed
-> tax profile completed
-> admin validation
-> partner_status = ACTIVE
```

### Service publication

```text
Partner creates service draft
-> status = DRAFT
-> submit for review
-> status = PENDING_REVIEW
-> admin approves or rejects
-> approved = PUBLISHED
-> rejected = REJECTED
```

### Service suspension

```text
Risk or non-compliance detected
-> service status = SUSPENDED
-> publication blocked
-> moderation note stored
-> partner notified
-> admin can reactivate later
```

### Document and contract handling

```text
Partner uploads document
-> document status = UPLOADED
-> admin reviews
-> validated or rejected
-> partner contract lifecycle updated
```

### Partner revenue and payout

```text
Booking confirmed
-> commission recorded
-> partner net computed
-> payout batch scheduled
-> payout status tracked
-> export available for finance
```

## Functional Architecture Proposal

### New functional modules

- `Partner Compliance`
- `Service Moderation`
- `Finance & Payouts`
- `Audit Log`
- `RBAC Permissions`
- `Trust Signals`

### Core statuses

- partner: `PENDING_APPROVAL`, `PENDING_CONTRACT`, `ACTIVE`, `SUSPENDED`, `CLOSED`
- service: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `PUBLISHED`, `REJECTED`, `SUSPENDED`
- document: `UPLOADED`, `UNDER_REVIEW`, `VALIDATED`, `REJECTED`, `EXPIRED`
- payout: `PENDING`, `SCHEDULED`, `PAID`, `FAILED`, `ON_HOLD`

### Data objects to introduce

- partner documents
- partner tax profile
- partner contract history
- moderation events
- audit log entries
- payout batches
- payout line items
- permission grants or scoped permission rules

### API surfaces to add

- partner compliance read/update
- document upload and review
- moderation queue read/update
- partner revenue and payout read
- audit log read
- permission-aware admin actions

## Roadmap

### Priority High

1. service moderation lifecycle
2. partner compliance and contract center
3. audit log for sensitive actions
4. permission model refinement
5. partner status machine

Impact:

- strong business impact
- strong operations impact
- moderate technical complexity
- high risk reduction

### Priority Medium

1. payout visibility
2. revenue and commission summaries
3. accounting export foundation
4. trust signals on client side
5. moderation dashboard improvements

Impact:

- strong business value
- medium complexity
- good support reduction

### Later

1. multi-tenant white-label
2. advanced tax engine
3. advanced reputation scoring
4. automation around moderation
5. country-specific payout rules

Impact:

- useful but premature
- high complexity
- should wait until governance is stable

## Execution Order

### Phase 1

- formalize partner and service statuses
- define the approval gates
- identify where role checks are not enough

### Phase 2

- build moderation workflow
- add audit trail
- add rejection and suspension reasons

### Phase 3

- build partner compliance workspace
- add document and contract handling
- expose status clearly in admin and partner areas

### Phase 4

- add finance and payout visibility
- prepare exports
- expose commission and net revenue clearly

### Phase 5

- improve client trust signals
- refine support flows
- harden the marketplace for scale

## Definition of Done

The sprint is done only if:

- partner onboarding state is explicit
- service publication is controlled
- moderation actions are traceable
- partner compliance documents are manageable
- sensitive actions are permission-checked
- revenue visibility exists for operations
- reservation and payment flows remain stable

## Decision Gate Before Coding

Before any implementation starts, confirm:

1. the exact status machine
2. the minimal partner compliance fields
3. the minimal moderation dashboard
4. the first permission set to enforce
5. the first finance data exposed to admin and partner

## Recommended Starting Point

Start with:

1. partner lifecycle
2. service moderation lifecycle
3. audit trail

Reason:

- this unlocks the rest
- this reduces support and legal risk
- this is the minimum needed for a scalable marketplace

## Kickoff Backend - First Implementation Slice

### Goal

Prepare the minimum backend foundation for service moderation without disrupting the current booking, Stripe, FareHarbor, or public catalog behavior.

This first slice should be intentionally narrow:

- add explicit service moderation state
- add traceable moderation events
- expose admin/partner API actions for the moderation workflow
- keep existing `is_available` behavior compatible while moderation is introduced

### Status decisions for slice 1

Service moderation statuses:

- `DRAFT`: partner/admin-created service not submitted yet
- `PENDING_REVIEW`: partner submitted the service for admin review
- `APPROVED`: admin approved the service but it is not necessarily public yet
- `PUBLISHED`: admin-approved and visible in the public catalog
- `REJECTED`: admin rejected the submitted service with a reason
- `SUSPENDED`: admin blocked the service after publication/approval

Compatibility rule:

- public visibility remains enforced by `is_available`
- `PUBLISHED` must set `is_available = true`
- `DRAFT`, `PENDING_REVIEW`, `REJECTED`, and `SUSPENDED` must set `is_available = false`
- `APPROVED` should keep `is_available = false` until explicit publication, unless we decide to merge approval and publication later

External service rule:

- services with `source_type = EXTERNAL` can be moderated like any other service
- moderation must not bypass the external booking orchestration
- publication only controls Wandireo visibility, not partner stock ownership

### Data changes

Add columns to `services`:

- `moderation_status` string, default `PUBLISHED` for backwards compatibility
- `moderation_reason` text nullable
- `submitted_for_review_at` timestamp nullable
- `moderated_at` timestamp nullable
- `moderated_by` nullable FK to `users`
- index on `moderation_status`
- index on `moderated_by`

Add table `service_moderation_events`:

- `id`
- `service_id` FK, cascade delete
- `actor_id` nullable FK to `users`, null on delete
- `from_status` nullable string
- `to_status` string
- `action` string
- `reason` text nullable
- `metadata` json nullable
- timestamps

Recommended actions:

- `CREATED`
- `UPDATED`
- `SUBMITTED`
- `APPROVED`
- `PUBLISHED`
- `REJECTED`
- `SUSPENDED`
- `REACTIVATED`

### Backend files likely to touch

- `database/migrations/*_add_service_moderation_fields_to_services_table.php`
- `database/migrations/*_create_service_moderation_events_table.php`
- `app/Models/Service.php`
- `app/Models/ServiceModerationEvent.php`
- `app/Http/Controllers/Api/ServiceController.php`
- `routes/api.php`
- `database/factories/ServiceFactory.php`
- `tests/Feature/ServiceModerationTest.php`
- `tests/Feature/PublicServiceVisibilityTest.php`

### API surface for slice 1

Partner/admin:

- `POST /api/services/{id}/submit-review`

Admin only:

- `GET /api/admin/services/moderation`
- `POST /api/services/{id}/approve`
- `POST /api/services/{id}/publish`
- `POST /api/services/{id}/reject`
- `POST /api/services/{id}/suspend`

Request payloads:

- `reject`: requires `reason`
- `suspend`: requires `reason`
- `approve` and `publish`: optional `reason`
- `submit-review`: optional `reason`

Response should return the refreshed service plus latest moderation metadata.

### Authorization rules for slice 1

- partner can submit only their own service
- partner cannot approve, publish, reject, or suspend
- admin can perform all moderation actions
- public users can only see `is_available = true` services
- owner partner and admin can still see hidden services as today

### Lifecycle rules for slice 1

Creation:

- partner-created local service starts as `DRAFT` and `is_available = false`
- admin-created service may start as `PUBLISHED` when explicitly created as available, otherwise `DRAFT`
- imported/external sync can continue defaulting to visible behavior unless that sync path is deliberately changed in a later slice

Submit:

- allowed from `DRAFT` or `REJECTED`
- sets `PENDING_REVIEW`
- sets `submitted_for_review_at`
- writes event `SUBMITTED`

Approve:

- allowed from `PENDING_REVIEW`
- sets `APPROVED`
- keeps `is_available = false`
- sets moderation fields
- writes event `APPROVED`

Publish:

- allowed from `APPROVED` or `PENDING_REVIEW`
- sets `PUBLISHED`
- sets `is_available = true`
- sets moderation fields
- writes event `PUBLISHED`

Reject:

- allowed from `PENDING_REVIEW`
- sets `REJECTED`
- sets `is_available = false`
- stores reason
- writes event `REJECTED`

Suspend:

- allowed from `APPROVED` or `PUBLISHED`
- sets `SUSPENDED`
- sets `is_available = false`
- stores reason
- writes event `SUSPENDED`

### Tests to write first

Minimum backend tests:

- partner-created service starts as draft and hidden
- partner can submit own draft service for review
- partner cannot submit another partner service
- admin can approve a pending service and an event is stored
- admin can publish an approved service and it becomes public
- admin can reject with reason and service remains hidden
- admin can suspend a published service and it disappears publicly
- partner cannot approve/publish/reject/suspend
- public listing/detail remain restricted to `is_available = true`
- external service moderation does not alter `source_type`, `source_provider`, or external booking fields

Recommended command for targeted verification:

```bash
composer test -- --filter=ServiceModerationTest
composer test -- --filter=PublicServiceVisibilityTest
```

Run the broader safety set before finishing this slice:

```bash
composer test -- --filter=StripeCheckoutTest
composer test -- --filter=ExternalBookingServiceTest
composer test
```

### Progress log

2026-05-17:

- Service moderation backend foundation is implemented in the current working tree:
    - service moderation columns and `service_moderation_events`
    - moderation constants and relations on `Service`
    - partner submit-review action
- admin moderation queue, approve, publish, reject, suspend actions
    - availability guard so unpublished services cannot be made public through legacy update/toggle endpoints
    - public visibility tests updated so `adminAll=true` does not leak hidden services for guests
- Partner compliance documents are implemented in the current working tree:
    - `partner_documents` storage and API endpoints
    - partner upload/list UI on the partner profile page
    - admin review queue on the users page
    - document validation/rejection flow with rejection reason and expiry date
    - API response exposes partner display name as company name, then name/email fallback
- Service moderation UI is implemented in the current working tree:
    - admin services table shows moderation status, reason, and action buttons
    - admin services table can filter by moderation status
    - partner catalog shows moderation status and rejection/suspension reason
    - partner catalog can submit draft/rejected local services for review
    - service CSV export includes moderation status and moderation reason
- Targeted validation already run:
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/PartnerDocumentTest.php`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/ServiceModerationTest.php`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/PublicServiceVisibilityTest.php`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/StripeCheckoutTest.php`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/phpunit tests/Feature/ExternalBookingServiceTest.php`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/pint app/Http/Controllers/Api/PartnerDocumentController.php tests/Feature/PartnerDocumentTest.php --test`
    - `docker run --rm --network wandireo-api_default -v /var/www/wandireo-api:/var/www -w /var/www wandireo-api-app php vendor/bin/pint app/Http/Controllers/Api/ServiceController.php app/Models/Service.php app/Models/ServiceModerationEvent.php database/factories/ServiceFactory.php tests/Feature/ServiceModerationTest.php tests/Feature/PublicServiceVisibilityTest.php --test`
    - `npm run types:check`
    - targeted `npx prettier --check ...` for document and moderation UI files
    - `npm run build` passed after elevated rerun because the sandbox could not remove `public/build/assets`
- Post-commit production/container follow-up:
    - sprint migrations `2026_05_17_000001`, `2026_05_17_000002`, and `2026_05_17_000003` were applied in the Docker app with `php artisan migrate --force`
    - `php artisan optimize:clear` was run in the Docker app after migrations
    - targeted service creation regression was checked with `ServiceModerationTest --filter=partner_created_service_starts_as_draft_and_hidden`
    - partner/client/admin dashboard guards were corrected to avoid `/partenaire` <-> `/mon-espace` redirects when an admin enters the partner area
    - current source does not contain a `fonts.googleapis.com` import; the CSP warning seen in the browser is likely from stale built assets, cache, or an injected extension/script, while the redirect loop was caused by role routing
    - `npm run types:check`, targeted Prettier check, and `npm run build` passed after the dashboard guard fix
- Audit log foundation implemented:
    - `audit_log_entries` table added for generic sensitive-action traceability
    - admin read endpoint added at `GET /api/admin/audit-log`
    - partner document upload/review actions write audit entries
    - partner governance actions write audit entries for creation, status/contract/commission updates, contract upload, and contract signing
    - service moderation creation and status transitions write audit entries in addition to `service_moderation_events`
    - targeted feature coverage added in `AuditLogTest`
    - validation passed: `AuditLogTest`, `PartnerDocumentTest`, `ServiceModerationTest`, `PartnerContractSigningTest`, `AdminUserManagementTest`, and targeted Pint check
    - Docker app image was rebuilt, app container was recreated, migration `2026_05_17_000004` was applied, `optimize:clear` was run, and `GET /api/admin/audit-log` is visible in route list
- Audit log admin UI implemented:
    - admin users page now includes a compact audit feed with category filtering
    - frontend audit API, type, and React Query hook were added
    - document/user/service mutations invalidate the audit log query so admin can see recent governance actions
    - validation passed: `npm run types:check`, targeted Prettier check, and `npm run build`
    - Docker app image was rebuilt and app container recreated after the UI audit feed, with `optimize:clear` run and no pending audit migration
- Permission model refinement implemented:
    - `permission` middleware added for action-level admin checks
    - admins with no `permissions` array keep full legacy access; admins with a permissions array are scoped to `all` or explicit permission keys
    - sensitive endpoints now require dedicated permission keys for audit log, partner governance, partner document review, service moderation, service structure, content, support, reviews, FareHarbor, bookings, and analytics
    - admin user edit can update scoped admin permissions
- Finance visibility foundation implemented:
    - admin finance summary endpoint added at `GET /api/admin/finance/summary`
    - admin finance CSV export endpoint added at `GET /api/admin/finance/export`
    - settlement totals are computed server-side from confirmed, non-refunded bookings
    - commission totals use the booking pricing snapshot when available, with a service/partner commission-rate fallback
    - admin transactions page now consumes backend finance totals and exposes the CSV export action
    - `finance.view` permission key added for finance endpoints
    - validation passed: `AdminBookingOperationsTest`, `AdminPermissionTest`, targeted Pint check, `npm run types:check`, and targeted Prettier check
- Payout readiness foundation implemented:
    - bookings now expose payout workflow fields: `payout_status`, `payout_marked_at`, `payout_marked_by`, and `payout_notes`
    - supported payout statuses are `PENDING`, `ON_HOLD`, `SCHEDULED`, `PAID`, and `FAILED`
    - admin finance summary and CSV export include payout status data
    - admin transactions page can filter by payout status and mark eligible confirmed bookings as blocked or paid
    - payout status changes are audited through `audit_log_entries` with category `finance` and action `PAYOUT_STATUS_UPDATED`
    - validation passed: `AdminBookingOperationsTest`, targeted Pint check, `npm run types:check`, and targeted Prettier check
- Partner finance visibility foundation implemented:
    - partner finance summary endpoint added at `GET /api/partner/finance/summary`
    - partner summary only includes the authenticated partner's confirmed, non-refunded bookings
    - partner totals expose gross volume, commission total, net partner amount, and payout buckets for pending, on-hold, scheduled, paid, and failed payouts
    - partner dashboard now shows read-only finance tracking cards for net partner, receivable, blocked, and paid amounts
    - validation passed: `AdminBookingOperationsTest`, targeted Pint check, `npm run types:check`, and targeted Prettier check
- Partner tax profile foundation implemented:
    - partner accounts now expose fiscal fields for legal company name, tax country, VAT number, business registration number, and billing email
    - partners can maintain these fields from their own profile page
    - non-partner accounts cannot persist partner fiscal fields through `/api/users/me`
    - admin create/update flows can store the same fiscal fields for partner accounts
    - validation passed: `UserProfileApiTest`, targeted Pint check, `npm run types:check`, and targeted Prettier check
- Finance export invoice-readiness implemented:
    - admin finance summary partner rows now include partner fiscal identity fields
    - admin finance CSV export now includes legal company name, tax country, VAT number, business registration number, and billing email
    - admin transactions partner performance table displays the fiscal/billing identity used for settlement preparation
    - validation passed: `AdminBookingOperationsTest`, targeted Pint check, `npm run types:check`, and targeted Prettier check
- Client trust visibility foundation implemented:
    - public service detail API now exposes a computed `partner_trust` summary for the owning partner
    - trust summary includes approved partner state, signed contract state, validated document count, and validated business/tax/insurance document flags
    - public API does not expose partner document records or file paths
    - service detail page now displays simple trust badges for approved partner, signed contract, and verified documents
    - validation passed: `PublicServiceVisibilityTest`, targeted Pint check, `npm run types:check`, targeted Prettier check, and `npm run build`
- Admin compliance visibility implemented:
    - admin users page now shows global partner compliance counters for complete dossiers, partners needing attention, pending documents, and blocking documents
    - each partner card now displays a compact compliance strip derived from partner approval, signed contract state, and reviewed partner documents
    - compliance visibility reuses the existing partner document review API and does not expose new public document data
    - validation passed: `npm run types:check` and targeted Prettier check
- Partner compliance summary implemented:
    - partner profile now shows a compliance score covering account approval, signed contract, fiscal profile completion, and validated documents
    - partner document counts now surface validated, in-review, and blocking documents before the upload form
    - English partner document translations were completed for the existing partner document area
    - validation passed: `npm run types:check` and targeted Prettier check
- Admin operational dashboard improvements implemented:
    - admin dashboard now includes an operational action queue for partner onboarding, unsigned contracts, compliance documents, service moderation, payout attention, pending reviews, and external booking errors
    - each action card routes to the existing admin area responsible for resolving the item
    - queue counts reuse existing admin users, partner documents, services, bookings, and reviews data
    - validation passed: `npm run types:check` and targeted Prettier check
- Admin transaction risk triage implemented:
    - admin transactions page now highlights bookings requiring support or finance action
    - quick risk filters isolate all action-required rows, external provider errors, and blocked/failed payouts
    - risk summary keeps confirmed pending payouts visible while separating them from blocking payout states
    - validation passed: `npm run types:check` and targeted Prettier check
- Admin support button polish implemented:
    - support page actions now use clearer icon+label buttons for creating, viewing, closing, and cancelling tickets
    - support table and modal actions now have dedicated hover/focus styling consistent with the admin surfaces
    - legacy support variant action controls were also polished to avoid inconsistent button treatment if still reached
    - validation passed: `npm run types:check`, targeted Prettier check, and `npm run build`
    - Docker app image was rebuilt, app container was recreated, `optimize:clear` was run, and the `app` service is healthy after the final rebuild
- Post-review partner onboarding fixes implemented:
    - admin can store a written mandate contract on partner accounts; approved partners without signature stay on the pending page, read the scrollable contract text, accept it, and then unlock the partner dashboard
    - compliance profile updates refresh the partner profile state immediately, so the 4-step compliance summary follows saved fiscal/company changes without waiting for a full navigation
    - partner document uploads now let Axios set the multipart boundary instead of forcing JSON headers, and upload failures surface backend messages when available
    - partner service form translations were completed for the locale editor text, a direct media upload shortcut was added, and validation scrolls to the first visible form error
    - FareHarbor partner account provisioning now requires a real email from the partner directory, reuses an existing real partner account when present, and stops generating `@partners.wandireo.local` accounts for unknown companies
    - FareHarbor sync failures now persist a readable 404/invalid-slug explanation for admin triage
    - cleanup migrations added for known FareHarbor real emails, safe detachment/removal of unused synthetic accounts, and consolidation of remaining synthetic duplicates that still have historical references
    - default partner mandate contract text now auto-generates when an approved partner has no admin-provided contract text, including existing approved unsigned partners through backfill
    - updating the contract text from admin resets the partner contract to pending signature so the partner must scroll, accept, and sign again before dashboard access
    - validation passed: `PartnerContractSigningTest`, `PartnerDocumentTest`, `FareHarborIntegrationTest`, `UserProfileApiTest`, targeted Pint check, `npm run types:check`, `npm run lint:check`, targeted Prettier check, and `npm run build`

### Non-goals for slice 1

- no automated payout execution yet
- no invoice generation yet
- no advanced reputation or trust scoring yet
- no full RBAC engine yet
- no standalone moderation dashboard beyond the current admin services review controls

### Open decisions after Sprint V2

- whether `APPROVED` should exist separately from `PUBLISHED` long term
- whether external imports should default to `PENDING_REVIEW` or continue auto-publication
- whether partner status names should be migrated from `APPROVED` to `ACTIVE`
- whether service moderation event tables stay service-specific alongside the generic audit log long term
