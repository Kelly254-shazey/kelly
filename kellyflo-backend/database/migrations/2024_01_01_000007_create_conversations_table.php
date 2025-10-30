<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('conversations', function (Blueprint $table) {
      $table->id();
      $table->foreignId('created_by')->constrained('users');
      $table->string('title')->nullable();
      $table->enum('type', ['direct', 'group'])->default('direct');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('conversations');
  }
};