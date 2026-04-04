import React, { createContext, useCallback, useContext, useState } from 'react';
import { bookingsApi } from '@/api/bookings';
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
    initDraft: (draft: BookingDraft) => void;
    saveTravelerInfo: (info: TravelerInfo) => void;
    syncDraftPricing: () => Promise<void>;
    confirmPayment: (stripePaymentIntentId?: string) => Promise<string>;
    clearBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [draft, setDraft] = useState<BookingDraft | null>(null);
    const [travelerInfo, setTravelerInfo] = useState<TravelerInfo | null>(null);
    const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
        null,
    );

    const initDraft = useCallback((newDraft: BookingDraft) => {
        setDraft(newDraft);
        setTravelerInfo(null);
        setConfirmedBooking(null);
    }, []);

    const saveTravelerInfo = useCallback((info: TravelerInfo) => {
        setTravelerInfo(info);
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
        const basePartnerTotal = draft.service.partnerPrice * units;
        const baseCommissionTotal = draft.service.commissionAmount * units;
        const partnerTotal = +(basePartnerTotal + extrasTotal).toFixed(2);
        const commissionTotal = +baseCommissionTotal.toFixed(2);
        const clientTotal = +(partnerTotal + commissionTotal).toFixed(2);
        const amountDueOnline = +response.amountOnline.toFixed(2);
        const amountDueOnSite =
            draft.paymentMode === PaymentModeNames.FULL_CASH_ON_SITE
                ? clientTotal
                : +(clientTotal - amountDueOnline).toFixed(2);

        setDraft((current) =>
            current
                ? {
                      ...current,
                      partnerTotal,
                      commissionTotal,
                      clientTotal,
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

            return confirmed.id;
        },
        [draft, travelerInfo],
    );

    const clearBooking = useCallback(() => {
        setDraft(null);
        setTravelerInfo(null);
        setConfirmedBooking(null);
    }, []);

    return (
        <BookingContext.Provider
            value={{
                draft,
                travelerInfo,
                confirmedBooking,
                initDraft,
                saveTravelerInfo,
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
