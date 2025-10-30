<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdClick extends Model
{
  use HasFactory;

  protected $fillable = ['impression_id', 'click_cost'];

  protected $casts = [
    'click_cost' => 'decimal:2'
  ];

  public function impression()
  {
    return $this->belongsTo(AdImpression::class, 'impression_id');
  }
}