<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\ConversationUser;
use App\Events\MessageSent;
use App\Events\TypingStarted;
use App\Events\TypingStopped;
use App\Events\MessageRead;
use App\Events\MessageReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
  public function conversations(Request $request)
  {
    $conversations = $request->user()->conversations()
      ->with([
        'users' => function ($query) use ($request) {
          $query->where('users.id', '!=', $request->user()->id);
        }
      ])
      ->with([
        'messages' => function ($query) {
          $query->latest()->limit(1);
        }
      ])
      ->withCount([
        'messages as unread_count' => function ($query) use ($request) {
          $query->where('user_id', '!=', $request->user()->id)
            ->whereNull('read_at');
        }
      ])
      ->with(['lastMessage.user'])
      ->orderBy('updated_at', 'desc')
      ->paginate(20);

    // Format response with last message and unread count
    $formattedConversations = $conversations->map(function ($conversation) use ($request) {
      $otherUser = $conversation->users->first();

      return [
        'id' => $conversation->id,
        'type' => $conversation->type,
        'title' => $conversation->title ?? $otherUser->name,
        'other_user' => $otherUser,
        'last_message' => $conversation->messages->first(),
        'unread_count' => $conversation->unread_count,
        'updated_at' => $conversation->updated_at,
        'is_online' => $otherUser->last_active_at && $otherUser->last_active_at->gt(now()->subMinutes(5)),
      ];
    });

    return response()->json([
      'conversations' => $formattedConversations,
      'total_unread' => $request->user()->conversations()
        ->whereHas('messages', function ($query) use ($request) {
          $query->where('user_id', '!=', $request->user()->id)
            ->whereNull('read_at');
        })->count()
    ]);
  }

  public function messages(Conversation $conversation, Request $request)
  {
    if (!$conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $messages = $conversation->messages()
      ->with(['user', 'reactions.user'])
      ->withCount('reactions')
      ->orderBy('created_at', 'desc')
      ->paginate(50);

    // Mark messages as read
    $this->markMessagesAsRead($conversation->id, $request->user()->id);

    return response()->json([
      'messages' => $messages->reverse()->values(),
      'conversation' => $conversation->load('users'),
      'total_messages' => $conversation->messages()->count()
    ]);
  }

  public function sendMessage(Request $request)
  {
    $validator = $this->validateMessageRequest($request);

    if ($validator->fails()) {
      return response()->json([
        'errors' => $validator->errors()
      ], 422);
    }

    DB::beginTransaction();

    try {
      if ($request->user_id) {
        $conversation = $this->getOrCreateDirectConversation($request->user_id);
      } else {
        $conversation = Conversation::find($request->conversation_id);
      }

      if (!$conversation->users->contains($request->user()->id)) {
        return response()->json(['message' => 'Unauthorized'], 403);
      }

      $messageData = [
        'conversation_id' => $conversation->id,
        'user_id' => $request->user()->id,
        'content' => $request->content,
        'message_type' => $request->message_type ?? 'text',
      ];

      // Handle file uploads
      if ($request->hasFile('file')) {
        $fileData = $this->handleFileUpload($request->file('file'), $request->message_type);
        $messageData = array_merge($messageData, $fileData);
      }

      // Handle message reply
      if ($request->reply_to) {
        $messageData['reply_to'] = $request->reply_to;
      }

      $message = Message::create($messageData);

      // Update conversation timestamp
      $conversation->touch();

      DB::commit();

      // Broadcast message
      broadcast(new MessageSent($message->load(['user', 'replyTo.user', 'reactions'])))->toOthers();

      return response()->json([
        'message' => $message->load(['user', 'replyTo.user']),
        'conversation' => $conversation->fresh(['users'])
      ], 201);

    } catch (\Exception $e) {
      DB::rollBack();
      \Log::error('Message sending failed: ' . $e->getMessage());
      return response()->json(['message' => 'Failed to send message'], 500);
    }
  }

  public function markAsRead(Conversation $conversation, Request $request)
  {
    if (!$conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $unreadMessages = $conversation->messages()
      ->where('user_id', '!=', $request->user()->id)
      ->whereNull('read_at')
      ->get();

    if ($unreadMessages->count() > 0) {
      $unreadMessages->each->update(['read_at' => now()]);

      // Broadcast read receipt
      broadcast(new MessageRead($conversation->id, $request->user()->id, $unreadMessages->pluck('id')))->toOthers();
    }

    return response()->json([
      'message' => 'Messages marked as read',
      'read_count' => $unreadMessages->count()
    ]);
  }

  public function markMessageAsRead(Message $message, Request $request)
  {
    if (!$message->conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($message->user_id === $request->user()->id) {
      return response()->json(['message' => 'Cannot mark your own message as read'], 400);
    }

    if (!$message->read_at) {
      $message->update(['read_at' => now()]);

      broadcast(new MessageRead($message->conversation_id, $request->user()->id, [$message->id]))->toOthers();
    }

    return response()->json(['message' => 'Message marked as read']);
  }

  public function startTyping(Conversation $conversation, Request $request)
  {
    if (!$conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    broadcast(new TypingStarted($conversation->id, $request->user()->id, $request->user()->name))->toOthers();

    return response()->json(['message' => 'Typing indicator sent']);
  }

  public function stopTyping(Conversation $conversation, Request $request)
  {
    if (!$conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    broadcast(new TypingStopped($conversation->id, $request->user()->id))->toOthers();

    return response()->json(['message' => 'Typing stopped']);
  }

  public function addReaction(Message $message, Request $request)
  {
    $request->validate([
      'reaction' => 'required|string|max:10'
    ]);

    if (!$message->conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Remove existing reaction from same user
    $message->reactions()->where('user_id', $request->user()->id)->delete();

    // Add new reaction
    $reaction = $message->reactions()->create([
      'user_id' => $request->user()->id,
      'reaction' => $request->reaction
    ]);

    // Broadcast reaction
    broadcast(new MessageReaction($message->id, $request->user()->id, $request->reaction, 'added'))->toOthers();

    return response()->json([
      'reaction' => $reaction->load('user'),
      'message' => 'Reaction added'
    ]);
  }

  public function removeReaction(Message $message, Request $request)
  {
    $request->validate([
      'reaction' => 'required|string|max:10'
    ]);

    if (!$message->conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $deleted = $message->reactions()
      ->where('user_id', $request->user()->id)
      ->where('reaction', $request->reaction)
      ->delete();

    if ($deleted) {
      broadcast(new MessageReaction($message->id, $request->user()->id, $request->reaction, 'removed'))->toOthers();
    }

    return response()->json(['message' => 'Reaction removed']);
  }

  public function deleteMessage(Message $message, Request $request)
  {
    if ($message->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Soft delete the message
    $message->update([
      'content' => 'This message was deleted',
      'message_type' => 'deleted',
      'file_url' => null,
      'file_name' => null,
      'file_size' => null
    ]);

    // Broadcast message deletion
    broadcast(new MessageSent($message->fresh()))->toOthers();

    return response()->json(['message' => 'Message deleted']);
  }

  public function searchMessages(Request $request)
  {
    $request->validate([
      'query' => 'required|string|min:1|max:100',
      'conversation_id' => 'nullable|exists:conversations,id'
    ]);

    $query = Message::with(['user', 'conversation.users'])
      ->where('content', 'like', '%' . $request->query . '%')
      ->whereHas('conversation.users', function ($q) use ($request) {
        $q->where('users.id', $request->user()->id);
      });

    if ($request->conversation_id) {
      $query->where('conversation_id', $request->conversation_id);
    }

    $messages = $query->orderBy('created_at', 'desc')
      ->paginate(20);

    return response()->json([
      'messages' => $messages,
      'search_query' => $request->query
    ]);
  }

  public function getUnreadCount(Request $request)
  {
    $totalUnread = Message::whereHas('conversation.users', function ($query) use ($request) {
      $query->where('users.id', $request->user()->id);
    })
      ->where('user_id', '!=', $request->user()->id)
      ->whereNull('read_at')
      ->count();

    return response()->json(['total_unread' => $totalUnread]);
  }

  public function createGroupConversation(Request $request)
  {
    $request->validate([
      'title' => 'required|string|max:255',
      'participant_ids' => 'required|array|min:2|max:50',
      'participant_ids.*' => 'exists:users,id'
    ]);

    DB::beginTransaction();

    try {
      $conversation = Conversation::create([
        'created_by' => $request->user()->id,
        'title' => $request->title,
        'type' => 'group'
      ]);

      // Add creator as admin
      $conversation->users()->attach($request->user()->id, ['role' => 'admin']);

      // Add participants
      $conversation->users()->attach($request->participant_ids, ['role' => 'member']);

      // Send welcome message
      $welcomeMessage = Message::create([
        'conversation_id' => $conversation->id,
        'user_id' => $request->user()->id,
        'content' => "Created the group '{$request->title}'",
        'message_type' => 'system'
      ]);

      DB::commit();

      broadcast(new MessageSent($welcomeMessage))->toOthers();

      return response()->json([
        'conversation' => $conversation->load(['users', 'messages']),
        'message' => 'Group conversation created'
      ], 201);

    } catch (\Exception $e) {
      DB::rollBack();
      return response()->json(['message' => 'Failed to create group conversation'], 500);
    }
  }

  public function updateGroupConversation(Conversation $conversation, Request $request)
  {
    if ($conversation->type !== 'group') {
      return response()->json(['message' => 'Not a group conversation'], 400);
    }

    if (!$this->isConversationAdmin($conversation, $request->user()->id)) {
      return response()->json(['message' => 'Only admins can update group'], 403);
    }

    $request->validate([
      'title' => 'sometimes|string|max:255',
      'participant_ids' => 'sometimes|array',
      'participant_ids.*' => 'exists:users,id'
    ]);

    if ($request->has('title')) {
      $conversation->update(['title' => $request->title]);
    }

    if ($request->has('participant_ids')) {
      $conversation->users()->syncWithoutDetaching($request->participant_ids);
    }

    return response()->json([
      'conversation' => $conversation->fresh(['users']),
      'message' => 'Group updated successfully'
    ]);
  }

  public function leaveConversation(Conversation $conversation, Request $request)
  {
    if (!$conversation->users->contains($request->user()->id)) {
      return response()->json(['message' => 'Not a member of this conversation'], 400);
    }

    if ($conversation->type === 'direct') {
      return response()->json(['message' => 'Cannot leave direct conversation'], 400);
    }

    $conversation->users()->detach($request->user()->id);

    // Send leave message
    $leaveMessage = Message::create([
      'conversation_id' => $conversation->id,
      'user_id' => $request->user()->id,
      'content' => "Left the group",
      'message_type' => 'system'
    ]);

    broadcast(new MessageSent($leaveMessage))->toOthers();

    return response()->json(['message' => 'Left conversation successfully']);
  }

  private function validateMessageRequest(Request $request)
  {
    $rules = [
      'conversation_id' => 'required_without:user_id|exists:conversations,id',
      'user_id' => 'required_without:conversation_id|exists:users,id',
      'content' => 'required_without:file|string|max:5000',
      'message_type' => 'sometimes|in:text,image,video,file,audio',
      'file' => 'sometimes|file|max:10240', // 10MB max
      'reply_to' => 'sometimes|exists:messages,id'
    ];

    return validator($request->all(), $rules);
  }

  private function getOrCreateDirectConversation($otherUserId)
  {
    $currentUserId = auth()->id();

    $conversation = Conversation::where('type', 'direct')
      ->whereHas('users', function ($query) use ($currentUserId) {
        $query->where('users.id', $currentUserId);
      })
      ->whereHas('users', function ($query) use ($otherUserId) {
        $query->where('users.id', $otherUserId);
      })
      ->first();

    if (!$conversation) {
      $conversation = Conversation::create([
        'created_by' => $currentUserId,
        'type' => 'direct'
      ]);

      $conversation->users()->attach([$currentUserId, $otherUserId]);
    }

    return $conversation;
  }

  private function handleFileUpload($file, $messageType)
  {
    $fileExtension = $file->getClientOriginalExtension();
    $fileName = Str::random(40) . '.' . $fileExtension;
    $filePath = $file->storeAs('messages', $fileName, 'public');

    return [
      'file_url' => Storage::url($filePath),
      'file_name' => $file->getClientOriginalName(),
      'file_size' => $file->getSize(),
      'message_type' => $messageType ?: $this->getMessageTypeFromExtension($fileExtension)
    ];
  }

  private function getMessageTypeFromExtension($extension)
  {
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    $audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

    if (in_array($extension, $imageExtensions))
      return 'image';
    if (in_array($extension, $videoExtensions))
      return 'video';
    if (in_array($extension, $audioExtensions))
      return 'audio';

    return 'file';
  }

  private function markMessagesAsRead($conversationId, $userId)
  {
    Message::where('conversation_id', $conversationId)
      ->where('user_id', '!=', $userId)
      ->whereNull('read_at')
      ->update(['read_at' => now()]);
  }

  private function isConversationAdmin($conversation, $userId)
  {
    return $conversation->users()
      ->where('user_id', $userId)
      ->where('role', 'admin')
      ->exists();
  }
}