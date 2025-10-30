<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReaction implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $messageId;
  public $userId;
  public $reaction;
  public $action;

  public function __construct($messageId, $userId, $reaction, $action)
  {
    $this->messageId = $messageId;
    $this->userId = $userId;
    $this->reaction = $reaction;
    $this->action = $action;
  }

  public function broadcastOn()
  {
    return new PresenceChannel('message.' . $this->messageId);
  }

  public function broadcastAs()
  {
    return 'reaction.updated';
  }
}