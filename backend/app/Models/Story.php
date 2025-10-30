<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'media_url',
    'media_type',
    'duration',
    'expires_at',
    'views_count'
  ];

  protected $casts = [
    'expires_at' => 'datetime'
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function views()
  {
    return $this->hasMany(StoryView::class);
  }

  public function scopeActive($query)
  {
    return $query->where('expires_at', '>', now());
  }
}