<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        @php
            $seo = $seo ?? [];
            $seoTitle = $seo['title'] ?? config('app.name', 'Wandireo');
            $seoDescription = $seo['description'] ?? null;
            $seoCanonical = $seo['canonical'] ?? null;
            $seoImage = $seo['image'] ?? null;
            $seoRobots = $seo['robots'] ?? 'index,follow';
            $seoType = $seo['type'] ?? 'website';
            $seoSiteName = $seo['siteName'] ?? config('app.name', 'Wandireo');
            $twitterCard = $seo['twitterCard'] ?? 'summary_large_image';
        @endphp
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $seoTitle }}</title>
        <meta name="robots" content="{{ $seoRobots }}">
        @if ($seoDescription)
            <meta name="description" content="{{ $seoDescription }}">
        @endif
        @if ($seoCanonical)
            <link rel="canonical" href="{{ $seoCanonical }}">
        @endif
        <meta property="og:type" content="{{ $seoType }}">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:site_name" content="{{ $seoSiteName }}">
        @if ($seoDescription)
            <meta property="og:description" content="{{ $seoDescription }}">
        @endif
        @if ($seoCanonical)
            <meta property="og:url" content="{{ $seoCanonical }}">
        @endif
        @if ($seoImage)
            <meta property="og:image" content="{{ $seoImage }}">
        @endif
        <meta name="twitter:card" content="{{ $twitterCard }}">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        @if ($seoDescription)
            <meta name="twitter:description" content="{{ $seoDescription }}">
        @endif
        @if ($seoImage)
            <meta name="twitter:image" content="{{ $seoImage }}">
        @endif
        @if (! empty($seo['publishedTime']))
            <meta property="article:published_time" content="{{ $seo['publishedTime'] }}">
        @endif
        @if (! empty($seo['modifiedTime']))
            <meta property="article:modified_time" content="{{ $seo['modifiedTime'] }}">
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script nonce="{{ $cspNonce }}">
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style nonce="{{ $cspNonce }}">
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
