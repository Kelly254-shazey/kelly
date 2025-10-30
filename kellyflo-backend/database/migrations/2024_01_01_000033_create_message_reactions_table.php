<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('message_reactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('message_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('reaction', 10); // emoji or text reaction
      $table->timestamps();

      $table->unique(['message_id', 'user_id']);
    });
  }

  public function down()
  {
    Schema::dropIfExists('message_reactions');
  }
};