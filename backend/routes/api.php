<?php

use App\Http\Controllers\AdController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LiveStreamController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\VideoCallController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
  Route::post('/register', [AuthController::class, 'register']);
  Route::post('/login', [AuthController::class, 'login']);
  Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public content routes
Route::get('/posts/feed', [PostController::class, 'index']);
Route::get('/marketplace/products', [MarketplaceController::class, 'products']);
Route::get('/ads', [AdController::class, 'getAds']);
Route::get('/streams', [LiveStreamController::class, 'getStreams']);
Route::get('/stream/{stream}', [LiveStreamController::class, 'getStream']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

  // Auth routes
  Route::prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
  });

  // Posts
  Route::prefix('posts')->group(function () {
    Route::post('/', [PostController::class, 'store']);
    Route::delete('/{post}', [PostController::class, 'destroy']);
    Route::post('/{post}/like', [PostController::class, 'like']);
    Route::post('/{post}/unlike', [PostController::class, 'unlike']);
    Route::post('/{post}/comments', [PostController::class, 'comment']);
  Route::post('/{post}/share', [PostController::class, 'share']);
    Route::post('/{post}/sponsor', [PostController::class, 'sponsor']);
  });

  // Comments
  Route::prefix('comments')->group(function () {
    Route::post('/{comment}/like', [PostController::class, 'likeComment']);
    Route::post('/{comment}/unlike', [PostController::class, 'unlikeComment']);
  });

  // Messages
  Route::prefix('messages')->group(function () {
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/{conversation}', [MessageController::class, 'messages']);
    Route::post('/', [MessageController::class, 'sendMessage']);
    Route::put('/{conversation}/read', [MessageController::class, 'markAsRead']);
    Route::put('/{message}/read', [MessageController::class, 'markMessageAsRead']);
    Route::post('/{conversation}/typing/start', [MessageController::class, 'startTyping']);
    Route::post('/{conversation}/typing/stop', [MessageController::class, 'stopTyping']);
    Route::post('/{message}/reaction', [MessageController::class, 'addReaction']);
    Route::delete('/{message}/reaction', [MessageController::class, 'removeReaction']);
    Route::delete('/{message}', [MessageController::class, 'deleteMessage']);
    Route::get('/search', [MessageController::class, 'searchMessages']);
    Route::get('/unread/count', [MessageController::class, 'getUnreadCount']);
    Route::post('/group/create', [MessageController::class, 'createGroupConversation']);
    Route::put('/group/{conversation}/update', [MessageController::class, 'updateGroupConversation']);
    Route::post('/conversation/{conversation}/leave', [MessageController::class, 'leaveConversation']);
  });

  // Marketplace
  Route::prefix('marketplace')->group(function () {
    Route::post('/products', [MarketplaceController::class, 'storeProduct']);
    Route::post('/products/{product}/purchase', [MarketplaceController::class, 'purchase']);
    Route::post('/orders/{order}/confirm', [MarketplaceController::class, 'confirmPurchase']);
  });

  // Ads
  Route::post('/ads/click', [AdController::class, 'recordClick']);

  // Profiles
  Route::prefix('profile')->group(function () {
    Route::get('/{user?}', [ProfileController::class, 'show']);
    Route::put('/', [ProfileController::class, 'update']);
    Route::get('/friends', [ProfileController::class, 'friends']);
  });

  // Users relationships
  Route::prefix('users')->group(function () {
    Route::post('/{user}/follow', [ProfileController::class, 'follow']);
    Route::post('/{user}/unfollow', [ProfileController::class, 'unfollow']);
    Route::post('/{user}/friend-request', [ProfileController::class, 'sendFriendRequest']);
    Route::post('/friend-requests/{user}/accept', [ProfileController::class, 'acceptFriendRequest']);
    Route::post('/friend-requests/{user}/reject', [ProfileController::class, 'rejectFriendRequest']);
  });

  // Stories
  Route::prefix('stories')->group(function () {
    Route::get('/', [StoryController::class, 'index']);
    Route::post('/', [StoryController::class, 'store']);
    Route::post('/{story}/view', [StoryController::class, 'view']);
    Route::delete('/{story}', [StoryController::class, 'destroy']);
  });

  // Communities
  Route::prefix('communities')->group(function () {
    Route::get('/', [CommunityController::class, 'index']);
    Route::post('/', [CommunityController::class, 'store']);
    Route::get('/{community}', [CommunityController::class, 'show']);
    Route::post('/{community}/join', [CommunityController::class, 'join']);
    Route::post('/{community}/leave', [CommunityController::class, 'leave']);
  });

  // AI Features
  Route::prefix('ai')->group(function () {
    Route::get('/friend-suggestions', [AIController::class, 'friendSuggestions']);
    Route::post('/summarize-conversation', [AIController::class, 'summarizeConversation']);
    Route::post('/caption-suggestions', [AIController::class, 'captionSuggestions']);
  });

  // Live Streaming
  Route::prefix('stream')->group(function () {
    Route::post('/start', [LiveStreamController::class, 'startStream']);
    Route::post('/{stream}/end', [LiveStreamController::class, 'endStream']);
    Route::post('/{stream}/join', [LiveStreamController::class, 'joinStream']);
    Route::post('/{stream}/leave', [LiveStreamController::class, 'leaveStream']);
    Route::post('/{stream}/message', [LiveStreamController::class, 'sendMessage']);
  });

  // Wallet
  Route::prefix('wallet')->group(function () {
    Route::get('/', [WalletController::class, 'show']);
    Route::post('/deposit', [WalletController::class, 'deposit']);
    Route::post('/withdraw', [WalletController::class, 'withdraw']);
  });

  // Video Calls
  Route::prefix('calls')->group(function () {
    Route::post('/initiate', [VideoCallController::class, 'initiateCall']);
    Route::post('/conference', [VideoCallController::class, 'initiateConference']);
    Route::post('/{call}/accept', [VideoCallController::class, 'acceptCall']);
    Route::post('/{call}/reject', [VideoCallController::class, 'rejectCall']);
    Route::post('/{call}/end', [VideoCallController::class, 'endCall']);
    Route::post('/{call}/signal', [VideoCallController::class, 'sendSignal']);
    Route::post('/{call}/toggle-audio', [VideoCallController::class, 'toggleAudio']);
    Route::post('/{call}/toggle-video', [VideoCallController::class, 'toggleVideo']);
    Route::get('/history', [VideoCallController::class, 'callHistory']);
    Route::post('/purchase-credits', [VideoCallController::class, 'purchaseCallCredits']);
  });

  // Admin routes
  Route::middleware('admin')->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{user}/role', [AdminController::class, 'updateUserRole']);
    Route::get('/ad-revenue', [AdminController::class, 'adRevenueReport']);
  });
});