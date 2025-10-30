<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;

class AIController extends Controller
{
  protected $aiService;

  public function __construct(AIService $aiService)
  {
    $this->aiService = $aiService;
  }

  public function friendSuggestions()
  {
    $suggestions = $this->aiService->generateFriendSuggestions(request()->user()->id);

    return response()->json([
      'suggestions' => $suggestions
    ]);
  }

  public function summarizeConversation(Request $request)
  {
    $request->validate([
      'conversation_id' => 'required|exists:conversations,id'
    ]);

    $summary = $this->aiService->summarizeConversation($request->conversation_id);

    return response()->json([
      'summary' => $summary
    ]);
  }

  public function captionSuggestions(Request $request)
  {
    $request->validate([
      'context' => 'required|string|max:500'
    ]);

    $suggestions = $this->aiService->generateCaptionSuggestions($request->context);

    return response()->json([
      'suggestions' => $suggestions
    ]);
  }

  // Add to AuthController.php
  public function forgotPassword(Request $request)
  {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
      ? response()->json(['message' => 'Reset link sent'])
      : response()->json(['message' => 'Unable to send reset link'], 400);
  }

  public function resetPassword(Request $request)
  {
    $request->validate([
      'token' => 'required',
      'email' => 'required|email',
      'password' => 'required|confirmed|min:8',
    ]);

    $status = Password::reset(
      $request->only('email', 'password', 'password_confirmation', 'token'),
      function ($user, $password) {
        $user->forceFill(['password' => Hash::make($password)])->save();
      }
    );

    return $status == Password::PASSWORD_RESET
      ? response()->json(['message' => 'Password reset successfully'])
      : response()->json(['message' => 'Unable to reset password'], 400);
  }
}