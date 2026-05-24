<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            DB::table('users')
                ->where('role', 'PARTNER')
                ->where('email', 'like', 'fareharbor+%@partners.wandireo.local')
                ->orderBy('id')
                ->get()
                ->groupBy(fn (object $user): string => $this->syntheticGroupKey((string) $user->email))
                ->each(function (Collection $partners): void {
                    if ($partners->count() <= 1) {
                        return;
                    }

                    $keeper = $this->chooseKeeper($partners);

                    $partners
                        ->reject(fn (object $partner): bool => (int) $partner->id === (int) $keeper->id)
                        ->each(fn (object $partner): null => $this->mergePartner((int) $partner->id, (int) $keeper->id));
                });
        });
    }

    public function down(): void
    {
        // Data deduplication is intentionally not reversed.
    }

    private function chooseKeeper(Collection $partners): object
    {
        return $partners
            ->sort(function (object $left, object $right): int {
                $referenceComparison = $this->referenceCount((int) $right->id) <=> $this->referenceCount((int) $left->id);

                return $referenceComparison !== 0
                    ? $referenceComparison
                    : (int) $left->id <=> (int) $right->id;
            })
            ->first();
    }

    private function mergePartner(int $duplicateId, int $keeperId): null
    {
        foreach (['services', 'bookings', 'partner_documents', 'support_tickets', 'fareharbor_companies'] as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)
                    ->where('partner_id', $duplicateId)
                    ->update(['partner_id' => $keeperId]);
            }
        }

        DB::table('users')->where('id', $duplicateId)->delete();

        return null;
    }

    private function referenceCount(int $partnerId): int
    {
        return collect(['services', 'bookings', 'partner_documents', 'support_tickets', 'fareharbor_companies'])
            ->filter(fn (string $table): bool => Schema::hasTable($table))
            ->sum(fn (string $table): int => DB::table($table)->where('partner_id', $partnerId)->count());
    }

    private function syntheticGroupKey(string $email): string
    {
        $local = Str::before(Str::after($email, 'fareharbor+'), '@partners.wandireo.local');

        return preg_replace('/-\d+$/', '', $local) ?: $local;
    }
};
