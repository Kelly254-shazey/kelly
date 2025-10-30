<?php

namespace App\Services;

use App\Models\AdCampaign;
use App\Models\AdImpression;
use App\Models\AdPlacement;
use App\Models\AdClick; // Added missing import
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdService
{
  public function getAdsForUser($userId, $placement)
  {
    try {
      $user = User::with('profile')->find($userId);
      if (!$user) {
        return null;
      }

      $campaigns = AdCampaign::active()
        ->where(function ($query) use ($user) {
          $query->whereNull('target_audience')
            ->orWhereJsonContains('target_audience->counties', $user->county)
            ->orWhereJsonContains('target_audience->age_groups', $this->getAgeGroup($user->date_of_birth))
            ->orWhereJsonContains('target_audience->interests', $this->getUserInterests($userId));
        })
        ->inRandomOrder()
        ->get();

      $ad = AdPlacement::whereIn('campaign_id', $campaigns->pluck('id'))
        ->where('placement', $placement)
        ->inRandomOrder()
        ->first();

      if ($ad) {
        $this->recordImpression($ad->id, $userId);
      }

      return $ad;

    } catch (\Exception $e) {
      Log::error('Ad service error: ' . $e->getMessage());
      return null;
    }
  }

  private function recordImpression($placementId, $userId)
  {
    $placement = AdPlacement::find($placementId);
    $cost = $placement->cpm / 1000;

    AdImpression::create([
      'placement_id' => $placementId,
      'user_id' => $userId,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
      'impression_cost' => $cost
    ]);

    DB::table('ad_campaigns')
      ->where('id', $placement->campaign_id)
      ->increment('spent', $cost);
  }

  public function recordClick($impressionId)
  {
    $impression = AdImpression::find($impressionId);
    $placement = AdPlacement::find($impression->placement_id);
    $cost = $placement->cpc;

    AdClick::create([
      'impression_id' => $impressionId,
      'click_cost' => $cost
    ]);

    DB::table('ad_campaigns')
      ->where('id', $placement->campaign_id)
      ->increment('spent', $cost);
  }

  private function getAgeGroup($dateOfBirth)
  {
    if (!$dateOfBirth)
      return 'unknown';

    $age = $dateOfBirth->age;

    if ($age < 18)
      return 'teen';
    if ($age <= 25)
      return 'young_adult';
    if ($age <= 35)
      return 'adult';
    if ($age <= 50)
      return 'middle_aged';
    return 'senior';
  }

  private function getUserInterests($userId)
  {
    $user = User::with(['posts', 'products'])->find($userId);
    $interests = [];

    if ($user->products->count() > 0) {
      $interests[] = 'shopping';
    }

    if ($user->posts->count() > 5) {
      $interests[] = 'social';
    }

    return $interests;
  }
}