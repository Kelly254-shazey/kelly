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
    // Other middleware...
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,

    \App\Http\Middleware\CorsMiddleware::class,
  ];
}