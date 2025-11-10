<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductLike;
use App\Models\User;
use App\Models\Order;
use Laravel\Sanctum\PersonalAccessToken;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarketplaceController extends Controller
{
  public function products(Request $request)
  {
    // Resolve bearer token manually for this public route
    if (!$request->user() && $request->bearerToken()) {
      $token = PersonalAccessToken::findToken($request->bearerToken());

      if ($token) {
        $request->setUserResolver(function () use ($token) {
          return $token->tokenable;
        });
      }
    }

    $query = Product::with('user')
      ->available()
      ->when($request->category, function ($q) use ($request) {
        $q->where('category', $request->category);
      })
      ->when($request->county, function ($q) use ($request) {
        $q->where('county', $request->county);
      })
      ->when($request->condition, function ($q) use ($request) {
        $q->where('condition', $request->condition);
      })
      ->when($request->min_price, function ($q) use ($request) {
        $q->where('price', '>=', $request->min_price);
      })
      ->when($request->max_price, function ($q) use ($request) {
        $q->where('price', '<=', $request->max_price);
      })
      ->orderBy('created_at', 'desc');

    $products = $query->paginate(12);

    // Add like status for authenticated user
    $products->getCollection()->transform(function ($product) use ($request) {
      $user = $request->user();
      $product->is_liked = $user ? $product->isLikedBy($user) : false;
      $product->likes_count = $product->likes()->count();
      return $product;
    });

    return response()->json($products);
  }

  public function storeProduct(Request $request)
  {
    $request->validate([
      'title' => 'required|string|max:255',
      'description' => 'required|string|max:2000',
      'price' => 'required|numeric|min:0',
      'category' => 'required|string|max:255',
      'condition' => 'required|in:new,used,refurbished',
      'county' => 'required|string|max:255',
      'location' => 'required|string|max:255',
      'images' => 'required|array|min:1|max:5',
      'images.*' => 'image|mimes:jpeg,png,jpg|max:2048'
    ]);

    $imagePaths = [];
    foreach ($request->file('images') as $image) {
      $path = $image->store('products', 'public');
      $imagePaths[] = Storage::url($path);
    }

    $product = Product::create([
      'user_id' => $request->user()->id,
      'title' => $request->title,
      'description' => $request->description,
      'price' => $request->price,
      'category' => $request->category,
      'condition' => $request->condition,
      'county' => $request->county,
      'location' => $request->location,
      'images' => $imagePaths
    ]);

    return response()->json([
      'product' => $product->load('user')
    ], 201);
  }

  public function purchase(Request $request, Product $product)
  {
    if ($product->user_id === $request->user()->id) {
      return response()->json(['message' => 'Cannot purchase your own product'], 400);
    }

    if ($product->is_sold) {
      return response()->json(['message' => 'Product already sold'], 400);
    }

    $order = Order::create([
      'product_id' => $product->id,
      'buyer_id' => $request->user()->id,
      'seller_id' => $product->user_id,
      'quantity' => 1,
      'total_price' => $product->price,
      'status' => 'pending',
      'payment_status' => 'pending'
    ]);

    return response()->json([
      'order' => $order->load(['product', 'seller'])
    ], 201);
  }

  public function confirmPurchase(Request $request, Order $order)
  {
    if ($order->seller_id !== $request->user()->id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $transactionService = new TransactionService();
    $transactionService->processSale($order->id);

    return response()->json([
      'message' => 'Purchase confirmed successfully'
    ]);
  }

  public function like(Request $request, Product $product)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['message' => 'Authentication required'], 401);
    }

    // Check if user already liked this product
    if ($product->isLikedBy($user)) {
      // Idempotent: if already liked, return success with current likes_count
      return response()->json([
        'message' => 'Product already liked',
        'likes_count' => $product->likes()->count()
      ], 200);
    }

    ProductLike::create([
      'user_id' => $user->id,
      'product_id' => $product->id
    ]);

    return response()->json([
      'message' => 'Product liked successfully',
      'likes_count' => $product->likes()->count()
    ]);
  }

  public function unlike(Request $request, Product $product)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['message' => 'Authentication required'], 401);
    }

    $like = ProductLike::where('user_id', $user->id)
      ->where('product_id', $product->id)
      ->first();

    if (!$like) {
      // Idempotent: if not liked, return success with current likes_count
      return response()->json([
        'message' => 'Product not liked',
        'likes_count' => $product->likes()->count()
      ], 200);
    }

    $like->delete();

    return response()->json([
      'message' => 'Product unliked successfully',
      'likes_count' => $product->likes()->count()
    ]);
  }
}