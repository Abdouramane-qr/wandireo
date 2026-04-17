<?php

use App\Support\Locale;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetSecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        if (! config('services.fareharbor.autosync_enabled')) {
            return;
        }

        $event = $schedule
            ->command('fareharbor:sync-all')
            ->withoutOverlapping()
            ->onOneServer()
            ->timezone((string) config('services.fareharbor.autosync_timezone', 'UTC'));

        match (config('services.fareharbor.autosync_frequency', 'hourly')) {
            'everyThirtyMinutes' => $event->everyThirtyMinutes(),
            'everySixHours' => $event->everySixHours(),
            'daily' => $event->daily(),
            default => $event->hourly(),
        };
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function (Request $request): string {
            $locale = Locale::negotiateFromRequest($request);

            return route('login', ['locale' => $locale], false);
        });

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'locale']);
        $middleware->statefulApi();

        $middleware->alias(['role' => EnsureRole::class]);

        $middleware->throttleApi();

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetSecurityHeaders::class,
        ]);

        $middleware->api(append: [
            SetLocale::class,
            SetSecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Rapport Sentry (uniquement si le SDK est installé et le DSN configuré)
        if (class_exists(\Sentry\Laravel\Integration::class)) {
            \Sentry\Laravel\Integration::handles($exceptions);
        }
    })->create();
