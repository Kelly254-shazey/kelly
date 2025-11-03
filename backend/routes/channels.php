<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Broadcast Channel Routes
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The provided Channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('call.{callId}', function ($user, $callId) {
    // The application uses a `call_id` string on the `video_calls` table
    // and numeric `id` as the PK referenced by call participants.
    $call = DB::table('video_calls')->where('call_id', $callId)->first();
    if (! $call) {
        return false;
    }

    // Allow initiator and receiver
    if ($call->initiator_id === $user->id || $call->receiver_id === $user->id) {
        return true;
    }

    // Otherwise check the call_participants table
    return DB::table('call_participants')
        ->where('call_id', $call->id)
        ->where('user_id', $user->id)
        ->exists();
});
