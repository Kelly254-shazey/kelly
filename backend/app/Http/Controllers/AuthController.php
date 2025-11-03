<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
  /**
   * Register a new user
   */
  public function register(Request $request): JsonResponse
  {
    // Validation rules - accept either full `name` or `first_name` + `last_name`
    $validator = Validator::make($request->all(), [
      'first_name' => 'required_without:name|string|max:255',
      'last_name' => 'required_with:first_name|string|max:255',
      'name' => 'required_without:first_name|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:6',
      'date_of_birth' => 'required|date',
      'county' => 'required|string',
      'gender' => 'required|in:male,female,other',
      'terms' => 'sometimes|accepted',
    ]);

    if ($validator->fails()) {
      // log validation errors to help debugging in development
      logger()->warning('Registration validation failed', ['errors' => $validator->errors()->toArray()]);

      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      // Create user
      // Determine name
      $fullName = $request->name ?? trim(($request->first_name ?? '') . ' ' . ($request->last_name ?? ''));

      $user = User::create([
        'name' => $fullName,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'date_of_birth' => $request->date_of_birth,
        'county' => $request->county,
        'gender' => $request->gender,
        // Ensure a default role is assigned (roles seeded with id 1)
        'role_id' => $request->role_id ?? 1,
      ]);

      // Create token
      $token = $user->createToken('auth-token')->plainTextToken;

      return response()->json([
        'user' => $user,
        'token' => $token,
        'message' => 'Registration successful'
      ], 201);

    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Registration failed',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Login user
   */
  public function login(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email',
      'password' => 'required',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    // Check credentials
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
      return response()->json([
        'message' => 'Invalid credentials'
      ], 401);
    }

    // Create token
    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json([
      'user' => $user,
      'token' => $token,
      'message' => 'Login successful'
    ]);
  }

  /**
   * Logout user
   */
  public function logout(Request $request): JsonResponse
  {
    $request->user()->currentAccessToken()->delete();

    return response()->json([
      'message' => 'Logged out successfully'
    ]);
  }

  /**
   * Get authenticated user
   */
  public function user(Request $request): JsonResponse
  {
    return response()->json($request->user());
  }
}