<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdPlacement extends Model
{
  use HasFactory;

  protected $fillable = [
    'campaign_id',
    'placement',
    'ad_content',
    'image_url',
    'video_url',
    'link_url',
    'cpc',
    'cpm'
  ];

  protected $casts = [
    'cpc' => 'decimal:2',
    'cpm' => 'decimal:2'
  ];

  // Relationships
  public function campaign()
  {
    return $this->belongsTo(AdCampaign::class, 'campaign_id');
  }

  public function impressions()
  {
    return $this->hasMany(AdImpression::class, 'placement_id');
  }
}