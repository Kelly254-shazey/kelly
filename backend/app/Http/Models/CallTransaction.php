<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallTransaction extends Model
{
  use HasFactory;

  protected $fillable = [
    'call_id',
    'user_id',
    'amount',
    'type',
    'description',
    'status'
  ];

  protected $casts = [
    'amount' => 'decimal:2'
  ];

  public function call()
  {
    return $this->belongsTo(VideoCall::class, 'call_id');
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}