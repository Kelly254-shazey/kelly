<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ad_campaigns', function (Blueprint $table) {
      $table->id();
      $table->foreignId('advertiser_id')->nullable()->constrained('users')->onDelete('cascade');
      $table->string('title');
      $table->text('description')->nullable();
      $table->enum('ad_type', ['banner', 'interstitial', 'native', 'video']);
      $table->json('target_audience')->nullable();
      $table->decimal('budget', 10, 2);
      $table->decimal('spent', 10, 2)->default(0);
      $table->enum('status', ['active', 'paused', 'completed'])->default('active');
      $table->date('start_date');
      $table->date('end_date');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('ad_campaigns');
  }
};