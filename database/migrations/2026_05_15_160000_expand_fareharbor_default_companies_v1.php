<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * @var array<int, array{display_name: string, company_slug: string}>
     */
    private array $newCompanies = [
        ['display_name' => 'Albufeira Surf & SUP', 'company_slug' => 'albufeirasurfsup'],
        ['display_name' => 'Algarve Lusitano Horses', 'company_slug' => 'algarvelusitanohorses'],
        ['display_name' => 'Capitão Nemo Algarve', 'company_slug' => 'capitaonemoalgarve'],
        ['display_name' => 'Dolphin Seafaris', 'company_slug' => 'dolphinseafaris'],
        ['display_name' => 'Golden Buggy Adventure Algarve', 'company_slug' => 'goldenbuggyadventurealgarve'],
        ['display_name' => 'Welcome Boat Trips', 'company_slug' => 'welcomeboattrips'],
        ['display_name' => 'Xplore Benagil', 'company_slug' => 'xplorebenagil'],
    ];

    public function up(): void
    {
        $now = now();

        foreach ($this->newCompanies as $company) {
            $exists = DB::table('fareharbor_companies')
                ->where('company_slug', $company['company_slug'])
                ->exists();

            if ($exists) {
                DB::table('fareharbor_companies')
                    ->where('company_slug', $company['company_slug'])
                    ->update([
                        'display_name' => $company['display_name'],
                        'is_enabled' => true,
                        'sync_items_enabled' => true,
                        'sync_details_enabled' => true,
                        'updated_at' => $now,
                    ]);

                continue;
            }

            DB::table('fareharbor_companies')->insert([
                'id' => (string) Str::uuid(),
                'company_slug' => $company['company_slug'],
                'display_name' => $company['display_name'],
                'is_enabled' => true,
                'sync_items_enabled' => true,
                'sync_details_enabled' => true,
                'updated_at' => $now,
                'created_at' => $now,
            ]);
        }

        DB::table('fareharbor_companies')
            ->where('company_slug', 'momentosdinamicos')
            ->update([
                'display_name' => 'Momentos Dinâmicos, Lda.',
                'updated_at' => $now,
            ]);
    }

    public function down(): void
    {
        DB::table('fareharbor_companies')
            ->whereIn(
                'company_slug',
                array_column($this->newCompanies, 'company_slug'),
            )
            ->delete();

        DB::table('fareharbor_companies')
            ->where('company_slug', 'momentosdinamicos')
            ->update([
                'display_name' => 'Momentos Dinamicos',
                'updated_at' => now(),
            ]);
    }
};
