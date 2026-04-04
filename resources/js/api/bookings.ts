/**
 * @file bookings.ts
 * @description Endpoints de gestion des reservations.
 */

import { normalizeBooking } from '@/lib/api-normalizers';
import type { BookingStatus } from '@/types/booking';
import type { PaymentMode, ServiceExtraInputType } from '@/types/service';
import api from './client';

export interface BookingExtraPayload {
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    inputType: ServiceExtraInputType;
}

export interface CreateBookingRequest {
    serviceId: string;
    startDate: string;
    endDate?: string;
    participants: number;
    paymentMode: PaymentMode;
    selectedExtras?: BookingExtraPayload[];
    extrasTotal?: number;
    notes?: string;
    stripePaymentIntentId?: string;
}

export interface InitBookingResponse {
    clientSecret: string | null;
    bookingDraftId: string;
    amountOnline: number;
    selectedExtras?: Array<{
        id: string;
        name: string;
        unit_price?: number;
        unitPrice?: number;
        quantity: number;
        total_price?: number;
        totalPrice?: number;
        input_type?: ServiceExtraInputType;
        inputType?: ServiceExtraInputType;
    }>;
    extrasTotal?: number;
}

export interface BookingsParams {
    status?: BookingStatus;
    page?: number;
    limit?: number;
    serviceId?: string;
}

export const bookingsApi = {
    init: (data: CreateBookingRequest) =>
        api
            .post<InitBookingResponse>('/bookings/init', data)
            .then((response) => response.data),

    confirm: (data: CreateBookingRequest) =>
        api
            .post<unknown>('/bookings/confirm', data)
            .then((response) => normalizeBooking(response.data)),

    mine: (params?: BookingsParams) =>
        api
            .get<unknown[]>('/bookings/mine', { params })
            .then((response) => response.data.map(normalizeBooking)),

    partnerIncoming: (params?: BookingsParams) =>
        api
            .get<unknown[]>('/bookings/partner-incoming', { params })
            .then((response) => response.data.map(normalizeBooking)),

    adminList: (
        params?: BookingsParams & { clientId?: string; partnerId?: string },
    ) =>
        api
            .get<{ data: unknown[]; total: number }>('/bookings', { params })
            .then((response) => ({
                data: response.data.data.map(normalizeBooking),
                total: response.data.total,
            })),

    updateStatus: (
        id: string,
        status: BookingStatus,
        cancellationReason?: string,
    ) =>
        api
            .patch<unknown>(`/bookings/${id}/status`, {
                status,
                reason: cancellationReason,
            })
            .then((response) => normalizeBooking(response.data)),
};
