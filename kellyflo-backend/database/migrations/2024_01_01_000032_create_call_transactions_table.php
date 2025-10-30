<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('call_transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('call_id')->constrained('video_calls')->onDelete('cascade');
      $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
      $table->decimal('amount', 8, 2);
      $table->enum('type', ['call_charge', 'subscription', 'premium_feature']);
      $table->string('description');
      $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('call_transactions');
  }
};