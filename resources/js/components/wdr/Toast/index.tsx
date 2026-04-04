/**
 * @file Toast/index.tsx
 * @description Point d'entree du systeme de notifications Toast.
 *   Re-exporte le provider, le hook consommateur et tous les types associes.
 *
 * @example
 * // Utilisation dans main.tsx :
 * import { ToastProvider } from '@/components/ui/Toast';
 *
 * // Utilisation dans un composant :
 * import { useToast } from '@/components/ui/Toast';
 */

export { ToastProvider, useToast } from './ToastProvider';
export type {
    ToastType,
    ToastPosition,
    ToastOptions,
    ToastProviderProps,
} from './ToastProvider';
