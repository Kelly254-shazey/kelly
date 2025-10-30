<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdImpression extends Model
{
  use HasFactory;

  protected $fillable = [
    'placement_id',
    'user_id',
    'ip_address',
    'user_agent',
    'impression_cost'
  ];

  protected $casts = [
    'impression_cost' => 'decimal:4'
  ];

  // Relationships
  public function placement()
  {
    return $this->belongsTo(AdPlacement::class, 'placement_id');
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function clicks()
  {
    return $this->hasMany(AdClick::class, 'impression_id');
  }
}