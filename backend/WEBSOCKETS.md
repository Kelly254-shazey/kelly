Local WebSockets (laravel-websockets) Setup

This document helps you enable local broadcasting and run laravel-websockets for development so real-time features (calls, notifications) work locally.

1) Install the package (run in backend directory):

   # From PowerShell (backend folder):
   composer require beyondcode/laravel-websockets

2) Publish config & migrations, then migrate:

   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan migrate

3) .env changes (example):

   BROADCAST_DRIVER=pusher
   PUSHER_APP_ID=local
   PUSHER_APP_KEY=local
   PUSHER_APP_SECRET=local
   PUSHER_APP_CLUSTER=mt1
   PUSHER_HOST=127.0.0.1
   PUSHER_PORT=6001
   PUSHER_SCHEME=http

   # Frontend (vite .env):
   VITE_ENABLE_WS=true
   VITE_WS_DRIVER=echo
   VITE_PUSHER_APP_KEY=local
   VITE_PUSHER_HOST=127.0.0.1
   VITE_PUSHER_PORT=6001
   VITE_PUSHER_FORCE_TLS=false

4) Start the websockets server (backend):

   php artisan websockets:serve

5) Notes

- laravel-websockets implements the Pusher protocol locally. The frontend Echo config in `EchoContext.jsx` already defaults to Pusher. Use the VITE_* env variables above to enable it.
- If you prefer a socket.io based approach, set `VITE_WS_DRIVER=socketio` and run your own socket server; you'd need to forward events from the Laravel app (e.g., via Redis pub/sub or a custom bridge).

Optional helper script (PowerShell): `backend/scripts/start-websockets.ps1` can be created to wrap the commands.
