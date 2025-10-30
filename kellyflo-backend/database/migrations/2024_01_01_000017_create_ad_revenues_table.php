<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ad_revenues', function (Blueprint $table) {
      $table->id();
      $table->foreignId('placement_id')->constrained('ad_placements')->onDelete('cascade');
      $table->date('date');
      $table->unsignedInteger('impressions')->default(0);
      $table->unsignedInteger('clicks')->default(0);
      $table->decimal('revenue', 10, 2)->default(0);
      $table->timestamps();

      $table->unique(['placement_id', 'date']);
    });
  }

  public function down()
  {
    Schema::dropIfExists('ad_revenues');
  }
};