/**
 * @file bookings.ts
 * @description Endpoints de gestion des reservations.
 */

import { normalizeBooking } from "@/lib/api-normalizers";
import type { BookingStatus, PayoutStatus } from "@/types/booking";
import type { PaymentMode, ServiceExtraInputType } from "@/types/service";
import api from "./client";

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
    requiresStripeCheckout?: boolean;
    pricing?: {
        quantity: number;
        partner_total?: number;
        partner_subtotal?: number;
        partnerSubtotal?: number;
        commission_total?: number;
        commissionTotal?: number;
        client_total?: number;
        clientTotal?: number;
        client_unit_price?: number;
        clientUnitPrice?: number;
    };
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
    paymentStatus?: string;
    payoutStatus?: PayoutStatus;
    externalBookingStatus?: string;
    page?: number;
    limit?: number;
    serviceId?: string;
    clientId?: string;
    partnerId?: string;
    q?: string;
}

export interface AdminFinanceParams {
    partnerId?: string;
    currency?: string;
    dateFrom?: string;
    dateTo?: string;
    payoutStatus?: PayoutStatus;
}

export interface AdminFinanceSummary {
    generated_at: string;
    filters: {
        partner_id: string | null;
        currency: string | null;
        date_from: string | null;
        date_to: string | null;
        payout_status: string | null;
    };
    totals: {
        bookings_count: number;
        gross_volume: number;
        commission_total: number;
        partner_net_total: number;
        online_collected_total: number;
    };
    partners: Array<{
        partner_id: string;
        partner_name: string;
        stripe_connected_account_id: string | null;
        legal_company_name: string | null;
        tax_country: string | null;
        vat_number: string | null;
        business_registration_number: string | null;
        billing_email: string | null;
        bookings_count: number;
        payout_pending_count: number;
        payout_on_hold_count: number;
        payout_scheduled_count: number;
        payout_paid_count: number;
        payout_failed_count: number;
        gross_volume: number;
        commission_total: number;
        partner_net_total: number;
        online_collected_total: number;
        currency: string;
    }>;
}

export interface PartnerFinanceSummary {
    generated_at: string;
    totals: {
        bookings_count: number;
        gross_volume: number;
        commission_total: number;
        partner_net_total: number;
        pending_payout_total: number;
        on_hold_payout_total: number;
        scheduled_payout_total: number;
        paid_payout_total: number;
        failed_payout_total: number;
    };
}

export const bookingsApi = {
    init: (data: CreateBookingRequest) =>
        api
            .post<InitBookingResponse>("/bookings/init", data)
            .then((response) => response.data),

    confirm: (data: CreateBookingRequest) =>
        api
            .post<unknown>("/bookings/confirm", data)
            .then((response) => normalizeBooking(response.data)),

    mine: (params?: BookingsParams) =>
        api
            .get<unknown[]>("/bookings/mine", { params })
            .then((response) => response.data.map(normalizeBooking)),

    partnerIncoming: (params?: BookingsParams) =>
        api
            .get<unknown[]>("/bookings/partner-incoming", { params })
            .then((response) => response.data.map(normalizeBooking)),

    adminList: (params?: BookingsParams) =>
        api
            .get<{ data: unknown[]; total: number }>("/bookings", { params })
            .then((response) => ({
                data: response.data.data.map(normalizeBooking),
                total: response.data.total,
            })),

    adminFinanceSummary: (params?: AdminFinanceParams) =>
        api
            .get<AdminFinanceSummary>("/admin/finance/summary", { params })
            .then((response) => response.data),

    adminFinanceExport: (params?: AdminFinanceParams) =>
        api
            .get<Blob>("/admin/finance/export", {
                params,
                responseType: "blob",
            })
            .then((response) => response.data),

    partnerFinanceSummary: () =>
        api
            .get<PartnerFinanceSummary>("/partner/finance/summary")
            .then((response) => response.data),

    adminUpdatePayoutStatus: (
        id: string,
        payoutStatus: PayoutStatus,
        payoutNotes?: string,
    ) =>
        api
            .patch<unknown>(`/admin/finance/bookings/${id}/payout-status`, {
                payout_status: payoutStatus,
                payout_notes: payoutNotes,
            })
            .then((response) => normalizeBooking(response.data)),

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
