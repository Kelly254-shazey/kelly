<?php
// app/Models/StreamMessage.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StreamMessage extends Model
{
  use HasFactory;

  protected $fillable = ['stream_id', 'user_id', 'content'];

  public function stream()
  {
    return $this->belongsTo(LiveStream::class, 'stream_id');
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}