<?php

namespace App\Services\ExternalBookings;

use App\Models\Booking;
use App\Models\Service;

interface ExternalBookingGateway
{
    public function provider(): string;

    public function createBooking(Booking $booking, Service $service): ExternalBookingResult;
}
