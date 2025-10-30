<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'user_id',
    'title',
    'description',
    'price',
    'category',
    'condition',
    'county',
    'location',
    'images',
    'is_sold',
    'views_count'
  ];

  protected $casts = [
    'images' => 'array',
    'price' => 'decimal:2'
  ];

  // Relationships
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function orders()
  {
    return $this->hasMany(Order::class);
  }

  // Scopes
  public function scopeAvailable($query)
  {
    return $query->where('is_sold', false);
  }

  public function scopeInCounty($query, $county)
  {
    return $query->where('county', $county);
  }

  public function scopeInCategory($query, $category)
  {
    return $query->where('category', $category);
  }
}