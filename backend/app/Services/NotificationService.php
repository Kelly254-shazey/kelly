<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationService
{
  public function sendNotification($userId, $type, $data)
  {
    DB::table('notifications')->insert([
      'user_id' => $userId,
      'type' => $type,
      'data' => json_encode($data),
      'read_at' => null,
      'created_at' => now(),
      'updated_at' => now()
    ]);

    // Broadcast via WebSocket if user is online
    broadcast(new \App\Events\NotificationSent($userId, $type, $data));
  }

  public function sendPushNotification($userId, $title, $message, $data = [])
  {
    // Integrate with Firebase Cloud Messaging or OneSignal
    // This is a placeholder for push notification implementation
  }
}