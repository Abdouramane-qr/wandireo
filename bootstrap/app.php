<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetSecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'locale']);
        $middleware->statefulApi();

        $middleware->alias(['role' => EnsureRole::class]);

        $middleware->throttleApi();

        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetSecurityHeaders::class,
        ]);

        $middleware->api(append: [
            SetSecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Rapport Sentry (uniquement si le SDK est installé et le DSN configuré)
        if (class_exists(\Sentry\Laravel\Integration::class)) {
            \Sentry\Laravel\Integration::handles($exceptions);
        }
    })->create();
