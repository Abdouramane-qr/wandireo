<?php

namespace App\Http\Responses;

use App\Support\Locale;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class FortifyRegisterResponse implements RegisterResponseContract
{
    private function resolveBookingResumeRedirect($request): ?string
    {
        $candidate = $request->string('booking_resume_redirect')->toString();

        if ($candidate === '' || ! str_starts_with($candidate, '/') || str_starts_with($candidate, '//')) {
            return null;
        }

        return $candidate;
    }

    public function toResponse($request)
    {
        $locale = Locale::negotiateFromRequest($request);
        $target = $this->resolveBookingResumeRedirect($request)
            ?? route('dashboard', ['locale' => $locale], false);

        return $request->wantsJson()
            ? new JsonResponse(['redirect' => $target], 201)
            : redirect()->intended($target);
    }
}
