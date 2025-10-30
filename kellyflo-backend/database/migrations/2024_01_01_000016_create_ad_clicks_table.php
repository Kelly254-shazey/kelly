<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ad_clicks', function (Blueprint $table) {
      $table->id();
      $table->foreignId('impression_id')->constrained('ad_impressions')->onDelete('cascade');
      $table->decimal('click_cost', 8, 2)->default(0);
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('ad_clicks');
  }
};