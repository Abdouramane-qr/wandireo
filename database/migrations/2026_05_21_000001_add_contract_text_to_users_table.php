<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->text('mandate_contract_text')->nullable()->after('mandate_contract_file_path');
            $table->timestamp('mandate_contract_text_updated_at')->nullable()->after('mandate_contract_text');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'mandate_contract_text',
                'mandate_contract_text_updated_at',
            ]);
        });
    }
};
