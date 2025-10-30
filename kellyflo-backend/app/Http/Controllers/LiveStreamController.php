<?php
// app/Http/Controllers/LiveStreamController.php
namespace App\Http\Controllers;

use App\Models\LiveStream;
use App\Models\StreamViewer;
use App\Models\StreamMessage;
use App\Events\StreamMessageSent; // Add this import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Add this for better auth handling
use Illuminate\Support\Str;

class LiveStreamController extends Controller
{
  public function startStream(Request $request)
  {
    $request->validate([
      'title' => 'required|string|max:255',
      'description' => 'nullable|string|max:1000'
    ]);

    $stream = LiveStream::create([
      'user_id' => $request->user()->id,
      'title' => $request->title,
      'description' => $request->description,
      'stream_key' => Str::random(32),
      'is_live' => true,
      'started_at' => now()
    ]);

    return response()->json([
      'stream' => $stream,
      'stream_key' => $stream->stream_key
    ], 201);
  }

  public function endStream(LiveStream $stream)
  {
    // Use Auth facade for consistency
    if ($stream->user_id !== Auth::id()) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $stream->update([
      'is_live' => false,
      'ended_at' => now()
    ]);

    return response()->json(['message' => 'Stream ended']);
  }

  public function getStreams()
  {
    $streams = LiveStream::with('user')
      ->where('is_live', true)
      ->orderBy('viewer_count', 'desc')
      ->get();

    return response()->json(['streams' => $streams]);
  }

  public function joinStream(LiveStream $stream)
  {
    // Check if user is authenticated
    if (!Auth::check()) {
      return response()->json(['message' => 'Authentication required'], 401);
    }

    StreamViewer::firstOrCreate([
      'stream_id' => $stream->id,
      'user_id' => Auth::id()
    ]);

    $stream->increment('viewer_count');

    return response()->json(['message' => 'Joined stream']);
  }

  public function sendMessage(Request $request, LiveStream $stream)
  {
    $request->validate(['content' => 'required|string|max:500']);

    // Check if stream is live
    if (!$stream->is_live) {
      return response()->json(['message' => 'Stream is not live'], 400);
    }

    $message = StreamMessage::create([
      'stream_id' => $stream->id,
      'user_id' => $request->user()->id,
      'content' => $request->input('content')
    ]);

    // Load user relationship before broadcasting
    $message->load('user');

    broadcast(new StreamMessageSent($message))->toOthers();

    return response()->json(['message' => $message]);
  }

  // Add method to get stream details
  public function getStream(LiveStream $stream)
  {
    $stream->load('user', 'messages.user');
    return response()->json(['stream' => $stream]);
  }

  // Add method to leave stream
  public function leaveStream(LiveStream $stream)
  {
    if (!Auth::check()) {
      return response()->json(['message' => 'Authentication required'], 401);
    }

    StreamViewer::where([
      'stream_id' => $stream->id,
      'user_id' => Auth::id()
    ])->delete();

    // Only decrement if viewer_count is greater than 0
    if ($stream->viewer_count > 0) {
      $stream->decrement('viewer_count');
    }

    return response()->json(['message' => 'Left stream']);
  }
}