<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallParticipant extends Model
{
  use HasFactory;

  protected $fillable = [
    'call_id',
    'user_id',
    'role',
    'joined_at',
    'left_at',
    'is_muted',
    'is_video_off'
  ];

  protected $casts = [
    'joined_at' => 'datetime',
    'left_at' => 'datetime',
    'is_muted' => 'boolean',
    'is_video_off' => 'boolean'
  ];

  public function call()
  {
    return $this->belongsTo(VideoCall::class, 'call_id');
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function joinCall()
  {
    $this->update(['joined_at' => now()]);
  }

  public function leaveCall()
  {
    $this->update(['left_at' => now()]);
  }
}