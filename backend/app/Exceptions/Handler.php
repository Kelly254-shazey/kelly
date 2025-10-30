<?php
namespace App\Http\Resources;

use Illuminate\Http\Exceptions\Json\JsonResource;

class UserResource extends JsonResource
{
public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        return response()->json([
            'error' => true,
            'message' => $this->getErrorMessage($exception),
            'code' => $this->getErrorCode($exception)
        ], $this->getStatusCode($exception));
    }

    return parent::render($request, $exception);
}

private function getErrorMessage($exception)
{
    if ($exception instanceof ValidationException) {
        return 'Validation failed';
    }
    if ($exception instanceof ModelNotFoundException) {
        return 'Resource not found';
    }
    return $exception->getMessage();
}

private function getStatusCode($exception)
{
    if ($exception instanceof ValidationException) return 422;
    if ($exception instanceof ModelNotFoundException) return 404;
    if ($exception instanceof AuthenticationException) return 401;
    return 500;
}
}