/**
 * @file mockBookings.ts
 * @description Mock des reservations coherentes avec le catalogue Wandireo.
 */

import {
    BookingStatusNames,
    PaymentStatusNames
    
} from '@/types/booking';
import type {Booking} from '@/types/booking';
import { PaymentModeNames } from '@/types/service';

const booking101: Booking = {
    id: 'book_101',
    clientId: 'client_001',
    partnerId: 'partner_001',
    serviceId: 'act_001',
    status: BookingStatusNames.CONFIRMED,
    paymentStatus: PaymentStatusNames.PAID,
    startDate: new Date('2026-04-15T20:30:00'),
    participants: 2,
    unitPrice: 138,
    totalPrice: 276,
    currency: 'EUR',
    stripePaymentIntentId: 'pi_mock_3GxWs3HG01',
    paymentMode: PaymentModeNames.FULL_ONLINE,
    amountPaidOnline: 276,
    notes: 'Merci de confirmer un embarquement cote Tour Eiffel.',
    createdAt: new Date('2026-03-15T09:22:00'),
    updatedAt: new Date('2026-03-16T14:05:00'),
};

const booking102: Booking = {
    id: 'book_102',
    clientId: 'client_001',
    partnerId: 'partner_002',
    serviceId: 'act_003',
    status: BookingStatusNames.CANCELLED,
    paymentStatus: PaymentStatusNames.REFUNDED,
    startDate: new Date('2026-05-20T09:00:00'),
    participants: 3,
    unitPrice: 72.8,
    totalPrice: 218.4,
    currency: 'EUR',
    stripePaymentIntentId: 'pi_mock_7KpRt9FN04',
    paymentMode: PaymentModeNames.FULL_ONLINE,
    amountPaidOnline: 218.4,
    cancellationReason: 'Changement de programme du client.',
    createdAt: new Date('2026-03-22T16:30:00'),
    updatedAt: new Date('2026-03-28T11:00:00'),
};

const booking103: Booking = {
    id: 'book_103',
    clientId: 'client_002',
    partnerId: 'partner_001',
    serviceId: 'act_002',
    status: BookingStatusNames.PENDING,
    paymentStatus: PaymentStatusNames.PENDING,
    startDate: new Date('2026-06-10T07:30:00'),
    participants: 1,
    unitPrice: 322,
    totalPrice: 322,
    currency: 'EUR',
    stripePaymentIntentId: 'pi_mock_2AbQn5CT09',
    paymentMode: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    amountPaidOnline: 42,
    notes: 'Client demande une verification materiel avant depart.',
    createdAt: new Date('2026-03-28T08:45:00'),
    updatedAt: new Date('2026-03-28T08:45:00'),
};

export const mockBookings: Booking[] = [booking101, booking102, booking103];

export const mockBookingsById: Record<string, Booking> = Object.fromEntries(
    mockBookings.map((booking) => [booking.id, booking]),
);

export const mockBookingsByStatus = {
    [BookingStatusNames.PENDING]: mockBookings.filter(
        (booking) => booking.status === BookingStatusNames.PENDING,
    ),
    [BookingStatusNames.CONFIRMED]: mockBookings.filter(
        (booking) => booking.status === BookingStatusNames.CONFIRMED,
    ),
    [BookingStatusNames.CANCELLED]: mockBookings.filter(
        (booking) => booking.status === BookingStatusNames.CANCELLED,
    ),
} as const;

export const mockBookingsByClientId = mockBookings.reduce<
    Record<string, Booking[]>
>((accumulator, booking) => {
    if (!accumulator[booking.clientId]) {
        accumulator[booking.clientId] = [];
    }

    accumulator[booking.clientId].push(booking);

    return accumulator;
}, {});
