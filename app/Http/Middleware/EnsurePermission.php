<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        foreach ($permissions as $permission) {
            if ($user->canPerform($permission)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Accès refusé. Permission requise : '.implode(' ou ', $permissions).'.',
        ], 403);
    }
}
