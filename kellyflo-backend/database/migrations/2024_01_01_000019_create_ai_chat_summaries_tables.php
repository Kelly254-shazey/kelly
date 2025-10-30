<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('ai_chat_summaries', function (Blueprint $table) {
      $table->id();
      $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
      $table->text('summary');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('ai_chat_summaries');
  }
};