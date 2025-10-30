<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade');
      $table->enum('type', ['purchase', 'sale', 'withdrawal', 'deposit', 'sponsored_post']);
      $table->decimal('amount', 10, 2);
      $table->decimal('fee', 10, 2)->default(0);
      $table->decimal('net_amount', 10, 2);
      $table->text('description');
      $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('transactions');
  }
};