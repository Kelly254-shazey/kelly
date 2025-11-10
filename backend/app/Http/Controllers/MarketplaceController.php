<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarketplaceController extends Controller
{
  public function products(Request $request)
  {
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
}