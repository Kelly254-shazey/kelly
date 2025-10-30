<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ai_recommendations', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->enum('type', ['friend', 'post', 'product', 'community']);
      $table->unsignedBigInteger('recommended_id');
      $table->decimal('score', 3, 2);
      $table->timestamps();

      $table->index(['user_id', 'type']);
    });
  }

  public function down()
  {
    Schema::dropIfExists('ai_recommendations');
  }
};