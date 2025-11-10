<?php
// app/Models/LiveStream.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveStream extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'title',
    'description',
    'stream_key',
    'is_live',
    'viewer_count',
    'started_at',
    'ended_at'
  ];

  protected $casts = [
    'is_live' => 'boolean',
    'started_at' => 'datetime',
    'ended_at' => 'datetime'
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function viewers()
  {
    // StreamViewer uses `stream_id` as the foreign key
    return $this->hasMany(StreamViewer::class, 'stream_id');
  }

  public function messages()
  {
    // StreamMessage uses `stream_id` as the foreign key
    return $this->hasMany(StreamMessage::class, 'stream_id');
  }
}