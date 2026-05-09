<?php

namespace App\Http\Responses;

use App\Support\Locale;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class FortifyLoginResponse implements LoginResponseContract
{
    private function resolveBookingResumeRedirect($request): ?string
    {
        $candidate = $request->string('booking_resume_redirect')->toString();

        if ($candidate === '' || ! str_starts_with($candidate, '/') || str_starts_with($candidate, '//')) {
            return null;
        }

        return $candidate;
    }

    /**
     * Return the role-aware post-login redirect.
     */
    public function toResponse($request)
    {
        $user = $request->user();
        $locale = Locale::negotiateFromRequest($request);
        $resumeTarget = $this->resolveBookingResumeRedirect($request);

        if ($resumeTarget !== null && $user?->role === 'CLIENT') {
            return $request->wantsJson()
                ? response()->json(['two_factor' => false, 'redirect' => $resumeTarget])
                : redirect()->intended($resumeTarget);
        }

        $target = match ($user?->role) {
            'ADMIN' => route('admin.dashboard', ['locale' => $locale], false),
            'PARTNER' => route('partner.dashboard', ['locale' => $locale], false),
            default => route('dashboard', ['locale' => $locale], false),
        };

        return $request->wantsJson()
            ? response()->json(['two_factor' => false, 'redirect' => $target])
            : redirect()->intended($target);
    }
}
