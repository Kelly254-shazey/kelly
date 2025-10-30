// database/migrations/2024_01_01_000024_create_conversation_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('conversation_users', function (Blueprint $table) {
      $table->id();
      $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->enum('role', ['member', 'admin'])->default('member');
      $table->timestamp('joined_at')->useCurrent();
      $table->timestamps();

      $table->unique(['conversation_id', 'user_id']);
    });
  }

  public function down()
  {
    Schema::dropIfExists('conversation_users');
  }
};