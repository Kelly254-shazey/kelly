<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdCampaign extends Model
{
  use HasFactory;

  protected $fillable = [
    'advertiser_id',
    'title',
    'description',
    'ad_type',
    'target_audience',
    'budget',
    'spent',
    'status',
    'start_date',
    'end_date'
  ];

  protected $casts = [
    'target_audience' => 'array',
    'budget' => 'decimal:2',
    'spent' => 'decimal:2',
    'start_date' => 'date',
    'end_date' => 'date'
  ];

  // Relationships
  public function advertiser()
  {
    return $this->belongsTo(User::class, 'advertiser_id');
  }

  public function placements()
  {
    return $this->hasMany(AdPlacement::class, 'campaign_id');
  }

  // Scopes
  public function scopeActive($query)
  {
    return $query->where('status', 'active')
      ->where('start_date', '<=', now())
      ->where('end_date', '>=', now())
      ->whereRaw('budget > spent');
  }
}