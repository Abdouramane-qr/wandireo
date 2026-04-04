import { createInertiaApp } from '@inertiajs/react';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ToastProvider } from '@/components/wdr';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BookingProvider } from '@/context/BookingContext';
import { UserProvider } from '@/context/UserContext';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import 'leaflet/dist/leaflet.css';

const appName = import.meta.env.VITE_APP_NAME || 'Wandireo';
const ReactQueryDevtools = import.meta.env.DEV
    ? lazy(() =>
          import('@tanstack/react-query-devtools').then((module) => ({
              default: module.ReactQueryDevtools,
          })),
      )
    : null;

// Sentry — activé uniquement si VITE_SENTRY_DSN est défini (production)
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.2,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],
    });
}

// React Query client avec les mêmes options que le projet front d'origine
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});

// Pages wandireo qui utilisent leur propre layout (Header/Footer intégrés)
const WDR_PAGES = [
    'home',
    'search',
    'blog/',
    'service/',
    'bookings/',
    'client/',
    'partner/',
    'admin/',
    'static/',
];

const WDR_AUTH_PAGES = ['auth/login', 'auth/register', 'auth/forgot-password'];

function isWdrPage(name: string): boolean {
    return (
        WDR_PAGES.some((prefix) => name.startsWith(prefix)) ||
        WDR_AUTH_PAGES.includes(name)
    );
}

createInertiaApp({
    title: (title) => title || appName,
    layout: (name) => {
        if (isWdrPage(name)) {
return null;
} // Les pages WDR ont leur propre Header/Footer

        if (name === 'welcome') {
return null;
}

        if (name.startsWith('auth/')) {
return AuthLayout;
}

        if (name.startsWith('settings/')) {
return [AppLayout, SettingsLayout];
}

        return AppLayout;
    },
    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        const app = (
            <QueryClientProvider client={queryClient}>
                <StrictMode>
                    <App {...props}>
                        {({ Component, props: pageProps, key }) => (
                            <UserProvider>
                                <BookingProvider>
                                    <ToastProvider>
                                        <TooltipProvider delayDuration={0}>
                                            <Component key={key} {...pageProps} />
                                        </TooltipProvider>
                                    </ToastProvider>
                                </BookingProvider>
                            </UserProvider>
                        )}
                    </App>
                </StrictMode>
                {ReactQueryDevtools ? (
                    <Suspense fallback={null}>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </Suspense>
                ) : null}
            </QueryClientProvider>
        );

        if (el.hasAttribute('data-server-rendered')) {
            hydrateRoot(el, app);

            return;
        }

        createRoot(el).render(app);
    },
    progress: {
        color: '#0066CC',
    },
});

// Light / dark mode
initializeTheme();
