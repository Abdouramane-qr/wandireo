import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { bookingsApi } from '@/api/bookings';
import {
    clearStoredBookingIntent,
    defaultCartResumePath,
    getStoredBookingIntent,
    saveStoredBookingIntent,
} from '@/lib/bookingIntent';
import type { Booking } from '@/types/booking';
import { PaymentModeNames } from '@/types/service';
import type { PaymentMode, Service } from '@/types/service';

export interface BookingExtraSelection {
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    inputType: 'CHECKBOX' | 'REQUIRED';
}

export interface BookingDraft {
    service: Service;
    dateFrom: string;
    dateTo?: string;
    timeSlot?: string;
    participants: number;
    units: number;
    partnerTotal: number;
    commissionTotal: number;
    clientTotal: number;
    currency: string;
    paymentMode: PaymentMode;
    requiresStripeCheckout?: boolean;
    amountDueOnline: number;
    amountDueOnSite: number;
    selectedExtras: BookingExtraSelection[];
    extrasTotal: number;
}

export interface TravelerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    specialRequests: string;
}

interface BookingContextValue {
    draft: BookingDraft | null;
    travelerInfo: TravelerInfo | null;
    confirmedBooking: Booking | null;
    hasPendingAuthResume: boolean;
    initDraft: (draft: BookingDraft) => void;
    saveTravelerInfo: (info: TravelerInfo) => void;
    markAuthResume: (path?: string) => void;
    completeAuthResume: () => void;
    setResumePath: (path: string) => void;
    syncDraftPricing: () => Promise<void>;
    confirmPayment: (stripePaymentIntentId?: string) => Promise<string>;
    clearBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const initialState = useMemo(() => getStoredBookingIntent(), []);
    const [draft, setDraft] = useState<BookingDraft | null>(initialState.draft);
    const [travelerInfo, setTravelerInfo] = useState<TravelerInfo | null>(
        initialState.travelerInfo,
    );
    const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
        initialState.confirmedBooking,
    );
    const [resumePath, setResumePathState] = useState<string | null>(
        initialState.resumePath,
    );
    const [hasPendingAuthResume, setHasPendingAuthResume] = useState(
        initialState.resumeAfterAuth,
    );

    useEffect(() => {
        saveStoredBookingIntent({
            draft,
            travelerInfo,
            confirmedBooking,
            resumePath,
            resumeAfterAuth: hasPendingAuthResume,
        });
    }, [
        confirmedBooking,
        draft,
        hasPendingAuthResume,
        resumePath,
        travelerInfo,
    ]);

    const initDraft = useCallback((newDraft: BookingDraft) => {
        setDraft(newDraft);
        setTravelerInfo(null);
        setConfirmedBooking(null);
        setResumePathState(defaultCartResumePath());
        setHasPendingAuthResume(false);
    }, []);

    const saveTravelerInfo = useCallback((info: TravelerInfo) => {
        setTravelerInfo(info);
    }, []);

    const markAuthResume = useCallback((path?: string) => {
        setResumePathState(path ?? defaultCartResumePath());
        setHasPendingAuthResume(true);
    }, []);

    const completeAuthResume = useCallback(() => {
        setHasPendingAuthResume(false);
    }, []);

    const setResumePath = useCallback((path: string) => {
        setResumePathState(path);
    }, []);

    const syncDraftPricing = useCallback(async (): Promise<void> => {
        if (!draft) {
            throw new Error(
                'BookingContext.syncDraftPricing : aucun brouillon initialise',
            );
        }

        const response = await bookingsApi.init({
            serviceId: draft.service.id,
            startDate: draft.dateFrom,
            endDate: draft.dateTo,
            participants: draft.participants,
            paymentMode: draft.paymentMode,
            selectedExtras: draft.selectedExtras,
            extrasTotal: draft.extrasTotal,
        });

        const serverPartnerTotal =
            response.pricing?.partner_total ??
            response.pricing?.partnerSubtotal ??
            response.pricing?.partner_subtotal;
        const serverCommissionTotal =
            response.pricing?.commission_total ??
            response.pricing?.commissionTotal;
        const serverClientTotal =
            response.pricing?.client_total ?? response.pricing?.clientTotal;

        const normalizedExtras = (response.selectedExtras ?? []).map((extra) => {
            const unitPrice = extra.unit_price ?? extra.unitPrice ?? 0;
            const totalPrice = extra.total_price ?? extra.totalPrice ?? 0;

            return {
                id: extra.id,
                name: extra.name,
                unitPrice,
                quantity: extra.quantity,
                totalPrice,
                inputType:
                    extra.input_type ?? extra.inputType ?? 'CHECKBOX',
            };
        });

        const units = draft.units;
        const extrasTotal =
            response.extrasTotal ??
            normalizedExtras.reduce((sum, extra) => sum + extra.totalPrice, 0);
        const partnerTotal =
            typeof serverPartnerTotal === 'number'
                ? +(serverPartnerTotal + extrasTotal).toFixed(2)
                : +((draft.service.partnerPrice * units) + extrasTotal).toFixed(2);
        const commissionTotal =
            typeof serverCommissionTotal === 'number'
                ? +serverCommissionTotal.toFixed(2)
                : +(draft.service.commissionAmount * units).toFixed(2);
        const clientTotal =
            typeof serverClientTotal === 'number'
                ? +(serverClientTotal + extrasTotal).toFixed(2)
                : +(partnerTotal + commissionTotal).toFixed(2);
        const amountDueOnline = +response.amountOnline.toFixed(2);
        const amountDueOnSite =
            draft.paymentMode === PaymentModeNames.FULL_CASH_ON_SITE
                ? clientTotal
                : +(clientTotal - amountDueOnline).toFixed(2);
        const requiresStripeCheckout =
            response.requiresStripeCheckout ?? amountDueOnline > 0;

        setDraft((current) =>
            current
                ? {
                      ...current,
                      partnerTotal,
                      commissionTotal,
                      clientTotal,
                      requiresStripeCheckout,
                      amountDueOnline,
                      amountDueOnSite,
                      selectedExtras: normalizedExtras,
                      extrasTotal,
                  }
                : current,
        );
    }, [draft]);

    const confirmPayment = useCallback(
        async (stripePaymentIntentId?: string): Promise<string> => {
            if (!draft) {
                throw new Error(
                    'BookingContext.confirmPayment : aucun brouillon initialise',
                );
            }

            const confirmed = await bookingsApi.confirm({
                serviceId: draft.service.id,
                startDate: draft.dateFrom,
                endDate: draft.dateTo,
                participants: draft.participants,
                paymentMode: draft.paymentMode,
                selectedExtras: draft.selectedExtras,
                extrasTotal: draft.extrasTotal,
                notes: [
                    travelerInfo?.specialRequests?.trim(),
                    draft.selectedExtras.length > 0
                        ? `Extras: ${draft.selectedExtras
                              .map((extra) => extra.name)
                              .join(', ')}`
                        : '',
                ]
                    .filter(Boolean)
                    .join(' | ') || undefined,
                stripePaymentIntentId,
            });

            setConfirmedBooking(confirmed);
            setHasPendingAuthResume(false);

            return confirmed.id;
        },
        [draft, travelerInfo],
    );

    const clearBooking = useCallback(() => {
        setDraft(null);
        setTravelerInfo(null);
        setConfirmedBooking(null);
        setResumePathState(null);
        setHasPendingAuthResume(false);
        clearStoredBookingIntent();
    }, []);

    return (
        <BookingContext.Provider
            value={{
                draft,
                travelerInfo,
                confirmedBooking,
                hasPendingAuthResume,
                initDraft,
                saveTravelerInfo,
                markAuthResume,
                completeAuthResume,
                setResumePath,
                syncDraftPricing,
                confirmPayment,
                clearBooking,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
};

export function useBooking(): BookingContextValue {
    const ctx = useContext(BookingContext);

    if (!ctx) {
        throw new Error(
            'useBooking doit etre utilise dans un <BookingProvider>',
        );
    }

    return ctx;
}
