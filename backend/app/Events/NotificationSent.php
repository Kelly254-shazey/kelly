<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $userId;
  public $type;
  public $data;

  public function __construct($userId, $type, $data)
  {
    $this->userId = $userId;
    $this->type = $type;
    $this->data = $data;
  }

  public function broadcastOn()
  {
    return new PresenceChannel('user.' . $this->userId);
  }

  public function broadcastAs()
  {
    return 'notification.sent';
  }
}