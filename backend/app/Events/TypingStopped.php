<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingStopped implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $conversationId;
  public $userId;

  public function __construct($conversationId, $userId)
  {
    $this->conversationId = $conversationId;
    $this->userId = $userId;
  }

  public function broadcastOn()
  {
    return new PresenceChannel('conversation.' . $this->conversationId);
  }

  public function broadcastAs()
  {
    return 'typing.stopped';
  }
}