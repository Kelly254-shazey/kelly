<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostLike;
use App\Models\Comment;
use App\Models\CommentLike; // Make sure this is imported
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
  public function index(Request $request)
  {
    $posts = Post::with(['user', 'likes', 'comments.user'])
      ->visibleTo($request->user())
      ->withCount(['likes', 'comments'])
      ->orderBy('created_at', 'desc')
      ->paginate(10);

    return response()->json([
      'posts' => $posts
    ]);
  }

  public function sponsor(Request $request, Post $post)
  {
    $request->validate([
      'duration' => 'required|integer|min:1|max:30'
    ]);

    if ($post->user_id !== $request->user()->id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $transactionService = new TransactionService();
    $transactionService->processSponsoredPost(
      $request->user()->id,
      $post->id,
      $request->duration
    );

    return response()->json(['message' => 'Post sponsored successfully']);
  }

  public function store(Request $request)
  {
    $request->validate([
      'content' => 'required_without:media|string|max:5000',
      'media' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:10240',
      'visibility' => 'in:public,friends,private'
    ]);

    $mediaUrl = null;
    $mediaType = null;

    if ($request->hasFile('media')) {
      $file = $request->file('media');
      $path = $file->store('posts', 'public');
      $mediaUrl = Storage::url($path);
      $mediaType = str_contains($file->getMimeType(), 'image') ? 'image' : 'video';
    }

    $post = Post::create([
      'user_id' => $request->user()->id,
      'content' => $request->content,
      'media_url' => $mediaUrl,
      'media_type' => $mediaType,
      'visibility' => $request->visibility ?? 'public'
    ]);

    return response()->json([
      'post' => $post->load('user')
    ], 201);
  }

  public function like(Post $post)
  {
    $like = PostLike::firstOrCreate([
      'user_id' => request()->user()->id,
      'post_id' => $post->id
    ]);

    if ($like->wasRecentlyCreated) {
      $post->increment('likes_count');
    }

    return response()->json([
      'likes_count' => $post->likes_count
    ]);
  }

  public function unlike(Post $post)
  {
    $deleted = PostLike::where('user_id', request()->user()->id)
      ->where('post_id', $post->id)
      ->delete();

    if ($deleted) {
      $post->decrement('likes_count');
    }

    return response()->json([
      'likes_count' => $post->likes_count
    ]);
  }

  public function comment(Request $request, Post $post)
  {
    $request->validate([
      'content' => 'required|string|max:1000'
    ]);

    $comment = Comment::create([
      'user_id' => $request->user()->id,
      'post_id' => $post->id,
      'content' => $request->content
    ]);

    $post->increment('comments_count');

    return response()->json([
      'comment' => $comment->load('user')
    ], 201);
  }

  public function share(Post $post)
  {
    // Increment share count. In future, you may want to record a PostShare model.
    $post->increment('shares_count');

    return response()->json([
      'shares_count' => $post->shares_count
    ]);
  }

  public function destroy(Post $post)
  {
    if ($post->user_id !== request()->user()->id && !request()->user()->isAdmin()) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $post->delete();

    return response()->json(['message' => 'Post deleted']);
  }

  // REMOVE THE DUPLICATE METHODS BELOW - KEEP ONLY ONE VERSION OF EACH

  public function likeComment(Comment $comment)
  {
    $like = CommentLike::firstOrCreate([
      'user_id' => request()->user()->id,
      'comment_id' => $comment->id
    ]);

    if ($like->wasRecentlyCreated) {
      $comment->increment('likes_count');
    }

    return response()->json([
      'likes_count' => $comment->likes_count
    ]);
  }

  public function unlikeComment(Comment $comment)
  {
    $deleted = CommentLike::where('user_id', request()->user()->id)
      ->where('comment_id', $comment->id)
      ->delete();

    if ($deleted) {
      $comment->decrement('likes_count');
    }

    return response()->json([
      'likes_count' => $comment->likes_count
    ]);
  }

  // DELETE EVERYTHING BELOW THIS LINE - THESE ARE DUPLICATES
}