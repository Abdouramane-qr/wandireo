<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /** GET /api/users/me */
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->formatUser($request->user()));
    }

    /** PATCH /api/users/me */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$user->id}",
            'phone_number' => 'sometimes|nullable|string|max:255',
            'language' => 'sometimes|string|size:2',
            'preferred_currency' => 'sometimes|nullable|string|size:3',
            'company_name' => 'sometimes|nullable|string|max:255',
            'business_address' => 'sometimes|nullable|string|max:255',
        ]);

        if (array_key_exists('first_name', $data) || array_key_exists('last_name', $data)) {
            $parts = preg_split('/\s+/', trim($user->name)) ?: [];
            $firstName = $data['first_name'] ?? ($parts[0] ?? '');
            $lastName = $data['last_name'] ?? trim(implode(' ', array_slice($parts, 1)));
            $data['name'] = trim($firstName.' '.$lastName);
            unset($data['first_name'], $data['last_name']);
        }

        if ($user->role !== 'CLIENT') {
            unset($data['preferred_currency']);
        }

        if ($user->role !== 'PARTNER') {
            unset($data['company_name'], $data['business_address']);
        }

        if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
            $data['email_verified_at'] = null;
        }

        $user->forceFill($data)->save();

        return response()->json($this->formatUser($user->fresh()));
    }

    /** GET /api/users (admin) */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->search) {
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

            $query->where(function ($builder) use ($request, $operator) {
                $builder->where('name', $operator, "%{$request->search}%")
                    ->orWhere('email', $operator, "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->partnerStatus) {
            $query->where('partner_status', $request->partnerStatus);
        }

        $users = $query
            ->withCount(['bookingsAsClient', 'reviews'])
            ->latest()
            ->paginate(50);

        $users->setCollection(
            $users->getCollection()->map(fn (User $user) => $this->formatUser($user))
        );

        return response()->json($users);
    }

    /** POST /api/users/partners (admin) */
    public function adminCreatePartner(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'company_name' => 'required|string|max:255',
            'business_address' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'commission_rate' => 'nullable|numeric|between:0.20,0.30',
            'partner_status' => 'nullable|in:PENDING,APPROVED,REJECTED,SUSPENDED',
            'mandate_contract_status' => 'nullable|in:NOT_SENT,PENDING_SIGNATURE,SIGNED,REJECTED',
            'mandate_contract_file_path' => 'nullable|string|max:255',
        ]);

        $user = $this->createAdminManagedUser(
            $data,
            'PARTNER',
            $request->user()->id,
        );

        $this->auditLogger->record(
            $request,
            'partner_governance',
            'PARTNER_CREATED',
            $user,
            'Admin created partner account.',
            [
                'partner_status' => $user->partner_status,
                'mandate_contract_status' => $user->mandate_contract_status,
                'commission_rate' => $user->commission_rate,
            ],
        );

        return response()->json($this->formatUser($user), 201);
    }

    /** POST /api/users (admin) */
    public function adminCreate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => 'required|in:CLIENT,PARTNER,ADMIN',
            'phone_number' => 'nullable|string|max:255',
            'language' => 'nullable|string|size:2',
            'preferred_currency' => 'nullable|string|size:3',
            'company_name' => 'nullable|string|max:255',
            'business_address' => 'nullable|string|max:255',
            'commission_rate' => 'nullable|numeric|between:0.20,0.30',
            'partner_status' => 'nullable|in:PENDING,APPROVED,REJECTED,SUSPENDED',
            'mandate_contract_status' => 'nullable|in:NOT_SENT,PENDING_SIGNATURE,SIGNED,REJECTED',
            'mandate_contract_file_path' => 'nullable|string|max:255',
        ]);

        if ($data['role'] === 'PARTNER' && empty($data['company_name'])) {
            return response()->json([
                'message' => 'company_name is required for partner accounts.',
                'errors' => [
                    'company_name' => ['Le nom de societe est obligatoire pour un partenaire.'],
                ],
            ], 422);
        }

        $user = $this->createAdminManagedUser(
            $data,
            $data['role'],
            $request->user()->id,
        );

        $this->auditLogger->record(
            $request,
            $user->role === 'PARTNER' ? 'partner_governance' : 'user_governance',
            'USER_CREATED',
            $user,
            'Admin created user account.',
            [
                'role' => $user->role,
                'partner_status' => $user->partner_status,
                'mandate_contract_status' => $user->mandate_contract_status,
            ],
        );

        return response()->json($this->formatUser($user), 201);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createAdminManagedUser(array $data, string $role, int|string $adminId): User
    {
        $partnerStatus = $data['partner_status'] ?? 'PENDING';
        $mandateStatus = $data['mandate_contract_status'] ?? 'NOT_SENT';
        $isPartner = $role === 'PARTNER';

        return User::create([
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $role,
            'partner_status' => $isPartner ? $partnerStatus : 'APPROVED',
            'partner_validated_at' => $isPartner && $partnerStatus === 'APPROVED' ? now() : null,
            'partner_validated_by' => $isPartner && $partnerStatus === 'APPROVED' ? $adminId : null,
            'company_name' => $isPartner ? ($data['company_name'] ?? null) : null,
            'business_address' => $isPartner ? ($data['business_address'] ?? null) : null,
            'phone_number' => $data['phone_number'] ?? null,
            'language' => $data['language'] ?? 'fr',
            'preferred_currency' => $role === 'CLIENT' ? ($data['preferred_currency'] ?? null) : null,
            'commission_rate' => $isPartner ? ($data['commission_rate'] ?? 0.20) : 0.15,
            'mandate_contract_status' => $isPartner ? $mandateStatus : 'NOT_SENT',
            'mandate_contract_file_path' => $isPartner ? ($data['mandate_contract_file_path'] ?? null) : null,
            'mandate_signed_at' => $isPartner && $mandateStatus === 'SIGNED' ? now() : null,
            'onboarding_completed_at' => $isPartner && $partnerStatus === 'APPROVED' && $mandateStatus === 'SIGNED' ? now() : null,
        ]);
    }

    /** PATCH /api/users/{id} (admin) */
    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $original = $user->only([
            'role',
            'partner_status',
            'partner_rejection_reason',
            'mandate_contract_status',
            'commission_rate',
            'stripe_connected_account_id',
        ]);
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$user->id}",
            'phone_number' => 'sometimes|nullable|string|max:255',
            'language' => 'sometimes|nullable|string|size:2',
            'preferred_currency' => 'sometimes|nullable|string|size:3',
            'company_name' => 'sometimes|nullable|string|max:255',
            'commission_rate' => 'sometimes|numeric|between:0.20,0.30',
            'role' => 'sometimes|in:CLIENT,PARTNER,ADMIN',
            'partner_status' => 'sometimes|in:PENDING,APPROVED,REJECTED,SUSPENDED',
            'partner_rejection_reason' => 'sometimes|nullable|string',
            'stripe_connected_account_id' => 'sometimes|nullable|string|max:255',
            'business_address' => 'sometimes|nullable|string|max:255',
            'mandate_contract_status' => 'sometimes|in:NOT_SENT,PENDING_SIGNATURE,SIGNED,REJECTED',
            'mandate_contract_file_path' => 'sometimes|nullable|string|max:255',
        ]);

        if (array_key_exists('first_name', $data) || array_key_exists('last_name', $data)) {
            $firstName = $data['first_name'] ?? explode(' ', $user->name)[0] ?? '';
            $lastName = $data['last_name'] ?? trim(implode(' ', array_slice(explode(' ', $user->name), 1)));
            $data['name'] = trim($firstName.' '.$lastName);
        }

        if (array_key_exists('partner_status', $data)) {
            if ($data['partner_status'] === 'APPROVED') {
                $data['partner_validated_at'] = now();
                $data['partner_validated_by'] = $request->user()->id;
                $data['partner_rejection_reason'] = null;
            } elseif (in_array($data['partner_status'], ['REJECTED', 'SUSPENDED'], true)) {
                $data['partner_validated_at'] = null;
                $data['partner_validated_by'] = null;
            }
        }

        if (array_key_exists('mandate_contract_status', $data)) {
            $data['mandate_signed_at'] = $data['mandate_contract_status'] === 'SIGNED' ? now() : null;
        }

        $nextPartnerStatus = $data['partner_status'] ?? $user->partner_status;
        $nextMandateStatus = $data['mandate_contract_status'] ?? $user->mandate_contract_status;
        $data['onboarding_completed_at'] = $nextPartnerStatus === 'APPROVED' && $nextMandateStatus === 'SIGNED'
            ? now()
            : null;

        $nextRole = $data['role'] ?? $user->role;

        if ($nextRole !== 'PARTNER') {
            $data['partner_status'] = null;
            $data['partner_validated_at'] = null;
            $data['partner_validated_by'] = null;
            $data['partner_rejection_reason'] = null;
            $data['mandate_contract_status'] = null;
            $data['mandate_contract_file_path'] = null;
            $data['mandate_signed_at'] = null;
            $data['onboarding_completed_at'] = null;
            $data['company_name'] = null;
            $data['business_address'] = null;
            $data['stripe_connected_account_id'] = null;
            $data['commission_rate'] = null;
        }

        if ($nextRole !== 'CLIENT') {
            $data['preferred_currency'] = null;
        }

        if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
            $data['email_verified_at'] = null;
        }

        $user->forceFill($data)->save();

        if (
            $user->role === 'PARTNER'
            && array_key_exists('commission_rate', $data)
            && is_numeric($data['commission_rate'])
        ) {
            Service::query()
                ->where('partner_id', $user->id)
                ->update([
                    'commission_rate' => (float) $data['commission_rate'],
                ]);
        }

        $freshUser = $user->fresh();
        $trackedChanges = [];

        foreach ($original as $field => $fromValue) {
            $toValue = $freshUser->{$field};

            if ((string) $fromValue !== (string) $toValue) {
                $trackedChanges[$field] = [
                    'from' => $fromValue,
                    'to' => $toValue,
                ];
            }
        }

        if ($trackedChanges !== []) {
            $this->auditLogger->record(
                $request,
                $freshUser->role === 'PARTNER' ? 'partner_governance' : 'user_governance',
                'USER_UPDATED',
                $freshUser,
                'Admin updated sensitive user governance fields.',
                [
                    'changes' => $trackedChanges,
                ],
            );
        }

        return response()->json($this->formatUser($freshUser));
    }

    /** POST /api/users/{id}/contract/mark-signed (admin) */
    public function adminMarkContractSigned(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($response = $this->ensurePartnerContractCanBeAdminMarkedAsSigned($user)) {
            return $response;
        }

        $user->update($this->buildSignedContractUpdatePayload($user));

        $this->auditLogger->record(
            $request,
            'partner_governance',
            'CONTRACT_MARKED_SIGNED',
            $user,
            'Admin marked partner contract as signed.',
            [
                'partner_id' => $user->id,
                'mandate_contract_status' => 'SIGNED',
            ],
        );

        return response()->json($this->formatUser($user->fresh()));
    }

    /** POST /api/users/{id}/contract (admin) */
    public function adminUploadContract(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'contract' => 'required|file|mimes:pdf|max:10240',
        ]);

        $storedPath = $data['contract']->store(
            "contracts/partners/{$user->id}",
            'public'
        );

        $updates = [
            'mandate_contract_file_path' => Storage::disk('public')->url($storedPath),
        ];

        if (in_array($user->mandate_contract_status, ['NOT_SENT', null], true)) {
            $updates['mandate_contract_status'] = 'PENDING_SIGNATURE';
        }

        $user->update($updates);

        $this->auditLogger->record(
            $request,
            'partner_governance',
            'CONTRACT_UPLOADED',
            $user,
            'Admin uploaded partner contract.',
            [
                'partner_id' => $user->id,
                'mandate_contract_status' => $updates['mandate_contract_status'] ?? $user->mandate_contract_status,
            ],
        );

        return response()->json($this->formatUser($user->fresh()));
    }

    /** POST /api/partner/contract/sign */
    public function partnerSignContract(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'accepted' => 'accepted',
        ]);

        if ($response = $this->ensurePartnerContractCanBeSigned($user)) {
            return $response;
        }

        $user->update($this->buildSignedContractUpdatePayload($user));

        $this->auditLogger->record(
            $request,
            'partner_governance',
            'CONTRACT_SIGNED',
            $user,
            'Partner signed mandate contract.',
            [
                'partner_id' => $user->id,
                'mandate_contract_status' => 'SIGNED',
            ],
        );

        return response()->json($this->formatUser($user->fresh()));
    }

    private function formatUser(User $user): array
    {
        $parts = explode(' ', $user->name);

        return [
            'id' => $user->id,
            'firstName' => $parts[0] ?? '',
            'lastName' => implode(' ', array_slice($parts, 1)),
            'email' => $user->email,
            'role' => $user->role,
            'partnerStatus' => $user->partner_status,
            'partnerValidatedAt' => $user->partner_validated_at,
            'partnerRejectionReason' => $user->partner_rejection_reason,
            'mandateContractStatus' => $user->mandate_contract_status,
            'mandateContractFilePath' => $user->mandate_contract_file_path,
            'mandateSignedAt' => $user->mandate_signed_at,
            'onboardingCompletedAt' => $user->onboarding_completed_at,
            'phoneNumber' => $user->phone_number,
            'language' => $user->language,
            'profilePicture' => $user->profile_picture,
            'preferredCurrency' => $user->preferred_currency,
            'companyName' => $user->company_name,
            'stripeConnectedAccountId' => $user->stripe_connected_account_id,
            'businessAddress' => $user->business_address,
            'commissionRate' => $user->commission_rate,
            'totalSales' => $user->total_sales,
            'permissions' => $user->permissions ?? [],
            'managedLanguages' => $user->managed_languages ?? [],
            'managedLocations' => $user->managed_locations ?? [],
            'bookingsCount' => $user->bookings_as_client_count ?? 0,
            'reviewsCount' => $user->reviews_count ?? 0,
            'createdAt' => $user->created_at,
            'updatedAt' => $user->updated_at,
        ];
    }

    private function ensurePartnerContractCanBeSigned(User $user): ?JsonResponse
    {
        if (! $user->isPartner()) {
            return response()->json([
                'message' => 'Only partner accounts can sign a mandate contract.',
            ], 422);
        }

        if (! $user->mandate_contract_file_path) {
            return response()->json([
                'message' => 'A contract PDF must be uploaded before signature.',
                'errors' => [
                    'mandate_contract_file_path' => ['A contract PDF must be uploaded before signature.'],
                ],
            ], 422);
        }

        return null;
    }

    private function ensurePartnerContractCanBeAdminMarkedAsSigned(User $user): ?JsonResponse
    {
        if (! $user->isPartner()) {
            return response()->json([
                'message' => 'Only partner accounts can have a mandate contract marked as signed.',
            ], 422);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildSignedContractUpdatePayload(User $user): array
    {
        return [
            'mandate_contract_status' => 'SIGNED',
            'mandate_signed_at' => now(),
            'onboarding_completed_at' => $user->partner_status === 'APPROVED'
                ? now()
                : null,
        ];
    }
}
