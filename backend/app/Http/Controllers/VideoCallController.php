<?php

namespace App\Http\Controllers;

use App\Models\VideoCall;
use App\Models\User;
use App\Services\WebRTCService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VideoCallController extends Controller
{
  protected $webRTCService;
  protected $transactionService;

  public function __construct(WebRTCService $webRTCService, TransactionService $transactionService)
  {
    $this->webRTCService = $webRTCService;
    $this->transactionService = $transactionService;
  }

  public function initiateCall(Request $request)
  {
    $request->validate([
      'receiver_id' => 'required|exists:users,id',
      'call_type' => 'required|in:audio,video,premium'
    ]);

    // Check if user has sufficient balance for premium calls
    if ($request->call_type === 'premium') {
      if (!$this->webRTCService->checkUserBalance($request->user()->id, 'premium')) {
        return response()->json([
          'message' => 'Insufficient balance for premium call'
        ], 402);
      }
    }

    $call = $this->webRTCService->initiateCall(
      $request->user()->id,
      $request->receiver_id,
      $request->call_type
    );

    // Send call notification via WebSocket
    $this->webRTCService->sendCallEvent($call->call_id, 'initiated', [
      'call' => $call->load(['initiator', 'receiver']),
      'initiator' => $request->user()
    ]);

    return response()->json([
      'call' => $call,
      'message' => 'Call initiated successfully'
    ], 201);
  }

  public function initiateConference(Request $request)
  {
    $request->validate([
      'participant_ids' => 'required|array|min:1',
      'participant_ids.*' => 'exists:users,id',
      'call_type' => 'required|in:audio,video'
    ]);

    $call = $this->webRTCService->initiateConference(
      $request->user()->id,
      $request->participant_ids,
      $request->call_type
    );

    // Notify all participants
    foreach ($request->participant_ids as $participantId) {
      $this->webRTCService->sendCallEvent($call->call_id, 'conference_invite', [
        'call' => $call->load('initiator'),
        'participant_id' => $participantId
      ]);
    }

    return response()->json([
      'call' => $call,
      'message' => 'Conference call initiated'
    ], 201);
  }

  public function acceptCall(VideoCall $call)
  {
    if (
      $call->receiver_id !== request()->user()->id &&
      !$call->participants->contains('user_id', request()->user()->id)
    ) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $call->startCall();

    // Update participant joined status
    $call->participants()
      ->where('user_id', request()->user()->id)
      ->update(['joined_at' => now()]);

    $this->webRTCService->sendCallEvent($call->call_id, 'accepted', [
      'user' => request()->user(),
      'call' => $call
    ]);

    return response()->json(['message' => 'Call accepted']);
  }

  public function rejectCall(VideoCall $call)
  {
    if ($call->receiver_id !== request()->user()->id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $call->update(['status' => 'declined']);

    $this->webRTCService->sendCallEvent($call->call_id, 'rejected', [
      'user' => request()->user()
    ]);

    return response()->json(['message' => 'Call rejected']);
  }

  public function endCall(VideoCall $call)
  {
    if (!$call->isParticipant(request()->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $call->endCall();

    // Update participant left status
    $call->participants()
      ->where('user_id', request()->user()->id)
      ->update(['left_at' => now()]);

    $this->webRTCService->sendCallEvent($call->call_id, 'ended', [
      'user' => request()->user(),
      'call' => $call
    ]);

    return response()->json(['message' => 'Call ended']);
  }

  public function sendSignal(Request $request, VideoCall $call)
  {
    $request->validate([
      'signal' => 'required',
      'type' => 'required|in:offer,answer,candidate'
    ]);

    if (!$call->isParticipant(request()->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $this->webRTCService->sendSignal(
      $call->call_id,
      request()->user()->id,
      $request->signal,
      $request->type
    );

    return response()->json(['message' => 'Signal sent']);
  }

  public function toggleAudio(VideoCall $call)
  {
    $participant = $call->participants()->where('user_id', request()->user()->id)->first();

    if ($participant) {
      $participant->update(['is_muted' => !$participant->is_muted]);

      $this->webRTCService->sendCallEvent($call->call_id, 'audio_toggled', [
        'user_id' => request()->user()->id,
        'is_muted' => $participant->is_muted
      ]);
    }

    return response()->json(['is_muted' => $participant->is_muted ?? false]);
  }

  public function toggleVideo(VideoCall $call)
  {
    $participant = $call->participants()->where('user_id', request()->user()->id)->first();

    if ($participant) {
      $participant->update(['is_video_off' => !$participant->is_video_off]);

      $this->webRTCService->sendCallEvent($call->call_id, 'video_toggled', [
        'user_id' => request()->user()->id,
        'is_video_off' => $participant->is_video_off
      ]);
    }

    return response()->json(['is_video_off' => $participant->is_video_off ?? false]);
  }

  public function callHistory(Request $request)
  {
    $calls = VideoCall::where('initiator_id', $request->user()->id)
      ->orWhere('receiver_id', $request->user()->id)
      ->orWhereHas('participants', function ($query) use ($request) {
        $query->where('user_id', $request->user()->id);
      })
      ->with(['initiator', 'receiver', 'participants.user'])
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return response()->json(['calls' => $calls]);
  }

  public function purchaseCallCredits(Request $request)
  {
    $request->validate([
      'amount' => 'required|numeric|min:5|max:1000',
      'payment_method' => 'required|string'
    ]);

    DB::transaction(function () use ($request) {
      $this->transactionService->processCallCreditPurchase(
        $request->user()->id,
        $request->amount,
        $request->payment_method
      );
    });

    return response()->json([
      'message' => 'Call credits purchased successfully',
      'new_balance' => $request->user()->wallet->fresh()->balance
    ]);
  }
}