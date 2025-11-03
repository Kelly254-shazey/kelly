<?php

namespace App\Http\Controllers;

use App\Services\AdService;
use Illuminate\Http\Request;

class AdController extends Controller
{
  protected $adService;

  public function __construct(AdService $adService)
  {
    $this->adService = $adService;
  }

  public function getAds(Request $request)
  {
    $request->validate([
      'placement' => 'required|in:feed_top,feed_middle,feed_bottom,sidebar,video_pre_roll'
    ]);

    // Guard against unauthenticated requests: $request->user() can be null
    $user = $request->user();
    $userId = $user ? $user->id : null;

    $ad = $this->adService->getAdsForUser($userId, $request->placement);

    if (!$ad) {
      return response()->json(['ad' => null]);
    }

    return response()->json([
      'ad' => $ad
    ]);
  }

  public function recordClick(Request $request)
  {
    $request->validate([
      'impression_id' => 'required|exists:ad_impressions,id'
    ]);

    $this->adService->recordClick($request->impression_id);

    return response()->json(['message' => 'Click recorded']);
  }
}