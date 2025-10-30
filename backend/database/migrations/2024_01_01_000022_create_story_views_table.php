<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('story_views', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->foreignId('story_id')->constrained()->onDelete('cascade');
      $table->timestamps();

      $table->unique(['user_id', 'story_id']);
    });
  }

  public function down()
  {
    Schema::dropIfExists('story_views');
  }
};