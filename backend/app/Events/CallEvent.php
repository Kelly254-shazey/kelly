<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $callId;
    public $event;
    public $payload;

    public function __construct(string $callId, string $event, array $payload = [])
    {
        $this->callId = $callId;
        $this->event = $event;
        $this->payload = $payload;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('call.' . $this->callId);
    }

    public function broadcastWith()
    {
        return [
            'event' => $this->event,
            'payload' => $this->payload,
        ];
    }
}
