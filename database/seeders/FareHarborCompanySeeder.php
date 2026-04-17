<?php

namespace Database\Seeders;

use App\Models\FareHarborCompany;
use App\Support\FareHarborDefaultCompanies;
use Illuminate\Database\Seeder;

class FareHarborCompanySeeder extends Seeder
{
    public function run(): void
    {
        foreach (FareHarborDefaultCompanies::all() as $company) {
            FareHarborCompany::query()->updateOrCreate(
                ['company_slug' => $company['company_slug']],
                [
                    'display_name' => $company['display_name'],
                    'is_enabled' => true,
                    'sync_items_enabled' => true,
                    'sync_details_enabled' => true,
                ],
            );
        }
    }
}
