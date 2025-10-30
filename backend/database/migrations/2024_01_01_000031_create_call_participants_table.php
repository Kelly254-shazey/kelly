<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('call_participants', function (Blueprint $table) {
      $table->id();
      $table->foreignId('call_id')->constrained('video_calls')->onDelete('cascade');
      $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
      $table->enum('role', ['host', 'participant'])->default('participant');
      $table->timestamp('joined_at')->nullable();
      $table->timestamp('left_at')->nullable();
      $table->boolean('is_muted')->default(false);
      $table->boolean('is_video_off')->default(false);
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('call_participants');
  }
};