<?php

use App\Support\PartnerMandateContractText;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'PARTNER')
            ->where('partner_status', 'APPROVED')
            ->whereNull('mandate_signed_at')
            ->where(function ($query): void {
                $query
                    ->whereNull('mandate_contract_text')
                    ->orWhere('mandate_contract_text', '');
            })
            ->orderBy('id')
            ->get(['id', 'company_name'])
            ->each(function (object $partner): void {
                DB::table('users')
                    ->where('id', $partner->id)
                    ->update([
                        'mandate_contract_status' => 'PENDING_SIGNATURE',
                        'mandate_contract_text' => PartnerMandateContractText::default((string) $partner->company_name),
                        'mandate_contract_text_updated_at' => now(),
                        'onboarding_completed_at' => null,
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        // The generated contract text is kept intentionally.
    }
};
