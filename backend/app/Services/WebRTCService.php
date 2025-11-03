<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Events\WebRTCSignalEvent;
use App\Events\CallEvent;
use function broadcast;

class WebRTCService
{
  public function __construct()
  {
    // Placeholder constructor. In production, initialize any needed SDKs
    // (Pusher, Twilio, or a signaling bridge) here.
  }

  /**
   * Generate a token or channel info for client-side WebRTC usage.
   * Replace this with a real token generation when integrating a provider.
   */
  public function generateToken($userId, $channelName)
  {
    return [
      'token' => 'your-webrtc-token',
      'channel' => $channelName,
      'user_id' => $userId
    ];
  }

  /**
   * Send a signaling payload to participants. Controller calls use four args.
   * Keep this method as a safe no-op (logs) until a real signaling/broadcast
   * integration is wired (Pusher/Echo, socket.io server, or a message broker).
   *
   * @param string $callId
   * @param int $fromUserId
   * @param mixed $signal
   * @param string $type  // offer|answer|candidate
   */
  public function sendSignal($callId, $fromUserId, $signal, $type)
  {
    $eventName = 'signal.' . ($type === 'offer' ? 'offer' : ($type === 'answer' ? 'answer' : 'candidate'));

    // Log for now. Also attempt to broadcast using Laravel events; if broadcasting
    // isn't configured this is a no-op but it's ready for pusher/laravel-websockets.
    Log::info('WebRTC sendSignal', [
      'call_id' => $callId,
      'from_user_id' => $fromUserId,
      'type' => $type,
      'event' => $eventName,
      'signal' => is_string($signal) ? substr($signal, 0, 200) : $signal
    ]);
    try {
      broadcast(new WebRTCSignalEvent($callId, $eventName, ['from' => $fromUserId, 'signal' => $signal]));
    } catch (\Throwable $e) {
      // Don't fail if broadcasting isn't configured; we already logged.
      Log::debug('Broadcast failed for WebRTCSignalEvent: ' . $e->getMessage());
    }

    return true;
  }

  /**
   * Send higher-level call events (initiated, accepted, rejected, ended, etc.).
   * Matches VideoCallController usage of sendCallEvent(call_id, event, payload).
   */
  public function sendCallEvent($callId, $event, $payload = [])
  {
    Log::info('WebRTC sendCallEvent', [
      'call_id' => $callId,
      'event' => $event,
      'payload' => $payload
    ]);

    try {
      broadcast(new CallEvent($callId, $event, $payload));
    } catch (\Throwable $e) {
      Log::debug('Broadcast failed for CallEvent: ' . $e->getMessage());
    }

    return true;
  }

  // ... other WebRTC helper methods can be added here
}