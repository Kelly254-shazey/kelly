<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('orders', function (Blueprint $table) {
      $table->id();
      $table->foreignId('product_id')->constrained()->onDelete('cascade');
      $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
      $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
      $table->integer('quantity')->default(1);
      $table->decimal('total_price', 10, 2);
      $table->enum('status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])->default('pending');
      $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('orders');
  }
};