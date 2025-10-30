<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ad_impressions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('placement_id')->constrained('ad_placements')->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('ip_address');
      $table->text('user_agent');
      $table->decimal('impression_cost', 8, 4)->default(0);
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('ad_impressions');
  }
};