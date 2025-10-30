<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
  use HasFactory;

  protected $fillable = ['created_by', 'title', 'type'];

  // Relationships
  public function users()
  {
    return $this->belongsToMany(User::class, 'conversation_users')
      ->withTimestamps();
  }

  public function messages()
  {
    return $this->hasMany(Message::class)->latest();
  }

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  public function otherUser(User $user)
  {
    return $this->users()->where('users.id', '!=', $user->id)->first();
  }
}