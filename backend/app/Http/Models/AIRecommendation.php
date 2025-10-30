<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIRecommendation extends Model
{
  use HasFactory;

  protected $fillable = ['user_id', 'type', 'recommended_id', 'score'];

  protected $casts = [
    'score' => 'decimal:2'
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}