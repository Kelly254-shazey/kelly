<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingStarted implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $conversationId;
  public $userId;
  public $userName;

  public function __construct($conversationId, $userId, $userName)
  {
    $this->conversationId = $conversationId;
    $this->userId = $userId;
    $this->userName = $userName;
  }

  public function broadcastOn()
  {
    return new PresenceChannel('conversation.' . $this->conversationId);
  }

  public function broadcastAs()
  {
    return 'typing.started';
  }
}