<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'order_id',
    'type',
    'amount',
    'fee',
    'net_amount',
    'description',
    'status'
  ];

  protected $casts = [
    'amount' => 'decimal:2',
    'fee' => 'decimal:2',
    'net_amount' => 'decimal:2'
  ];

  // Relationships
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function order()
  {
    return $this->belongsTo(Order::class);
  }
}