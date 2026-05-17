<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceAttribute;
use App\Models\ServiceCategory;
use App\Models\ServiceSubcategory;
use App\Models\User;
use App\Services\Analytics\ProductAnalyticsTracker;
use App\Services\Audit\AuditLogger;
use App\Services\PartnerContent\PartnerContentProviderRegistry;
use App\Support\Locale;
use Illuminate\Cache\TaggableStore;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    private const CACHE_TTL_SECONDS = 300;

    public function __construct(
        private readonly ProductAnalyticsTracker $analyticsTracker,
        private readonly PartnerContentProviderRegistry $partnerContentProviders,
        private readonly AuditLogger $auditLogger,
    ) {}

    /** GET /api/services */
    public function index(Request $request): JsonResponse
    {
        $query = fn () => $this->buildServiceQuery($request)->paginate($request->integer('limit', 20));

        $this->trackSearchIfEligible($request);

        try {
            return response()->json($query());
        } catch (QueryException) {
            return response()->json(new LengthAwarePaginator([], 0, $request->integer('limit', 20), 1));
        }
    }

    /** GET /api/search */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->string('q')->toString());

        if ($query === '') {
            return response()->json($this->emptySearchResults());
        }

        $searchRequest = Request::create('/api/services', 'GET', [
            'q' => $query,
            'sort' => 'relevance',
            'limit' => 24,
        ]);
        $searchRequest->setUserResolver(fn () => $request->user());

        $services = $this->buildServiceQuery($searchRequest)
            ->limit(24)
            ->get();

        $results = $this->emptySearchResults();

        foreach ($services as $service) {
            $item = [
                'id' => (string) $service->id,
                'title' => (string) $service->title,
                'category' => (string) $service->category,
                'href' => "/services/{$service->id}",
                'image' => data_get($service->images, '0'),
                'location' => implode(', ', array_filter([
                    $service->location_city,
                    $service->location_country,
                ])),
            ];

            match ($service->category) {
                'ACTIVITE' => $results['activities'][] = $item,
                'BATEAU' => $results['boats'][] = $item,
                'HEBERGEMENT' => $results['accommodations'][] = $item,
                'VOITURE' => $results['cars'][] = $item,
                default => null,
            };
        }

        return response()->json($results);
    }

    private function buildServiceQuery(Request $request)
    {
        $query = Service::with(['partner', 'serviceCategory', 'serviceSubcategory']);
        $operator = $this->likeOperator();
        $canSeeHiddenPartnerCatalog = $this->canSeeHiddenPartnerCatalog($request);
        $canUseAdminAll = $request->boolean('adminAll')
            && $request->user()?->role === 'ADMIN';
        $shouldRestrictToPublicCatalog = ! $canUseAdminAll
            && ! $canSeeHiddenPartnerCatalog;

        if ($shouldRestrictToPublicCatalog) {
            $query->where('is_available', true);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->partnerId) {
            $query->where('partner_id', $request->partnerId);
        }

        if ($request->sourceType) {
            $query->where('source_type', $request->sourceType);
        }

        if ($request->destination) {
            $destination = $request->string('destination')->toString();
            $query->where(function ($builder) use ($destination, $operator) {
                $builder->where('location_city', $operator, "%{$destination}%")
                    ->orWhere('location_region', $operator, "%{$destination}%")
                    ->orWhere('location_country', $operator, "%{$destination}%");
            });
        }

        if ($request->q) {
            $search = '%'.$request->string('q')->toString().'%';
            $translatedTitle = $this->translatedColumnExpression('title');
            $translatedDescription = $this->translatedColumnExpression('description');

            $query->where(function ($builder) use ($operator, $search, $translatedDescription, $translatedTitle) {
                $builder->whereRaw("{$translatedTitle} {$operator} ?", [$search])
                    ->orWhere('location_city', $operator, $search)
                    ->orWhere('location_region', $operator, $search)
                    ->orWhere('location_country', $operator, $search)
                    ->orWhereRaw("{$translatedDescription} {$operator} ?", [$search]);
            });
        }

        if ($request->filled('partnerId') && ! $request->filled('q') && ! $request->filled('destination')) {
            $query->orderBy('is_available')->latest('created_at');

            return $query;
        }

        match ($request->get('sort', 'created_at_desc')) {
            'price_asc' => $query->orderBy('client_price'),
            'price_desc' => $query->orderByDesc('client_price'),
            'rating_desc' => $query->orderByDesc('rating'),
            'relevance' => $this->applyRelevanceSort(
                $query,
                $request->string('q')->toString(),
                $request->string('destination')->toString(),
            ),
            default => $this->applyRelevanceSort(
                $query,
                $request->string('q')->toString(),
                $request->string('destination')->toString(),
            ),
        };

        return $query;
    }

    /** GET /api/services/{id} */
    public function show(string $id): JsonResponse
    {
        $serviceModel = Service::with(['partner', 'serviceCategory', 'serviceSubcategory'])
            ->findOrFail($id);

        if (! $serviceModel->is_available && ! $this->canAccessHiddenService(request(), $serviceModel)) {
            abort(404);
        }

        $service = $serviceModel->toArray();

        if (! in_array(request()->user()?->role, ['ADMIN', 'PARTNER'], true)) {
            $this->analyticsTracker->track(request(), 'service_viewed', [
                'service_id' => data_get($service, 'id'),
                'category' => data_get($service, 'category'),
            ]);
        }

        return response()->json($service);
    }

    /** POST /api/services */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required'],
            'description' => ['required'],
            'category' => 'required|in:ACTIVITE,BATEAU,HEBERGEMENT,VOITURE',
            'service_category_id' => 'nullable|integer|exists:service_categories,id',
            'service_subcategory_id' => 'nullable|integer|exists:service_subcategories,id',
            'partner_id' => 'nullable|integer|exists:users,id',
            'partner_price' => 'required|numeric|min:0',
            'commission_rate' => 'nullable|numeric|between:0,1',
            'currency' => 'nullable|string|size:3',
            'pricing_unit' => 'required|string',
            'payment_mode' => 'nullable|string',
            'booking_mode' => 'nullable|in:INSTANT,REQUEST,EXTERNAL_REDIRECT',
            'featured' => 'nullable|boolean',
            'video_url' => 'nullable|url',
            'is_available' => 'nullable|boolean',
            'location_city' => 'required|string',
            'location_country' => 'required|string',
            'location_region' => 'nullable|string',
            'images' => 'nullable|array',
            'tags' => 'nullable|array',
            'extra_data' => 'nullable|array',
        ]);

        $data['title'] = $this->normalizeTranslatablePayload($data['title'], 'title');
        $data['description'] = $this->normalizeTranslatablePayload($data['description'], 'description');

        $this->normalizeStructureReferences($data);
        $this->promoteWandireoPayload($data);
        $this->validateConfiguredAttributes($data);

        if ($request->user()->role === 'ADMIN') {
            $data['partner_id'] = $data['partner_id'] ?? null;
        } else {
            $data['partner_id'] = $request->user()->id;
        }

        $ownerCommissionRate = 0.20;

        if (
            $request->user()->role === 'PARTNER'
            || ($request->user()->role === 'ADMIN' && $data['partner_id'] === $request->user()->id)
        ) {
            $ownerCommissionRate = $request->user()->commission_rate ?? $ownerCommissionRate;
        }

        if ($request->user()->role === 'ADMIN' && ! empty($data['partner_id']) && $data['partner_id'] !== $request->user()->id) {
            $owner = User::find($data['partner_id']);
            $ownerCommissionRate = $owner?->commission_rate ?? $ownerCommissionRate;
        }

        $data['commission_rate'] = $data['commission_rate'] ?? $ownerCommissionRate;
        $data['source_type'] = 'LOCAL';
        $data['moderation_status'] = $this->initialModerationStatus($request);
        $data['is_available'] = $data['moderation_status'] === Service::MODERATION_PUBLISHED;

        $service = Service::create($data);
        $service->refresh();
        $this->recordModerationEvent($service, $request->user(), 'CREATED', null, $service->moderation_status);
        $this->auditLogger->record(
            $request,
            'service_moderation',
            'CREATED',
            $service,
            'Service created.',
            [
                'to_status' => $service->moderation_status,
                'is_available' => $service->is_available,
                'partner_id' => $service->partner_id,
            ],
        );
        $this->flushServicesCache();

        return response()->json($service->load(['partner', 'serviceCategory', 'serviceSubcategory']), 201);
    }

    /** PATCH /api/services/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->ensureCanManageService($request, $service);

        $payload = $request->validate([
            'title' => ['sometimes'],
            'description' => ['sometimes'],
            'category' => 'sometimes|in:ACTIVITE,BATEAU,HEBERGEMENT,VOITURE',
            'service_category_id' => 'sometimes|nullable|integer|exists:service_categories,id',
            'service_subcategory_id' => 'sometimes|nullable|integer|exists:service_subcategories,id',
            'location_city' => 'sometimes|string',
            'location_country' => 'sometimes|string',
            'location_region' => 'sometimes|nullable|string',
            'partner_id' => 'sometimes|nullable|integer|exists:users,id',
            'partner_price' => 'sometimes|numeric|min:0',
            'commission_rate' => 'sometimes|nullable|numeric|between:0,1',
            'pricing_unit' => 'sometimes|string',
            'payment_mode' => 'sometimes|nullable|string',
            'booking_mode' => 'sometimes|in:INSTANT,REQUEST,EXTERNAL_REDIRECT',
            'featured' => 'sometimes|boolean',
            'video_url' => 'sometimes|nullable|url',
            'is_available' => 'sometimes|boolean',
            'images' => 'sometimes|array',
            'tags' => 'sometimes|array',
            'extra_data' => 'sometimes|array',
        ]);

        if (array_key_exists('title', $payload)) {
            $payload['title'] = $this->normalizeTranslatablePayload($payload['title'], 'title');
        }

        if (array_key_exists('description', $payload)) {
            $payload['description'] = $this->normalizeTranslatablePayload($payload['description'], 'description');
        }

        $this->normalizeStructureReferences($payload, $service);
        $this->validateConfiguredAttributes($payload, $service);
        $this->prepareServiceUpdatePayload($request, $service, $payload);
        $this->ensureAvailabilityChangeAllowed($service, $payload);

        $service->update($payload);
        $service->refresh();

        $this->flushServicesCache();

        return response()->json($service->load(['partner', 'serviceCategory', 'serviceSubcategory']));
    }

    /** DELETE /api/services/{id} */
    public function destroy(string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->ensureCanManageService(request(), $service);
        $service->delete();
        $this->flushServicesCache();

        return response()->json(['message' => 'Service supprime.']);
    }

    /** PATCH /api/services/{id}/toggle-availability */
    public function toggleAvailability(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->ensureCanManageService($request, $service);

        $value = $request->has('isAvailable')
            ? $request->boolean('isAvailable')
            : ! $service->is_available;

        $this->ensureAvailabilityChangeAllowed($service, ['is_available' => $value]);

        $service->update(['is_available' => $value]);
        $this->flushServicesCache();

        return response()->json(['isAvailable' => $service->is_available]);
    }

    public function moderationQueue(Request $request): JsonResponse
    {
        $query = Service::with(['partner', 'serviceCategory', 'serviceSubcategory'])
            ->with(['moderationEvents' => fn ($events) => $events->latest()->limit(1)])
            ->latest('updated_at');

        if ($request->filled('status')) {
            $query->where('moderation_status', $request->string('status')->toString());
        } else {
            $query->whereIn('moderation_status', [
                Service::MODERATION_PENDING_REVIEW,
                Service::MODERATION_REJECTED,
                Service::MODERATION_SUSPENDED,
            ]);
        }

        return response()->json($query->paginate($request->integer('limit', 50)));
    }

    public function submitReview(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->ensureCanManageService($request, $service);

        $data = $request->validate([
            'reason' => 'nullable|string|max:5000',
        ]);

        $this->ensureModerationTransitionAllowed($service, [
            Service::MODERATION_DRAFT,
            Service::MODERATION_REJECTED,
        ]);

        $this->transitionServiceModeration(
            $request,
            $service,
            $request->user(),
            'SUBMITTED',
            Service::MODERATION_PENDING_REVIEW,
            $data['reason'] ?? null,
            [
                'is_available' => false,
                'submitted_for_review_at' => now(),
            ],
        );

        return response()->json($this->serviceModerationResponse($service));
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $data = $request->validate([
            'reason' => 'nullable|string|max:5000',
        ]);

        $this->ensureModerationTransitionAllowed($service, [
            Service::MODERATION_PENDING_REVIEW,
        ]);

        $this->transitionServiceModeration(
            $request,
            $service,
            $request->user(),
            'APPROVED',
            Service::MODERATION_APPROVED,
            $data['reason'] ?? null,
            ['is_available' => false],
        );

        return response()->json($this->serviceModerationResponse($service));
    }

    public function publish(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $data = $request->validate([
            'reason' => 'nullable|string|max:5000',
        ]);

        $this->ensureModerationTransitionAllowed($service, [
            Service::MODERATION_APPROVED,
            Service::MODERATION_PENDING_REVIEW,
        ]);

        $this->transitionServiceModeration(
            $request,
            $service,
            $request->user(),
            'PUBLISHED',
            Service::MODERATION_PUBLISHED,
            $data['reason'] ?? null,
            ['is_available' => true],
        );

        return response()->json($this->serviceModerationResponse($service));
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $data = $request->validate([
            'reason' => 'required|string|max:5000',
        ]);

        $this->ensureModerationTransitionAllowed($service, [
            Service::MODERATION_PENDING_REVIEW,
        ]);

        $this->transitionServiceModeration(
            $request,
            $service,
            $request->user(),
            'REJECTED',
            Service::MODERATION_REJECTED,
            $data['reason'],
            ['is_available' => false],
        );

        return response()->json($this->serviceModerationResponse($service));
    }

    public function suspend(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $data = $request->validate([
            'reason' => 'required|string|max:5000',
        ]);

        $this->ensureModerationTransitionAllowed($service, [
            Service::MODERATION_APPROVED,
            Service::MODERATION_PUBLISHED,
        ]);

        $this->transitionServiceModeration(
            $request,
            $service,
            $request->user(),
            'SUSPENDED',
            Service::MODERATION_SUSPENDED,
            $data['reason'],
            ['is_available' => false],
        );

        return response()->json($this->serviceModerationResponse($service));
    }

    private function likeOperator(): string
    {
        return config('database.default') === 'pgsql' ? 'ilike' : 'like';
    }

    /**
     * @return array<string, array<int, array<string, string|null>>>
     */
    private function emptySearchResults(): array
    {
        return [
            'activities' => [],
            'boats' => [],
            'accommodations' => [],
            'cars' => [],
        ];
    }

    private function supportsTaggedCache(): bool
    {
        return Cache::getStore() instanceof TaggableStore;
    }

    private function flushServicesCache(): void
    {
        if ($this->supportsTaggedCache()) {
            Cache::tags(['services'])->flush();

            return;
        }

        Cache::flush();
    }

    private function initialModerationStatus(Request $request): string
    {
        if ($request->user()->role !== 'ADMIN') {
            return Service::MODERATION_DRAFT;
        }

        return $request->boolean('is_available')
            ? Service::MODERATION_PUBLISHED
            : Service::MODERATION_DRAFT;
    }

    /**
     * @param  array<int, string>  $allowedFromStatuses
     */
    private function ensureModerationTransitionAllowed(Service $service, array $allowedFromStatuses): void
    {
        if (! in_array($service->moderation_status, $allowedFromStatuses, true)) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'This moderation action is not allowed from the current service status.',
                    'errors' => [
                        'moderation_status' => [
                            "Current status {$service->moderation_status} cannot use this action.",
                        ],
                    ],
                ], 422)
            );
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function ensureAvailabilityChangeAllowed(Service $service, array $payload): void
    {
        if (! array_key_exists('is_available', $payload) || ! filter_var($payload['is_available'], FILTER_VALIDATE_BOOL)) {
            return;
        }

        if ($service->moderation_status === Service::MODERATION_PUBLISHED) {
            return;
        }

        throw new HttpResponseException(
            response()->json([
                'message' => 'A service must be published through moderation before it can be made public.',
                'errors' => [
                    'is_available' => [
                        'A service must be published through moderation before it can be made public.',
                    ],
                ],
            ], 422)
        );
    }

    /**
     * @param  array<string, mixed>  $extraUpdates
     */
    private function transitionServiceModeration(
        Request $request,
        Service $service,
        ?User $actor,
        string $action,
        string $toStatus,
        ?string $reason = null,
        array $extraUpdates = [],
    ): void {
        $fromStatus = $service->moderation_status;

        $service->forceFill(array_merge([
            'moderation_status' => $toStatus,
            'moderation_reason' => $reason,
            'moderated_at' => now(),
            'moderated_by' => $actor?->id,
        ], $extraUpdates))->save();

        $this->recordModerationEvent($service, $actor, $action, $fromStatus, $toStatus, $reason);
        $this->auditLogger->record(
            $request,
            'service_moderation',
            $action,
            $service,
            'Service moderation status changed.',
            [
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'reason' => $reason,
                'is_available' => $service->is_available,
                'partner_id' => $service->partner_id,
            ],
            $actor,
        );
        $service->refresh();
        $this->flushServicesCache();
    }

    private function recordModerationEvent(
        Service $service,
        ?User $actor,
        string $action,
        ?string $fromStatus,
        string $toStatus,
        ?string $reason = null,
    ): void {
        $service->moderationEvents()->create([
            'actor_id' => $actor?->id,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'action' => $action,
            'reason' => $reason,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serviceModerationResponse(Service $service): array
    {
        $service->load(['partner', 'serviceCategory', 'serviceSubcategory']);

        $payload = $service->toArray();
        $payload['latestModerationEvent'] = $service->moderationEvents()
            ->latest()
            ->first()?->toArray();

        return $payload;
    }

    private function applyRelevanceSort($query, string $search, string $destination): void
    {
        $searchPattern = '%'.trim($search).'%';
        $destinationPattern = '%'.trim($destination).'%';
        $translatedTitle = $this->translatedColumnExpression('title');
        $translatedDescription = $this->translatedColumnExpression('description');

        $query->orderByRaw(
            "(
                CASE WHEN featured = true THEN 120 ELSE 0 END +
                COALESCE(rating, 0) * 18 +
                CASE
                    WHEN COALESCE(review_count, 0) > 40 THEN 40
                    ELSE COALESCE(review_count, 0)
                END +
                CASE WHEN ? <> '' AND {$translatedTitle} {$this->likeOperator()} ? THEN 90 ELSE 0 END +
                CASE WHEN ? <> '' AND location_city {$this->likeOperator()} ? THEN 70 ELSE 0 END +
                CASE WHEN ? <> '' AND {$translatedDescription} {$this->likeOperator()} ? THEN 20 ELSE 0 END +
                CASE WHEN ? <> '' AND location_city {$this->likeOperator()} ? THEN 60 ELSE 0 END +
                CASE WHEN ? <> '' AND location_region {$this->likeOperator()} ? THEN 35 ELSE 0 END +
                CASE WHEN ? <> '' AND location_country {$this->likeOperator()} ? THEN 25 ELSE 0 END
            ) DESC",
            [
                $search,
                $searchPattern,
                $search,
                $searchPattern,
                $search,
                $searchPattern,
                $destination,
                $destinationPattern,
                $destination,
                $destinationPattern,
                $destination,
                $destinationPattern,
            ],
        )->orderBy('client_price')
            ->latest('created_at');
    }

    /**
     * @return array<string, string>
     */
    private function normalizeTranslatablePayload(mixed $value, string $field): array
    {
        if (is_string($value)) {
            $normalized = trim($value);

            if ($normalized === '') {
                throw ValidationException::withMessages([
                    $field => 'At least one valid translation is required.',
                ]);
            }

            return ['fr' => $normalized];
        }

        if (! is_array($value)) {
            throw ValidationException::withMessages([
                $field => 'The field must be a string or a locale map.',
            ]);
        }

        $normalized = [];

        foreach ($value as $locale => $translation) {
            $normalizedLocale = Locale::normalize(is_string($locale) ? $locale : null);

            if ($normalizedLocale === null || ! is_string($translation)) {
                continue;
            }

            $translation = trim($translation);

            if ($translation === '') {
                continue;
            }

            $normalized[$normalizedLocale] = $translation;
        }

        if ($normalized === []) {
            throw ValidationException::withMessages([
                $field => 'At least one valid translation is required.',
            ]);
        }

        return $normalized;
    }

    private function translatedColumnExpression(string $column): string
    {
        $locale = app()->getLocale();
        $fallback = Locale::fallback();

        return match (config('database.default')) {
            'pgsql' => "COALESCE({$column}->>'{$locale}', {$column}->>'{$fallback}', {$column}->>'fr', '')",
            'sqlite' => "COALESCE(json_extract({$column}, '$.\"{$locale}\"'), json_extract({$column}, '$.\"{$fallback}\"'), json_extract({$column}, '$.\"fr\"'), '')",
            default => "COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$column}, '$.\"{$locale}\"')), JSON_UNQUOTE(JSON_EXTRACT({$column}, '$.\"{$fallback}\"')), JSON_UNQUOTE(JSON_EXTRACT({$column}, '$.\"fr\"')), '')",
        };
    }

    private function ensureCanManageService(Request $request, Service $service): void
    {
        if ($service->source_type === 'EXTERNAL') {
            if ($request->user()->role === 'ADMIN') {
                return;
            }

            if ($request->user()->role === 'PARTNER' && $service->partner_id === $request->user()->id) {
                return;
            }

            throw new HttpResponseException(
                response()->json(['message' => 'You can only manage your own services.'], 403)
            );
        }

        if ($request->user()->role === 'PARTNER' && $service->partner_id !== $request->user()->id) {
            throw new HttpResponseException(
                response()->json(['message' => 'You can only manage your own services.'], 403)
            );
        }
    }

    private function canAccessHiddenService(Request $request, Service $service): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->role === 'ADMIN') {
            return true;
        }

        return $user->role === 'PARTNER' && $service->partner_id === $user->id;
    }

    private function canSeeHiddenPartnerCatalog(Request $request): bool
    {
        if (! $request->filled('partnerId')) {
            return false;
        }

        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->role === 'ADMIN') {
            return true;
        }

        return $user->role === 'PARTNER'
            && (string) $request->partnerId === (string) $user->id;
    }

    private function trackSearchIfEligible(Request $request): void
    {
        if (in_array($request->user()?->role, ['ADMIN', 'PARTNER'], true)) {
            return;
        }

        if ($request->boolean('adminAll') || $request->filled('partnerId')) {
            return;
        }

        if (
            ! $request->filled('q')
            && ! $request->filled('category')
            && ! $request->filled('dateFrom')
            && ! $request->filled('dateTo')
        ) {
            return;
        }

        $this->analyticsTracker->track($request, 'search_performed', [
            'query' => $request->string('q')->toString(),
            'category' => $request->string('category')->toString() ?: null,
            'date_from' => $request->string('dateFrom')->toString() ?: null,
            'date_to' => $request->string('dateTo')->toString() ?: null,
        ]);
    }

    private function normalizeStructureReferences(array &$data, ?Service $service = null): void
    {
        $resolvedCategory = null;

        if (array_key_exists('service_category_id', $data) && $data['service_category_id']) {
            $resolvedCategory = ServiceCategory::find($data['service_category_id']);

            if ($resolvedCategory) {
                $data['category'] = $resolvedCategory->service_type;
            } else {
                $data['service_category_id'] = null;
                $data['service_subcategory_id'] = null;
            }
        } elseif ($service?->service_category_id) {
            $resolvedCategory = $service->serviceCategory;
        }

        if (array_key_exists('service_subcategory_id', $data)) {
            if (! $data['service_subcategory_id']) {
                $data['service_subcategory_id'] = null;
            } else {
                $subcategory = ServiceSubcategory::find($data['service_subcategory_id']);
                $expectedCategoryId = $data['service_category_id']
                    ?? $service?->service_category_id
                    ?? $resolvedCategory?->id;

                if (! $subcategory || $subcategory->service_category_id !== (int) $expectedCategoryId) {
                    throw new HttpResponseException(
                        response()->json([
                            'message' => 'La sous-categorie selectionnee ne correspond pas a la categorie.',
                            'errors' => [
                                'service_subcategory_id' => [
                                    'La sous-categorie selectionnee ne correspond pas a la categorie.',
                                ],
                            ],
                        ], 422)
                    );
                }
            }
        }
    }

    private function validateConfiguredAttributes(array &$data, ?Service $service = null): void
    {
        $serviceCategoryId = $data['service_category_id'] ?? $service?->service_category_id;

        if (! $serviceCategoryId) {
            return;
        }

        $category = ServiceCategory::with('attributes.options')->find($serviceCategoryId);

        if (! $category) {
            return;
        }

        $effectiveAttributes = $this->resolveEffectiveAttributes($data, $service);
        $errors = [];

        /** @var ServiceAttribute $attribute */
        foreach ($category->attributes as $attribute) {
            $value = $effectiveAttributes[$attribute->key] ?? null;
            $isEmpty = $value === null || $value === '' || $value === false;

            if ($attribute->is_required && $isEmpty) {
                $errors["extra_data.attributes.{$attribute->key}"] = [
                    "Le champ {$attribute->label} est obligatoire.",
                ];

                continue;
            }

            if ($isEmpty) {
                continue;
            }

            if ($attribute->type === 'select') {
                $allowedValues = $attribute->options->pluck('value')->all();

                if (! in_array((string) $value, $allowedValues, true)) {
                    $errors["extra_data.attributes.{$attribute->key}"] = [
                        "La valeur selectionnee pour {$attribute->label} est invalide.",
                    ];
                }
            }

            if ($attribute->type === 'number' && ! is_numeric($value)) {
                $errors["extra_data.attributes.{$attribute->key}"] = [
                    "Le champ {$attribute->label} doit etre numerique.",
                ];
            }
        }

        if ($errors !== []) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Les attributs dynamiques fournis sont invalides.',
                    'errors' => $errors,
                ], 422)
            );
        }
    }

    private function resolveEffectiveAttributes(array $data, ?Service $service = null): array
    {
        $incomingExtraData = $data['extra_data'] ?? null;

        if (is_array($incomingExtraData)) {
            $incomingWandireoAttributes = data_get($incomingExtraData, 'wandireo.attributes');

            if (is_array($incomingWandireoAttributes)) {
                return $incomingWandireoAttributes;
            }

            if (array_key_exists('attributes', $incomingExtraData)) {
                return is_array($incomingExtraData['attributes'])
                    ? $incomingExtraData['attributes']
                    : [];
            }
        }

        $existingExtraData = $service?->extra_data;

        if (is_array($existingExtraData)) {
            $existingWandireoAttributes = data_get($existingExtraData, 'wandireo.attributes');

            if (is_array($existingWandireoAttributes)) {
                return $existingWandireoAttributes;
            }

            $legacyOverrideAttributes = data_get($existingExtraData, 'fareharbor.overrides.attributes');

            if (is_array($legacyOverrideAttributes)) {
                return $legacyOverrideAttributes;
            }

            if (array_key_exists('attributes', $existingExtraData)) {
                return is_array($existingExtraData['attributes'])
                    ? $existingExtraData['attributes']
                    : [];
            }
        }

        return [];
    }

    private function prepareServiceUpdatePayload(Request $request, Service $service, array &$payload): void
    {
        if ($request->user()->role !== 'ADMIN') {
            unset($payload['partner_id']);
        }

        $existingExtraData = is_array($service->extra_data) ? $service->extra_data : [];
        $this->promoteWandireoPayload($payload, $existingExtraData, $service);

        if ($service->source_type === 'EXTERNAL') {
            $provider = $service->source_provider;
            $overrideKeys = [
                'title',
                'description',
                'service_category_id',
                'service_subcategory_id',
                'location_city',
                'location_country',
                'location_region',
                'partner_price',
                'commission_rate',
                'pricing_unit',
                'payment_mode',
                'booking_mode',
                'featured',
                'video_url',
                'images',
                'tags',
                'is_available',
            ];
            $overrideRootPath = $this->partnerContentProviders->resolve($provider)?->overrideRootPath();
            $existingOverrides = is_string($overrideRootPath) && is_array(data_get($existingExtraData, $overrideRootPath))
                ? data_get($existingExtraData, $overrideRootPath)
                : [];
            $newOverrides = [];

            foreach ($overrideKeys as $key) {
                if (array_key_exists($key, $payload)) {
                    $newOverrides[$key] = $payload[$key];
                }
            }

            if (is_array($payload['extra_data'] ?? null)) {
                foreach ($this->partnerContentProviders->inputStringFields($provider) as $key => $config) {
                    if (! data_get($payload['extra_data'], $key)) {
                        continue;
                    }

                    data_set(
                        $newOverrides,
                        $config['override_path'],
                        $this->normalizeLocalizedExtraDataStringOverride(
                            data_get($payload['extra_data'], $key),
                            data_get($existingOverrides, $config['override_path']),
                        ),
                    );
                    Arr::forget($payload['extra_data'], $key);
                }

                foreach ($this->partnerContentProviders->inputListFields($provider) as $key => $config) {
                    if (! is_array(data_get($payload['extra_data'], $key))) {
                        continue;
                    }

                    data_set(
                        $newOverrides,
                        $config['override_path'],
                        $this->normalizeLocalizedExtraDataListOverride(
                            data_get($payload['extra_data'], $key),
                            data_get($existingOverrides, $config['override_path']),
                        ),
                    );
                    Arr::forget($payload['extra_data'], $key);
                }
            }

            if ($newOverrides !== [] && is_string($overrideRootPath)) {
                data_set(
                    $payload,
                    'extra_data.'.$overrideRootPath,
                    array_replace($existingOverrides, $newOverrides),
                );
            }
        }

        if (array_key_exists('extra_data', $payload)) {
            $payload['extra_data'] = array_replace_recursive($existingExtraData, $payload['extra_data']);

            if (is_array(data_get($payload['extra_data'], 'wandireo.attributes'))) {
                Arr::forget($payload['extra_data'], 'attributes');
            }
        }
    }

    private function promoteWandireoPayload(
        array &$payload,
        array $existingExtraData = [],
        ?Service $service = null,
    ): void {
        $shouldPromote =
            array_key_exists('partner_price', $payload)
            || (array_key_exists('extra_data', $payload) && is_array($payload['extra_data']));

        if (! $shouldPromote) {
            return;
        }

        $incomingExtraData = array_key_exists('extra_data', $payload) && is_array($payload['extra_data'])
            ? $payload['extra_data']
            : [];
        $wandireoData = is_array(data_get($incomingExtraData, 'wandireo'))
            ? data_get($incomingExtraData, 'wandireo')
            : [];

        if (array_key_exists('attributes', $incomingExtraData)) {
            $wandireoData['attributes'] = is_array($incomingExtraData['attributes'])
                ? $incomingExtraData['attributes']
                : [];
        } elseif (! array_key_exists('attributes', $wandireoData)) {
            $existingAttributes = $this->resolveEffectiveAttributes([], $service);

            if ($existingAttributes !== []) {
                $wandireoData['attributes'] = $existingAttributes;
            }
        }

        if (array_key_exists('partner_price', $payload)) {
            $wandireoData['manual_partner_price'] = $payload['partner_price'];
        } elseif (
            $service?->source_type === 'EXTERNAL'
            && ! array_key_exists('manual_partner_price', $wandireoData)
        ) {
            $legacyManualPrice = data_get($existingExtraData, 'wandireo.manual_partner_price');

            if (is_numeric($legacyManualPrice)) {
                $wandireoData['manual_partner_price'] = (float) $legacyManualPrice;
            }
        }

        if ($wandireoData !== []) {
            data_set($incomingExtraData, 'wandireo', $wandireoData);
        }

        Arr::forget($incomingExtraData, 'attributes');
        $payload['extra_data'] = $incomingExtraData;
    }

    /**
     * @return array<string, string>
     */
    private function normalizeLocalizedExtraDataStringOverride(
        mixed $value,
        mixed $existingOverride = null,
    ): array {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return is_array($existingOverride) ? $existingOverride : [];
        }

        $locale = app()->getLocale();
        $existing = is_array($existingOverride) ? $existingOverride : [];
        $existing[$locale] = $normalized;

        return $existing;
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function normalizeLocalizedExtraDataListOverride(
        mixed $value,
        mixed $existingOverride = null,
    ): array {
        $normalized = collect(is_array($value) ? $value : [])
            ->map(fn (mixed $entry): string => is_scalar($entry) ? trim((string) $entry) : '')
            ->filter()
            ->values()
            ->all();

        if ($normalized === []) {
            return is_array($existingOverride) ? $existingOverride : [];
        }

        $locale = app()->getLocale();
        $existing = is_array($existingOverride) ? $existingOverride : [];
        $existing[$locale] = $normalized;

        return $existing;
    }
}
