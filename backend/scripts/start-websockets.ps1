# Run this from the backend directory.
# Ensure you've run composer require beyondcode/laravel-websockets and published configs/migrations.

Write-Host "Starting laravel-websockets server..."
php artisan websockets:serve
