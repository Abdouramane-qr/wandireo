import type { Booking } from "@/types/booking";
import type {
    BookingDraft,
    TravelerInfo,
} from "@/context/BookingContext";
import { localizePath, stripLocaleFromPath } from "@/lib/locale";

const STORAGE_KEY = "wandireo-booking-intent-v1";
const STORAGE_VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24;

interface StoredBookingIntent {
    version: number;
    savedAt: string;
    draft: BookingDraft | null;
    travelerInfo: TravelerInfo | null;
    confirmedBooking: Booking | null;
    resumePath: string | null;
    resumeAfterAuth: boolean;
}

export interface BookingIntentState {
    draft: BookingDraft | null;
    travelerInfo: TravelerInfo | null;
    confirmedBooking: Booking | null;
    resumePath: string | null;
    resumeAfterAuth: boolean;
}

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

function isLocalPath(path: string | null | undefined): path is string {
    return Boolean(path) && path!.startsWith("/") && !path!.startsWith("//");
}

function reviveDate(value: unknown): Date | undefined {
    if (typeof value !== "string" || value.trim() === "") {
        return undefined;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date;
}

function reviveDraft(
    draft: BookingDraft | null | undefined,
): BookingDraft | null {
    if (!draft) {
        return null;
    }

    return {
        ...draft,
        service: {
            ...draft.service,
            createdAt: reviveDate(draft.service.createdAt) ?? new Date(),
            updatedAt: reviveDate(draft.service.updatedAt) ?? new Date(),
            lastSyncedAt: reviveDate(draft.service.lastSyncedAt),
        },
    };
}

function reviveBooking(
    booking: Booking | null | undefined,
): Booking | null {
    if (!booking) {
        return null;
    }

    return {
        ...booking,
        createdAt: reviveDate(booking.createdAt) ?? new Date(),
        updatedAt: reviveDate(booking.updatedAt) ?? new Date(),
        startDate: reviveDate(booking.startDate) ?? new Date(),
        endDate: booking.endDate ? reviveDate(booking.endDate) : undefined,
    };
}

function emptyState(): BookingIntentState {
    return {
        draft: null,
        travelerInfo: null,
        confirmedBooking: null,
        resumePath: null,
        resumeAfterAuth: false,
    };
}

export function getStoredBookingIntent(): BookingIntentState {
    if (!isBrowser()) {
        return emptyState();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return emptyState();
    }

    try {
        const parsed = JSON.parse(raw) as StoredBookingIntent;
        const savedAt = reviveDate(parsed.savedAt);

        if (
            parsed.version !== STORAGE_VERSION ||
            !savedAt ||
            Date.now() - savedAt.getTime() > MAX_AGE_MS
        ) {
            window.localStorage.removeItem(STORAGE_KEY);

            return emptyState();
        }

        return {
            draft: reviveDraft(parsed.draft),
            travelerInfo: parsed.travelerInfo ?? null,
            confirmedBooking: reviveBooking(parsed.confirmedBooking),
            resumePath: isLocalPath(parsed.resumePath)
                ? parsed.resumePath
                : null,
            resumeAfterAuth: parsed.resumeAfterAuth === true,
        };
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);

        return emptyState();
    }
}

export function saveStoredBookingIntent(state: BookingIntentState): void {
    if (!isBrowser()) {
        return;
    }

    if (
        !state.draft &&
        !state.travelerInfo &&
        !state.confirmedBooking &&
        !state.resumeAfterAuth
    ) {
        window.localStorage.removeItem(STORAGE_KEY);

        return;
    }

    const payload: StoredBookingIntent = {
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        draft: state.draft,
        travelerInfo: state.travelerInfo,
        confirmedBooking: state.confirmedBooking,
        resumePath: state.resumePath,
        resumeAfterAuth: state.resumeAfterAuth,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredBookingIntent(): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
}

export function getBookingAuthResumePath(): string | undefined {
    const state = getStoredBookingIntent();

    return state.resumeAfterAuth && isLocalPath(state.resumePath)
        ? state.resumePath
        : undefined;
}

export function toComparableBookingPath(path: string): string {
    return stripLocaleFromPath(path).split("#", 1)[0] || "/";
}

export function isBookingTunnelPath(path: string): boolean {
    const comparable = toComparableBookingPath(path);

    return (
        comparable === "/panier" ||
        comparable === "/commande" ||
        comparable === "/paiement"
    );
}

export function isAuthPath(path: string): boolean {
    const comparable = toComparableBookingPath(path);

    return comparable === "/connexion" || comparable === "/inscription";
}

export function isBookingFinalizedPath(path: string): boolean {
    const comparable = toComparableBookingPath(path);

    return (
        comparable === "/paiement/succes" ||
        comparable === "/paiement/annulation" ||
        comparable.startsWith("/confirmation/")
    );
}

export function defaultCartResumePath(): string {
    return localizePath("/panier") ?? "/panier";
}
