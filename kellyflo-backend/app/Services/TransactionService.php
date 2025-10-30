<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class TransactionService
{
  const PLATFORM_COMMISSION = 0.05;

  public function processSale($orderId)
  {
    $order = Order::with(['product', 'buyer', 'seller'])->find($orderId);

    $commission = $order->total_price * self::PLATFORM_COMMISSION;
    $sellerEarnings = $order->total_price - $commission;

    DB::transaction(function () use ($order, $commission, $sellerEarnings) {
      Transaction::create([
        'user_id' => $order->buyer_id,
        'order_id' => $order->id,
        'type' => 'purchase',
        'amount' => -$order->total_price,
        'fee' => 0,
        'net_amount' => -$order->total_price,
        'description' => "Purchase: {$order->product->title}",
        'status' => 'completed'
      ]);

      Transaction::create([
        'user_id' => $order->seller_id,
        'order_id' => $order->id,
        'type' => 'sale',
        'amount' => $order->total_price,
        'fee' => $commission,
        'net_amount' => $sellerEarnings,
        'description' => "Sale: {$order->product->title}",
        'status' => 'completed'
      ]);

      $sellerWallet = Wallet::where('user_id', $order->seller_id)->first();
      if (!$sellerWallet) {
        $sellerWallet = Wallet::create(['user_id' => $order->seller_id]);
      }

      $sellerWallet->balance += $sellerEarnings;
      $sellerWallet->total_earnings += $sellerEarnings;
      $sellerWallet->save();

      $order->product->is_sold = true;
      $order->product->save();

      $order->status = 'confirmed';
      $order->payment_status = 'completed';
      $order->save();
    });
  }

  public function processCallCreditPurchase($userId, $amount, $paymentMethod)
  {
    $wallet = Wallet::where('user_id', $userId)->firstOrFail();

    // In real implementation, integrate with payment gateway
    // For now, we'll just add to wallet
    $wallet->deposit($amount, "Call credits purchase via {$paymentMethod}");

    Transaction::create([
      'user_id' => $userId,
      'type' => 'deposit',
      'amount' => $amount,
      'net_amount' => $amount,
      'description' => "Call credits purchase",
      'status' => 'completed'
    ]);
  }

  public function chargeForPremiumCall($callId)
  {
    $call = VideoCall::find($callId);
    $ratePerMinute = 0.10; // $0.10 per minute
    $minutes = ceil($call->duration / 60);
    $chargeAmount = $minutes * $ratePerMinute;

    $wallet = Wallet::where('user_id', $call->initiator_id)->first();

    if ($wallet && $wallet->canAfford($chargeAmount)) {
      $wallet->withdraw($chargeAmount, "Premium call charge - {$minutes} minutes");

      // Record platform revenue
      $platformCommission = $chargeAmount * 0.3; // 30% platform commission
      $this->recordPlatformRevenue($platformCommission, 'premium_call');

      CallTransaction::create([
        'call_id' => $callId,
        'user_id' => $call->initiator_id,
        'amount' => $chargeAmount,
        'type' => 'call_charge',
        'description' => "Premium call - {$minutes} minutes",
        'status' => 'completed'
      ]);

      return true;
    }

    return false;
  }
  public function processSponsoredPost($userId, $postId, $duration)
  {
    $cost = 500 * $duration;

    $userWallet = Wallet::where('user_id', $userId)->first();
    if (!$userWallet || !$userWallet->canAfford($cost)) {
      throw new \Exception('Insufficient balance for sponsored post');
    }

    DB::transaction(function () use ($userId, $postId, $duration, $cost, $userWallet) {
      $userWallet->withdraw($cost, "Sponsored post for {$duration} days");

      Transaction::create([
        'user_id' => $userId,
        'type' => 'sponsored_post',
        'amount' => -$cost,
        'net_amount' => -$cost,
        'description' => "Sponsored post for {$duration} days",
        'status' => 'completed'
      ]);

      \App\Models\Post::where('id', $postId)->update([
        'is_sponsored' => true,
        'sponsored_until' => now()->addDays($duration)
      ]);
    });
  }
}