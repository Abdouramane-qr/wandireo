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

### Main gaps

- no explicit service moderation lifecycle
- no formal partner compliance workspace
- no audit trail for moderation and partner status changes
- no fine-grained permission layer beyond role checks
- no finance/payout/export layer
- no partner-facing revenue/compliance center

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

### Non-goals for slice 1

- no payout/export implementation yet
- no client trust badges yet
- no full RBAC engine yet
- no standalone moderation dashboard beyond the current admin services review controls

### Open decisions after slice 1

- whether `APPROVED` should exist separately from `PUBLISHED` long term
- whether external imports should default to `PENDING_REVIEW` or continue auto-publication
- whether partner status names should be migrated from `APPROVED` to `ACTIVE`
- whether moderation event tables become a generic audit log or stay service-specific
