<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Follow;
use App\Models\Friendship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
  public function show($userId = null)
  {
    $user = $userId ? User::findOrFail($userId) : request()->user();

    $user->loadCount(['posts', 'followers', 'following']);

    return response()->json([
      'user' => $user,
      'is_own_profile' => !$userId || $userId == request()->user()->id,
      'is_following' => $userId ? Follow::where('follower_id', request()->user()->id)
        ->where('following_id', $userId)->exists() : false,
      'friendship_status' => $userId ? $this->getFriendshipStatus($userId) : null
    ]);
  }

  public function update(Request $request)
  {
    $user = $request->user();

    $request->validate([
      'name' => 'sometimes|string|max:255',
      'bio' => 'nullable|string|max:500',
      'county' => 'sometimes|string|max:255',
      'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
      'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
    ]);

    if ($request->hasFile('avatar')) {
      if ($user->avatar) {
        Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
      }
      $path = $request->file('avatar')->store('avatars', 'public');
      $user->avatar = Storage::url($path);
    }

    if ($request->hasFile('cover_photo')) {
      if ($user->cover_photo) {
        Storage::disk('public')->delete(str_replace('/storage/', '', $user->cover_photo));
      }
      $path = $request->file('cover_photo')->store('covers', 'public');
      $user->cover_photo = Storage::url($path);
    }

    $user->update($request->only(['name', 'bio', 'county']));

    return response()->json([
      'user' => $user->fresh()
    ]);
  }

  public function follow(User $user)
  {
    if ($user->id === request()->user()->id) {
      return response()->json(['message' => 'Cannot follow yourself'], 400);
    }

    Follow::firstOrCreate([
      'follower_id' => request()->user()->id,
      'following_id' => $user->id
    ]);

    return response()->json(['message' => 'Followed successfully']);
  }

  public function unfollow(User $user)
  {
    Follow::where('follower_id', request()->user()->id)
      ->where('following_id', $user->id)
      ->delete();

    return response()->json(['message' => 'Unfollowed successfully']);
  }

  public function sendFriendRequest(User $user)
  {
    if ($user->id === request()->user()->id) {
      return response()->json(['message' => 'Cannot send friend request to yourself'], 400);
    }

    $existing = Friendship::where(function ($query) use ($user) {
      $query->where('user_id', request()->user()->id)
        ->where('friend_id', $user->id);
    })->orWhere(function ($query) use ($user) {
      $query->where('user_id', $user->id)
        ->where('friend_id', request()->user()->id);
    })->first();

    if ($existing) {
      return response()->json(['message' => 'Friend request already exists'], 400);
    }

    Friendship::create([
      'user_id' => request()->user()->id,
      'friend_id' => $user->id,
      'status' => 'pending'
    ]);

    return response()->json(['message' => 'Friend request sent']);
  }

  public function friends()
  {
    $friends = request()->user()->friends()->paginate(20);

    return response()->json(['friends' => $friends]);
  }

  public function acceptFriendRequest(User $user)
  {
    $friendship = Friendship::where('user_id', $user->id)
      ->where('friend_id', request()->user()->id)
      ->where('status', 'pending')
      ->firstOrFail();

    $friendship->update(['status' => 'accepted']);

    return response()->json(['message' => 'Friend request accepted']);
  }

  public function rejectFriendRequest(User $user)
  {
    $friendship = Friendship::where('user_id', $user->id)
      ->where('friend_id', request()->user()->id)
      ->where('status', 'pending')
      ->firstOrFail();

    $friendship->delete();

    return response()->json(['message' => 'Friend request rejected']);
  }
  private function getFriendshipStatus($userId)
  {
    $friendship = Friendship::where(function ($query) use ($userId) {
      $query->where('user_id', request()->user()->id)
        ->where('friend_id', $userId);
    })->orWhere(function ($query) use ($userId) {
      $query->where('user_id', $userId)
        ->where('friend_id', request()->user()->id);
    })->first();

    return $friendship ? $friendship->status : null;
  }
}