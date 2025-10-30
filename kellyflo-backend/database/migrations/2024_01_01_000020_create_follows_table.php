<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('stories', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('media_url');
      $table->enum('media_type', ['image', 'video']);
      $table->integer('duration')->default(24);
      $table->timestamp('expires_at');
      $table->unsignedInteger('views_count')->default(0);
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('stories');
  }
};