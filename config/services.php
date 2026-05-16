<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key'            => env('STRIPE_KEY', env('STRIPE_PUBLISHABLE_KEY')),
        'secret'         => env('STRIPE_SECRET', env('STRIPE_SECRET_KEY')),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency'       => env('STRIPE_CURRENCY', 'eur'),
        'booking_hold_minutes' => env('STRIPE_BOOKING_HOLD_MINUTES', 30),
    ],

    'geoip' => [
        'country_db_path' => env(
            'GEOIP_COUNTRY_DB_PATH',
            storage_path('app/geoip/GeoLite2-Country.mmdb'),
        ),
    ],

    'fareharbor' => [
        'base_url' => env('FAREHARBOR_BASE_URL', 'https://fareharbor.com/api/v1'),
        'timeout' => env('FAREHARBOR_TIMEOUT', 15),
        'autosync_enabled' => env('FAREHARBOR_AUTOSYNC_ENABLED', false),
        'autosync_frequency' => env('FAREHARBOR_AUTOSYNC_FREQUENCY', 'hourly'),
        'autosync_timezone' => env('FAREHARBOR_AUTOSYNC_TIMEZONE', 'UTC'),
    ],

    'external_bookings' => [
        'dry_run' => env('EXTERNAL_BOOKINGS_DRY_RUN', false),
    ],

    'fast_translate' => [
        'enabled' => env('FAST_TRANSLATE_ENABLED', false),
        'base_url' => env('FAST_TRANSLATE_BASE_URL'),
        'api_key' => env('FAST_TRANSLATE_API_KEY'),
        'timeout' => env('FAST_TRANSLATE_TIMEOUT', 15),
    ],

];
