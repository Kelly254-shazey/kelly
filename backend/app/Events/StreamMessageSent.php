<?php
// app/Events/StreamMessageSent.php
namespace App\Events;

use App\Models\StreamMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StreamMessageSent implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $message;

  public function __construct(StreamMessage $message)
  {
    $this->message = $message;
  }

  public function broadcastOn()
  {
    return new Channel('stream.' . $this->message->stream_id);
  }

  public function broadcastAs()
  {
    return 'message.sent';
  }
}