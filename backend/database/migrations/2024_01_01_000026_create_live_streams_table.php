// database/migrations/2024_01_01_000026_create_live_streams_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('live_streams', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('title');
      $table->text('description')->nullable();
      $table->string('stream_key')->unique();
      $table->boolean('is_live')->default(false);
      $table->unsignedInteger('viewer_count')->default(0);
      $table->timestamp('started_at')->nullable();
      $table->timestamp('ended_at')->nullable();
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('live_streams');
  }
};