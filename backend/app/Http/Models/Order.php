<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
  use HasFactory;

  protected $fillable = [
    'product_id',
    'buyer_id',
    'seller_id',
    'quantity',
    'total_price',
    'status',
    'payment_status'
  ];

  protected $casts = [
    'total_price' => 'decimal:2'
  ];

  // Relationships
  public function product()
  {
    return $this->belongsTo(Product::class);
  }

  public function buyer()
  {
    return $this->belongsTo(User::class, 'buyer_id');
  }

  public function seller()
  {
    return $this->belongsTo(User::class, 'seller_id');
  }

  public function transactions()
  {
    return $this->hasMany(Transaction::class);
  }
}