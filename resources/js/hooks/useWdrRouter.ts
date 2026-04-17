/**
 * @file hooks/useWdrRouter.ts
 * @description Adaptateur de l'ancien router hash Wandireo vers Inertia.js.
 *
 * Expose la même interface que l'ancien useRouter() (navigate({ name, ...params }))
 * mais utilise router.visit() d'Inertia et les noms de routes Laravel.
 *
 * Mapping route name → URL Laravel :
 *   home                    → /
 *   search                  → /recherche
 *   service (id)            → /services/{id}
 *   cart                    → /panier
 *   checkout                → /commande
 *   payment                 → /paiement
 *   confirmation (id)       → /confirmation/{id}
 *   dashboard               → /mon-espace
 *   bookings-history        → /mes-reservations
 *   profile                 → /mon-profil
 *   partner-dashboard       → /partenaire
 *   partner-pending         → /partenaire/validation
 *   partner-catalog         → /partenaire/catalogue
 *   partner-bookings        → /partenaire/reservations
 *   partner-profile         → /partenaire/profil
 *   partner-service-form    → /partenaire/catalogue/form/{id?}
 *   admin-dashboard         → /admin
 *   admin-users             → /admin/utilisateurs
 *   admin-services          → /admin/services
 *   admin-service-structure → /admin/services/structure
 *   admin-service-form      → /admin/services/creation
 *   admin-reviews           → /admin/avis
 *   admin-transactions      → /admin/transactions
 *   admin-blog              → /admin/blog
 *   admin-blog-editor       → /admin/blog/editeur/{id?}
 *   login                   → /connexion
 *   register                → /inscription
 *   partner-register        → /partenaire/inscription
 *   forgot-password         → /mot-de-passe-oublie
 *   terms                   → /conditions-utilisation
 *   privacy                 → /politique-de-confidentialite
 *   legal                   → /mentions-legales
 *   guide                   → /guide
 *   blog                    → /blog
 *   blog-post (slug)        → /blog/{slug}
 *   favorites               → /mes-favoris
 */

import { router } from '@inertiajs/react';
import { localizePath } from '@/lib/locale';

// ─── Types (repris du router hash original) ───────────────────────────────────

export type WdrRoute =
    | { name: 'home' }
    | {
          name: 'search';
          query?: string;
          category?: string;
          dateFrom?: string;
          dateTo?: string;
      }
    | { name: 'service'; id: string }
    | { name: 'cart' }
    | { name: 'checkout' }
    | { name: 'payment' }
    | { name: 'confirmation'; bookingId: string }
    | { name: 'dashboard' }
    | { name: 'bookings-history' }
    | { name: 'profile' }
    | { name: 'partner-dashboard' }
    | { name: 'partner-pending' }
    | { name: 'partner-catalog' }
    | { name: 'partner-bookings' }
    | { name: 'partner-profile' }
    | { name: 'partner-service-form'; serviceId?: string }
    | { name: 'admin-dashboard' }
    | { name: 'admin-users' }
    | { name: 'admin-services' }
    | { name: 'admin-service-structure' }
    | { name: 'admin-service-form'; serviceId?: string }
    | { name: 'admin-reviews' }
    | { name: 'admin-transactions' }
    | { name: 'admin-support' }
    | { name: 'admin-blog' }
    | { name: 'admin-blog-editor'; postId?: string }
    | { name: 'login' }
    | { name: 'register' }
    | { name: 'partner-register' }
    | { name: 'forgot-password' }
    | { name: 'terms' }
    | { name: 'privacy' }
    | { name: 'legal' }
    | { name: 'guide' }
    | { name: 'blog' }
    | { name: 'blog-post'; slug: string }
    | { name: 'favorites' }
    | { name: 'not-found' };

// ─── Résolution route → URL ───────────────────────────────────────────────────

function resolveUrl(wdrRoute: WdrRoute): string {
    switch (wdrRoute.name) {
        case 'home':
            return '/';
        case 'search': {
            const p = new URLSearchParams();

            if (wdrRoute.query) {
p.set('q', wdrRoute.query);
}

            if (wdrRoute.category) {
p.set('category', wdrRoute.category);
}

            if (wdrRoute.dateFrom) {
p.set('dateFrom', wdrRoute.dateFrom);
}

            if (wdrRoute.dateTo) {
p.set('dateTo', wdrRoute.dateTo);
}

            const qs = p.toString();

            return `/recherche${qs ? `?${qs}` : ''}`;
        }
        case 'service':
            return `/services/${wdrRoute.id}`;
        case 'cart':
            return '/panier';
        case 'checkout':
            return '/commande';
        case 'payment':
            return '/paiement';
        case 'confirmation':
            return `/confirmation/${wdrRoute.bookingId}`;
        case 'dashboard':
            return '/mon-espace';
        case 'bookings-history':
            return '/mes-reservations';
        case 'profile':
            return '/mon-profil';
        case 'partner-dashboard':
            return '/partenaire';
        case 'partner-pending':
            return '/partenaire/validation';
        case 'partner-catalog':
            return '/partenaire/catalogue';
        case 'partner-bookings':
            return '/partenaire/reservations';
        case 'partner-profile':
            return '/partenaire/profil';
        case 'partner-service-form':
            return wdrRoute.serviceId
                ? `/partenaire/catalogue/form/${wdrRoute.serviceId}`
                : '/partenaire/catalogue/form';
        case 'admin-dashboard':
            return '/admin';
        case 'admin-users':
            return '/admin/utilisateurs';
        case 'admin-services':
            return '/admin/services';
        case 'admin-service-structure':
            return '/admin/services/structure';
        case 'admin-service-form':
            return wdrRoute.serviceId
                ? `/admin/services/creation/${wdrRoute.serviceId}`
                : '/admin/services/creation';
        case 'admin-reviews':
            return '/admin/avis';
        case 'admin-transactions':
            return '/admin/transactions';
        case 'admin-support':
            return '/admin/support';
        case 'admin-blog':
            return '/admin/blog';
        case 'admin-blog-editor':
            return wdrRoute.postId
                ? `/admin/blog/editeur/${wdrRoute.postId}`
                : '/admin/blog/editeur';
        case 'login':
            return '/connexion';
        case 'register':
            return '/inscription';
        case 'partner-register':
            return '/partenaire/inscription';
        case 'forgot-password':
            return '/mot-de-passe-oublie';
        case 'terms':
            return '/conditions-utilisation';
        case 'privacy':
            return '/politique-de-confidentialite';
        case 'legal':
            return '/mentions-legales';
        case 'guide':
            return '/guide';
        case 'blog':
            return '/blog';
        case 'blog-post':
            return `/blog/${wdrRoute.slug}`;
        case 'favorites':
            return '/mes-favoris';
        case 'not-found':
            return '/404';
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface RouterValue {
    navigate: (route: WdrRoute) => void;
    currentRoute?: WdrRoute;
}

export function useRouter(): RouterValue {
    const navigate = (wdrRoute: WdrRoute): void => {
        const url = localizePath(resolveUrl(wdrRoute)) ?? resolveUrl(wdrRoute);
        router.visit(url);
    };

    return { navigate };
}

// Export du type Route pour la compatibilité avec les pages qui importent Route
export type Route = WdrRoute;
