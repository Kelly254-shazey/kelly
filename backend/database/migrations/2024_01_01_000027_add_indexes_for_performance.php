<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::table('live_streams', function (Blueprint $table) {
      // Add indexes using Laravel's methods
      $table->index('user_id');
      $table->index('status');
      $table->index('scheduled_start_time');
      $table->index(['status', 'scheduled_start_time']);
      $table->index(['user_id', 'status']);
    });

    // Add indexes to other tables as needed
    Schema::table('users', function (Blueprint $table) {
      $table->index('email');
      $table->index('created_at');
    });

    Schema::table('products', function (Blueprint $table) {
      $table->index('user_id');
      $table->index('status');
      $table->index(['user_id', 'status']);
    });
  }

  public function down()
  {
    Schema::table('live_streams', function (Blueprint $table) {
      $table->dropIndex(['user_id']);
      $table->dropIndex(['status']);
      $table->dropIndex(['scheduled_start_time']);
      $table->dropIndex(['status', 'scheduled_start_time']);
      $table->dropIndex(['user_id', 'status']);
    });

    Schema::table('users', function (Blueprint $table) {
      $table->dropIndex(['email']);
      $table->dropIndex(['created_at']);
    });

    Schema::table('products', function (Blueprint $table) {
      $table->dropIndex(['user_id']);
      $table->dropIndex(['status']);
      $table->dropIndex(['user_id', 'status']);
    });
  }
};