<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIChatSummary extends Model
{
  use HasFactory;

  protected $fillable = ['conversation_id', 'summary'];

  public function conversation()
  {
    return $this->belongsTo(Conversation::class);
  }
}