<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceShowPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_show_page_exposes_existing_service_hint(): void
    {
        $service = Service::factory()->create();

        $response = $this->get("/services/{$service->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->component('service/show')
            ->where('id', (string) $service->id)
            ->where('serviceExists', true));
    }

    public function test_service_show_page_exposes_missing_service_hint(): void
    {
        $response = $this->get('/services/999999');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('service/show')
            ->where('id', '999999')
            ->where('serviceExists', false));
    }
}
