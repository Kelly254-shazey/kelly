<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Order;
use App\Models\AdRevenue;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
  public function dashboardStats()
  {
    $stats = [
      'users' => [
        'total' => User::count(),
        'new_today' => User::whereDate('created_at', today())->count(),
        'active' => User::where('last_active_at', '>=', now()->subDay())->count(),
      ],
      'content' => [
        'posts' => Post::count(),
        'comments' => DB::table('comments')->count(),
        'messages' => DB::table('messages')->count(),
      ],
      'marketplace' => [
        'products' => DB::table('products')->where('is_sold', false)->count(),
        'sales' => Order::where('status', 'confirmed')->count(),
        'revenue' => Transaction::where('type', 'sale')->sum('fee'),
      ],
      'ads' => [
        'impressions_today' => DB::table('ad_impressions')->whereDate('created_at', today())->count(),
        'clicks_today' => DB::table('ad_clicks')->whereDate('created_at', today())->count(),
        'revenue_today' => AdRevenue::whereDate('date', today())->sum('revenue'),
      ]
    ];

    return response()->json($stats);
  }

  public function users(Request $request)
  {
    $users = User::with('role')
      ->when($request->search, function ($query) use ($request) {
        $query->where('name', 'like', "%{$request->search}%")
          ->orWhere('email', 'like', "%{$request->search}%");
      })
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return response()->json(['users' => $users]);
  }

  public function updateUserRole(Request $request, User $user)
  {
    $request->validate([
      'role_id' => 'required|exists:roles,id'
    ]);

    $user->update(['role_id' => $request->role_id]);

    return response()->json(['message' => 'User role updated']);
  }

  public function adRevenueReport(Request $request)
  {
    $revenue = AdRevenue::with('placement.campaign')
      ->when($request->start_date, function ($query) use ($request) {
        $query->where('date', '>=', $request->start_date);
      })
      ->when($request->end_date, function ($query) use ($request) {
        $query->where('date', '<=', $request->end_date);
      })
      ->orderBy('date', 'desc')
      ->get();

    $summary = [
      'total_revenue' => $revenue->sum('revenue'),
      'total_impressions' => $revenue->sum('impressions'),
      'total_clicks' => $revenue->sum('clicks'),
      'ctr' => $revenue->sum('impressions') > 0 ?
        ($revenue->sum('clicks') / $revenue->sum('impressions')) * 100 : 0
    ];

    return response()->json([
      'revenue' => $revenue,
      'summary' => $summary
    ]);
  }
}