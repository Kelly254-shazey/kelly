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

    // Use the official Fruitcake CORS middleware which uses config/cors.php
    \Fruitcake\Cors\HandleCors::class,
  ];
}