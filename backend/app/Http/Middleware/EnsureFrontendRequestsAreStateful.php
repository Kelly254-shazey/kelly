<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Pipeline;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class EnsureFrontendRequestsAreStateful
{
  public function handle($request, $next)
  {
    $this->configureSecureCookieSessions();

    return (new Pipeline(app()))
      ->send($request)
      ->through($this->frontendMiddleware())
      ->then(function ($request) use ($next) {
        return $next($request);
      });
  }

  protected function configureSecureCookieSessions()
  {
    config([
      'session.http_only' => true,
      'session.same_site' => 'lax',
    ]);
  }

  protected function frontendMiddleware()
  {
    return collect([
      \Illuminate\Cookie\Middleware\EncryptCookies::class,
      \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
      \Illuminate\Session\Middleware\StartSession::class,
      \Illuminate\View\Middleware\ShareErrorsFromSession::class,
      \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
      \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
  }
}