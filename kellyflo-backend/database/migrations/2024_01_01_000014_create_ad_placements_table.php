<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ad_placements', function (Blueprint $table) {
      $table->id();
      $table->foreignId('campaign_id')->constrained('ad_campaigns')->onDelete('cascade');
      $table->enum('placement', ['feed_top', 'feed_middle', 'feed_bottom', 'sidebar', 'video_pre_roll']);
      $table->text('ad_content');
      $table->string('image_url')->nullable();
      $table->string('video_url')->nullable();
      $table->string('link_url');
      $table->decimal('cpc', 8, 2)->default(0); // Cost per click
      $table->decimal('cpm', 8, 2)->default(0); // Cost per 1000 impressions
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('ad_placements');
  }
};