<?php

namespace App\Services;

use App\Models\AIRecommendation;
use App\Models\AIChatSummary;
use App\Models\User;
use App\Models\Message;

class AIService
{
  public function generateFriendSuggestions($userId)
  {
    $user = User::find($userId);

    $suggestions = User::where('id', '!=', $userId)
      ->where('county', $user->county)
      ->whereHas('posts')
      ->withCount([
        'followers as mutual_friends' => function ($query) use ($userId) {
          $query->whereIn('follower_id', function ($q) use ($userId) {
            $q->select('following_id')
              ->from('follows')
              ->where('follower_id', $userId);
          });
        }
      ])
      ->orderBy('mutual_friends', 'desc')
      ->limit(10)
      ->get();

    foreach ($suggestions as $suggestion) {
      AIRecommendation::create([
        'user_id' => $userId,
        'type' => 'friend',
        'recommended_id' => $suggestion->id,
        'score' => rand(70, 95) / 100
      ]);
    }

    return $suggestions;
  }

  public function summarizeConversation($conversationId)
  {
    $messages = Message::where('conversation_id', $conversationId)
      ->with('user')
      ->orderBy('created_at', 'desc')
      ->limit(50)
      ->get();

    $conversationText = $messages->map(function ($message) {
      return "{$message->user->name}: {$message->content}";
    })->implode("\n");

    $summary = "• Discussed meeting plans for next week\n• Shared photos from recent events\n• Made decisions about group project";

    AIChatSummary::create([
      'conversation_id' => $conversationId,
      'summary' => $summary
    ]);

    return $summary;
  }

  public function generateCaptionSuggestions($context)
  {
    $suggestions = [
      "Having an amazing time! 🌟",
      "Creating beautiful memories together 💫",
      "This made my day! ✨",
      "Living life to the fullest! 🎉",
      "Moments that matter ❤️"
    ];

    return array_slice($suggestions, 0, 3);
  }
}