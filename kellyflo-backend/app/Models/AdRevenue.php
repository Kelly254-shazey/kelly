<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdRevenue extends Model
{
  use HasFactory;

  protected $fillable = ['placement_id', 'date', 'impressions', 'clicks', 'revenue'];

  protected $casts = [
    'revenue' => 'decimal:2',
    'date' => 'date'
  ];

  public function placement()
  {
    return $this->belongsTo(AdPlacement::class, 'placement_id');
  }
}