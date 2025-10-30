<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('video_calls', function (Blueprint $table) {
      $table->id();
      $table->string('call_id')->unique();
      $table->foreignId('initiator_id')->constrained('users')->onDelete('cascade');
      $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
      $table->enum('call_type', ['audio', 'video', 'conference'])->default('video');
      $table->enum('status', ['calling', 'ongoing', 'ended', 'declined', 'missed'])->default('calling');
      $table->integer('duration')->default(0); // in seconds
      $table->decimal('cost', 8, 2)->default(0); // revenue generated
      $table->json('participants')->nullable(); // for conference calls
      $table->timestamp('started_at')->nullable();
      $table->timestamp('ended_at')->nullable();
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('video_calls');
  }
};