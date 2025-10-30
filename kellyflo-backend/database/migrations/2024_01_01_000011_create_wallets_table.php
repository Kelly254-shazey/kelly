<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('wallets', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->decimal('balance', 10, 2)->default(0);
      $table->decimal('total_earnings', 10, 2)->default(0);
      $table->decimal('total_spent', 10, 2)->default(0);
      $table->timestamps();

      $table->unique('user_id');
    });
  }

  public function down()
  {
    Schema::dropIfExists('wallets');
  }
};