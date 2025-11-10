<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;


class Kernel extends HttpKernel
{
  
  protected $routeMiddleware = [
    // ... existing middleware
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
  ];
  protected $middleware = [
    // Use the official Fruitcake CORS middleware which uses config/cors.php.
    // Place it early so preflight (OPTIONS) requests get CORS headers before
    // other middleware (like Sanctum) can short-circuit the response.
    \Fruitcake\Cors\HandleCors::class,

    // Sanctum's middleware can inspect cookies; ensure it runs after CORS
    // so responses (including OPTIONS) include the proper CORS headers.
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
  ];
}