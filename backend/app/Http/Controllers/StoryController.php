<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoryController extends Controller
{
  public function index()
  {
    $stories = Story::with(['user', 'views'])
      ->active()
      ->whereHas('user', function ($query) {
        $query->whereIn('id', function ($subquery) {
          $subquery->select('following_id')
            ->from('follows')
            ->where('follower_id', request()->user()->id);
        })->orWhere('users.id', request()->user()->id);
      })
      ->get()
      ->groupBy('user_id');

    return response()->json([
      'stories' => $stories
    ]);
  }

  public function store(Request $request)
  {
    $request->validate([
      'media' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:10240',
      'duration' => 'sometimes|integer|min:1|max:48'
    ]);

    $file = $request->file('media');
    $path = $file->store('stories', 'public');
    $mediaUrl = Storage::url($path);
    $mediaType = str_contains($file->getMimeType(), 'image') ? 'image' : 'video';

    $story = Story::create([
      'user_id' => $request->user()->id,
      'media_url' => $mediaUrl,
      'media_type' => $mediaType,
      'duration' => $request->duration ?? 24,
      'expires_at' => now()->addHours($request->duration ?? 24)
    ]);

    return response()->json([
      'story' => $story->load('user')
    ], 201);
  }

  public function view(Story $story)
  {
    if ($story->user_id === request()->user()->id) {
      return response()->json(['message' => 'Cannot view your own story']);
    }

    StoryView::firstOrCreate([
      'user_id' => request()->user()->id,
      'story_id' => $story->id
    ]);

    $story->increment('views_count');

    return response()->json(['message' => 'Story viewed']);
  }

  public function destroy(Story $story)
  {
    if ($story->user_id !== request()->user()->id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    Storage::disk('public')->delete(str_replace('/storage/', '', $story->media_url));
    $story->delete();

    return response()->json(['message' => 'Story deleted']);
  }
}