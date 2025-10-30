<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'user_id',
    'content',
    'media_url',
    'media_type',
    'visibility',
    'likes_count',
    'comments_count',
    'shares_count',
    'is_sponsored',
    'sponsored_until'
  ];

  protected $casts = [
    'sponsored_until' => 'datetime'
  ];

  // Relationships
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function likes()
  {
    return $this->hasMany(PostLike::class);
  }

  public function comments()
  {
    return $this->hasMany(Comment::class);
  }

  public function isLikedBy(User $user)
  {
    return $this->likes()->where('user_id', $user->id)->exists();
  }

  // Scopes
  public function scopeVisibleTo($query, User $user)
  {
    return $query->where(function ($q) use ($user) {
      $q->where('visibility', 'public')
        ->orWhere('user_id', $user->id)
        ->orWhere(function ($q2) use ($user) {
          $q2->where('visibility', 'friends')
            ->whereIn('user_id', $user->friends()->pluck('users.id'));
        });
    });
  }
}