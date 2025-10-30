<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'balance',
    'total_earnings',
    'total_spent'
  ];

  protected $casts = [
    'balance' => 'decimal:2',
    'total_earnings' => 'decimal:2',
    'total_spent' => 'decimal:2'
  ];

  // Relationships
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  // Methods
  public function canAfford($amount)
  {
    return $this->balance >= $amount;
  }

  public function deposit($amount, $description = 'Deposit')
  {
    $this->balance += $amount;
    $this->save();

    Transaction::create([
      'user_id' => $this->user_id,
      'type' => 'deposit',
      'amount' => $amount,
      'net_amount' => $amount,
      'description' => $description,
      'status' => 'completed'
    ]);
  }

  public function withdraw($amount, $description = 'Withdrawal')
  {
    if (!$this->canAfford($amount)) {
      throw new \Exception('Insufficient balance');
    }

    $this->balance -= $amount;
    $this->total_spent += $amount;
    $this->save();

    Transaction::create([
      'user_id' => $this->user_id,
      'type' => 'withdrawal',
      'amount' => -$amount,
      'net_amount' => -$amount,
      'description' => $description,
      'status' => 'completed'
    ]);

    return true;
  }
}