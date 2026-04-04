<?php

declare(strict_types=1);

use App\Models\AvailabilitySlot;
use App\Models\Service;
use App\Models\User;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$partner = User::query()
    ->where('email', 'partner.demo1@wandireo.com')
    ->orWhere('role', 'PARTNER')
    ->orderBy('created_at')
    ->first();

if (! $partner) {
    fwrite(STDERR, "Aucun partenaire trouve. Lancez d'abord php scripts/seed_demo_catalog.php\n");
    exit(1);
}

$activities = [
    [
        'title' => 'Croisière grottes de Benagil',
        'description' => 'Croisière premium en petit groupe vers Benagil avec skipper, briefing sécurité et arrêts photo dans les grottes emblématiques de l Algarve.',
        'city' => 'Portimão',
        'country' => 'Portugal',
        'region' => 'Algarve',
        'latitude' => 37.1366,
        'longitude' => -8.5378,
        'partner_price' => 65,
        'images' => [
            '/storage/services/e6833b61-4340-41f5-abc2-50633b460ca3.jpg',
            '/storage/services/ff913be2-60da-4887-a9f4-a489f0ec7bfb.jpg',
            '/storage/services/7867b513-3d14-4f76-9560-021eb52ef608.jpg',
        ],
        'tags' => ['benagil', 'croisière', 'grottes', 'famille'],
        'extra_data' => [
            'activityType' => 'CROISIERE_CULTURELLE',
            'duration' => 3,
            'durationUnit' => 'HEURES',
            'difficulty' => 'TOUS_NIVEAUX',
            'physicalIntensity' => 'FAIBLE',
            'minParticipants' => 1,
            'maxParticipants' => 12,
            'minAgeYears' => 3,
            'requiresMedicalClearance' => false,
            'equipmentProvided' => true,
            'included' => ['Skipper', 'Gilets', 'Boisson', 'Briefing sécurité'],
            'notIncluded' => ['Transfert hôtel'],
            'meetingPoint' => 'Marina de Portimão',
            'schedule' => [
                'startTimes' => ['09:30', '14:30', '17:30'],
                'daysAvailable' => [
                    'LUNDI',
                    'MARDI',
                    'MERCREDI',
                    'JEUDI',
                    'VENDREDI',
                    'SAMEDI',
                    'DIMANCHE',
                ],
            ],
            'languages' => ['fr', 'en', 'pt', 'es'],
            'groupType' => 'GROUPE_PARTAGE',
        ],
    ],
    [
        'title' => 'Randonnée côte sauvage Lagos',
        'description' => 'Randonnée guidée entre falaises et criques de Lagos, idéale pour découvrir la côte sauvage avec pauses panoramiques et itinéraire photo au coucher du soleil.',
        'city' => 'Lagos',
        'country' => 'Portugal',
        'region' => 'Algarve',
        'latitude' => 37.0979,
        'longitude' => -8.6731,
        'partner_price' => 42,
        'images' => [
            '/storage/services/80dbd0db-1358-458e-9854-34d6e52567f0.jpg',
            '/storage/services/3923033e-6531-4c24-a67e-51c65536db22.png',
            '/storage/services/6f735541-745e-448d-8655-8c460cb698c7.png',
        ],
        'tags' => ['randonnée', 'lagos', 'nature', 'sunset'],
        'extra_data' => [
            'activityType' => 'RANDONNEE',
            'duration' => 2,
            'durationUnit' => 'HEURES',
            'difficulty' => 'INTERMEDIAIRE',
            'physicalIntensity' => 'MODEREE',
            'minParticipants' => 1,
            'maxParticipants' => 10,
            'minAgeYears' => 10,
            'requiresMedicalClearance' => false,
            'equipmentProvided' => false,
            'included' => ['Guide local', 'Pause eau', 'Itinéraire photo'],
            'notIncluded' => ['Chaussures de marche'],
            'meetingPoint' => 'Ponta da Piedade',
            'schedule' => [
                'startTimes' => ['08:00', '18:00'],
                'daysAvailable' => [
                    'LUNDI',
                    'MERCREDI',
                    'VENDREDI',
                    'SAMEDI',
                ],
            ],
            'languages' => ['fr', 'en'],
            'groupType' => 'GROUPE_PARTAGE',
        ],
    ],
];

foreach ($activities as $activity) {
    $service = Service::query()->updateOrCreate(
        ['title' => $activity['title']],
        [
            'partner_id' => $partner->id,
            'description' => $activity['description'],
            'category' => 'ACTIVITE',
            'location_city' => $activity['city'],
            'location_country' => $activity['country'],
            'location_region' => $activity['region'],
            'location_latitude' => $activity['latitude'],
            'location_longitude' => $activity['longitude'],
            'images' => $activity['images'],
            'pricing_unit' => 'PAR_PERSONNE',
            'partner_price' => $activity['partner_price'],
            'commission_rate' => $partner->commission_rate ?? 0.18,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'booking_mode' => 'INSTANT',
            'featured' => true,
            'rating' => null,
            'review_count' => 0,
            'is_available' => true,
            'tags' => $activity['tags'],
            'extra_data' => $activity['extra_data'],
            'source_type' => 'LOCAL',
        ],
    );

    for ($day = 2; $day <= 20; $day++) {
        $date = now()->addDays($day)->toDateString();

        AvailabilitySlot::query()->updateOrCreate(
            [
                'service_id' => $service->id,
                'date' => $date,
            ],
            [
                'source_type' => 'MANUAL',
                'is_blocked' => false,
                'slots' => [
                    ['startTime' => '09:00', 'maxCapacity' => 10],
                    ['startTime' => '14:00', 'maxCapacity' => 10],
                ],
            ],
        );
    }
}

echo json_encode([
    'activity_count' => Service::query()->where('category', 'ACTIVITE')->count(),
    'titles' => Service::query()
        ->where('category', 'ACTIVITE')
        ->orderBy('title')
        ->pluck('title'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
