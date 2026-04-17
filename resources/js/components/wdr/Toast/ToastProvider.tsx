/**
 * @file Toast/ToastProvider.tsx
 * @description Systeme de notifications ephemeres (Toasts) pour Wandireo.
 *
 *   Architecture :
 *   - ToastContext  : Contexte React partageant les methodes d'affichage.
 *   - ToastProvider : Fournisseur a placer a la racine de l'application.
 *   - useToast      : Hook consommateur pour afficher des toasts depuis n'importe quel composant.
 *
 *   Fonctionnalites :
 *   - 4 types : success, error, warning, info.
 *   - Disparition automatique avec duree configurable (defaut: 4000 ms).
 *   - Barre de progression animee indiquant la duree de vie restante.
 *   - Fermeture manuelle par clic sur le bouton X.
 *   - 5 positions configurables au niveau du provider.
 *   - Rendu via ReactDOM.createPortal pour eviter les conflits z-index.
 */

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "@/hooks/useTranslation";
import "./Toast.css";

/* ============================================================
   Types
   ============================================================ */

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPosition =
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left";

export interface ToastOptions {
    /** Duree d'affichage en millisecondes. 0 = persistant. Par defaut: 4000 */
    duration?: number;
    /** Titre optionnel affiche en gras au-dessus du message */
    title?: string;
}

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
    duration: number;
}

/* ============================================================
   Reducer
   ============================================================ */

type ToastAction =
    | { type: "ADD"; toast: ToastItem }
    | { type: "REMOVE"; id: string };

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
    switch (action.type) {
        case "ADD":
            return [...state, action.toast];
        case "REMOVE":
            return state.filter((t) => t.id !== action.id);
        default:
            return state;
    }
}

/* ============================================================
   Contexte
   ============================================================ */

interface ToastContextValue {
    /** Affiche un toast de succes */
    success: (message: string, options?: ToastOptions) => void;
    /** Affiche un toast d'erreur */
    error: (message: string, options?: ToastOptions) => void;
    /** Affiche un toast d'avertissement */
    warning: (message: string, options?: ToastOptions) => void;
    /** Affiche un toast informatif */
    info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ============================================================
   Icones SVG par type
   ============================================================ */

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
    switch (type) {
        case "success":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            );
        case "error":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        case "warning":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            );
        case "info":
        default:
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            );
    }
};

const ARIA_LIVE: Record<ToastType, "assertive" | "polite"> = {
    success: "polite",
    error: "assertive",
    warning: "assertive",
    info: "polite",
};

/* ============================================================
   Composant Toast individuel
   ============================================================ */

interface SingleToastProps {
    toast: ToastItem;
    onRemove: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = ({ toast, onRemove }) => {
    const { t } = useTranslation();
    const [exiting, setExiting] = useState(false);
    const progressRef = useRef<HTMLDivElement | null>(null);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 200);
    }, [onRemove, toast.id]);

    /* Auto-fermeture si duration > 0 */
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    React.useEffect(() => {
        if (toast.duration <= 0) {
            return;
        }

        timerRef.current = setTimeout(dismiss, toast.duration);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [dismiss, toast.duration]);

    useEffect(() => {
        const progressElement = progressRef.current;

        if (!progressElement || toast.duration <= 0) {
            return;
        }

        const animation = progressElement.animate(
            [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
            {
                duration: toast.duration,
                easing: "linear",
                fill: "forwards",
            },
        );

        return () => animation.cancel();
    }, [toast.duration]);

    const toastClassNames = [
        "wdr-toast",
        `wdr-toast--${toast.type}`,
        exiting ? "wdr-toast--exiting" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            role="status"
            aria-live={ARIA_LIVE[toast.type]}
            aria-atomic="true"
            className={toastClassNames}
        >
            {/* Icone de statut */}
            <span className="wdr-toast__icon">
                <ToastIcon type={toast.type} />
            </span>

            {/* Texte */}
            <div className="wdr-toast__content">
                {toast.title && (
                    <p className="wdr-toast__title">{toast.title}</p>
                )}
                <p className="wdr-toast__message">{toast.message}</p>
            </div>

            {/* Bouton de fermeture manuelle */}
            <button
                className="wdr-toast__close-btn"
                onClick={dismiss}
                aria-label={t("common.close_notification")}
                type="button"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Barre de progression si duree definie */}
            {toast.duration > 0 && (
                <div
                    ref={progressRef}
                    className="wdr-toast__progress"
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

/* ============================================================
   Provider principal
   ============================================================ */

let toastIdCounter = 0;

export interface ToastProviderProps {
    children: React.ReactNode;
    /** Position des toasts. Par defaut: 'top-right' */
    position?: ToastPosition;
    /** Duree par defaut en ms. Par defaut: 4000 */
    defaultDuration?: number;
}

/**
 * Provider a placer a la racine de l'application (ex: dans main.tsx).
 *
 * @example
 * // main.tsx
 * <ToastProvider position="top-right">
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    position = "top-right",
    defaultDuration = 4000,
}) => {
    const { t } = useTranslation();
    const [toasts, dispatch] = useReducer(toastReducer, []);

    const addToast = useCallback(
        (type: ToastType, message: string, options?: ToastOptions) => {
            const id = `wdr-toast-${++toastIdCounter}`;
            const duration =
                options?.duration !== undefined
                    ? options.duration
                    : defaultDuration;
            dispatch({
                type: "ADD",
                toast: { id, type, message, title: options?.title, duration },
            });
        },
        [defaultDuration],
    );

    const removeToast = useCallback((id: string) => {
        dispatch({ type: "REMOVE", id });
    }, []);

    const contextValue: ToastContextValue = {
        success: (msg, opts) => addToast("success", msg, opts),
        error: (msg, opts) => addToast("error", msg, opts),
        warning: (msg, opts) => addToast("warning", msg, opts),
        info: (msg, opts) => addToast("info", msg, opts),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {ReactDOM.createPortal(
                <div
                    className={`wdr-toast-container wdr-toast-container--${position}`}
                    aria-label={t("common.notifications")}
                >
                    {toasts.map((toast) => (
                        <SingleToast
                            key={toast.id}
                            toast={toast}
                            onRemove={removeToast}
                        />
                    ))}
                </div>,
                document.body,
            )}
        </ToastContext.Provider>
    );
};

/* ============================================================
   Hook consommateur
   ============================================================ */

/**
 * Hook pour afficher des notifications toast depuis n'importe quel composant.
 * Doit etre utilise dans un descendant de <ToastProvider>.
 *
 * @example
 * const toast = useToast();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await submitBooking();
 *     toast.success('Reservation confirmee !');
 *   } catch {
 *     toast.error('Une erreur est survenue. Veuillez reessayer.');
 *   }
 * };
 */
export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);

    if (!ctx) {
        throw new Error(
            "[Wandireo] useToast() doit etre utilise a l'interieur d'un <ToastProvider>.",
        );
    }

    return ctx;
}
