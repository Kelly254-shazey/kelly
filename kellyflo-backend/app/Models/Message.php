<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
  use HasFactory;

  protected $fillable = [
    'conversation_id',
    'user_id',
    'content',
    'message_type',
    'read_at',
    'reply_to',
    'file_url',
    'file_name',
    'file_size'
  ];

  protected $casts = [
    'read_at' => 'datetime'
  ];

  // Relationships
  public function conversation()
  {
    return $this->belongsTo(Conversation::class);
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function replyTo()
  {
    return $this->belongsTo(Message::class, 'reply_to');
  }

  public function reactions()
  {
    return $this->hasMany(MessageReaction::class);
  }

  // Scopes
  public function scopeUnread($query)
  {
    return $query->whereNull('read_at');
  }

  public function scopeForUser($query, $userId)
  {
    return $query->whereHas('conversation.users', function ($q) use ($userId) {
      $q->where('users.id', $userId);
    });
  }

  // Methods
  public function markAsRead()
  {
    if (is_null($this->read_at)) {
      $this->update(['read_at' => now()]);
    }
  }

  public function isRead()
  {
    return !is_null($this->read_at);
  }

  public function hasFile()
  {
    return !is_null($this->file_url);
  }

  public function getFileType()
  {
    if (!$this->hasFile())
      return null;

    $extension = pathinfo($this->file_url, PATHINFO_EXTENSION);
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    $audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

    if (in_array($extension, $imageExtensions))
      return 'image';
    if (in_array($extension, $videoExtensions))
      return 'video';
    if (in_array($extension, $audioExtensions))
      return 'audio';

    return 'file';
  }

  public function getFileSizeFormatted()
  {
    if (!$this->file_size)
      return null;

    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = $this->file_size;
    $unit = 0;

    while ($bytes >= 1024 && $unit < count($units) - 1) {
      $bytes /= 1024;
      $unit++;
    }

    return round($bytes, 2) . ' ' . $units[$unit];
  }
}