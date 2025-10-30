<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::table('messages', function (Blueprint $table) {
      $table->foreignId('reply_to')->nullable()->constrained('messages')->onDelete('cascade');
      $table->string('file_url')->nullable();
      $table->string('file_name')->nullable();
      $table->integer('file_size')->nullable();
    });
  }

  public function down()
  {
    Schema::table('messages', function (Blueprint $table) {
      $table->dropForeign(['reply_to']);
      $table->dropColumn(['reply_to', 'file_url', 'file_name', 'file_size']);
    });
  }
};