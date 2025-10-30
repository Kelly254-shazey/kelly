<?php
namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;

class WalletController extends Controller
{
  public function show()
  {
    $wallet = Wallet::where('user_id', request()->user()->id)->firstOrFail();

    return response()->json([
      'wallet' => $wallet,
      'transactions' => Transaction::where('user_id', request()->user()->id)
        ->orderBy('created_at', 'desc')
        ->paginate(20)
    ]);
  }

  public function deposit(Request $request)
  {
    $request->validate([
      'amount' => 'required|numeric|min:1',
      'method' => 'required|string'
    ]);

    $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();
    $wallet->deposit($request->amount, "Deposit via {$request->method}");

    return response()->json([
      'message' => 'Deposit successful',
      'new_balance' => $wallet->balance
    ]);
  }

  public function withdraw(Request $request)
  {
    $request->validate([
      'amount' => 'required|numeric|min:1',
      'method' => 'required|string'
    ]);

    $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();

    try {
      $wallet->withdraw($request->amount, "Withdrawal via {$request->method}");
      return response()->json([
        'message' => 'Withdrawal successful',
        'new_balance' => $wallet->balance
      ]);
    } catch (\Exception $e) {
      return response()->json(['message' => $e->getMessage()], 400);
    }
  }
}