<?php

namespace App\Providers;

use App\Support\Locale;
use App\Services\ExternalBookings\ExternalBookingGatewayRegistry;
use App\Services\ExternalBookings\Gateways\FareHarborExternalBookingGateway;
use App\Services\PartnerContent\PartnerContentProviderRegistry;
use App\Services\PartnerContent\Provider\FareHarborPartnerContentProvider;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\Translatable\Translatable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ExternalBookingGatewayRegistry::class, function ($app) {
            return new ExternalBookingGatewayRegistry([
                $app->make(FareHarborExternalBookingGateway::class),
            ]);
        });

        $this->app->singleton(PartnerContentProviderRegistry::class, function () {
            return new PartnerContentProviderRegistry([
                new FareHarborPartnerContentProvider(),
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureTranslations();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        $this->configureRateLimiting();
        $this->configureUrlGeneration();

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request) => [
            Limit::perMinute(120)->by((string) ($request->user()?->id ?? $request->ip())),
        ]);

        RateLimiter::for('webhooks', fn (Request $request) => [
            Limit::perMinute(120)->by($request->ip()),
        ]);

        RateLimiter::for('uploads', fn (Request $request) => [
            Limit::perMinute(20)->by((string) ($request->user()?->id ?? $request->ip())),
        ]);
    }

    protected function configureUrlGeneration(): void
    {
        URL::defaults([
            'locale' => Locale::default(),
        ]);

        if (app()->isProduction() && str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }

    protected function configureTranslations(): void
    {
        app(Translatable::class)->fallback(
            config('locales.fallback', 'en'),
            true,
        );
    }
}
