import api from './client';

export interface CheckoutTravelerPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    specialRequests?: string;
}

export interface CheckoutExtraPayload {
    id: string;
    quantity: number;
}

export interface CheckoutRequest {
    serviceId: string;
    startDate: string;
    endDate?: string;
    participants: number;
    paymentMode: string;
    selectedExtras?: CheckoutExtraPayload[];
    extrasTotal?: number;
    notes?: string;
    traveler?: CheckoutTravelerPayload;
}

export interface CheckoutResponse {
    paymentId: number;
    bookingId: string;
    sessionId: string;
    url: string;
}

export interface PaymentSessionStatusResponse {
    id: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    bookingId?: string;
    sessionId: string;
    bookingStatus?: 'AWAITING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
    externalBookingStatus?: string;
    externalBookingReference?: string;
    externalErrorMessage?: string;
}

export const paymentsApi = {
    checkout: (data: CheckoutRequest) =>
        api
            .post<CheckoutResponse>('/checkout', data)
            .then((response) => response.data),

    statusBySession: (sessionId: string) =>
        api
            .get<PaymentSessionStatusResponse>(`/payments/session/${sessionId}`)
            .then((response) => response.data),
};
