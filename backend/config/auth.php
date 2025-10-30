<?php

return [

  /*
  |--------------------------------------------------------------------------
  | Authentication Defaults
  |--------------------------------------------------------------------------
  |
  | This option controls the default authentication "guard" and password
  | reset options for your application. You may change these defaults
  | as required, but they're a perfect start for most applications.
  |
  */

  'defaults' => [
    'guard' => 'web',
    'passwords' => 'users',
  ],

  /*
  |--------------------------------------------------------------------------
  | Authentication Guards
  |--------------------------------------------------------------------------
  |
  | Next, you may define every authentication guard for your application.
  | A great default configuration has been defined for you here which
  | uses session storage and the Eloquent user provider.
  |
  | All authentication drivers have a user provider. This defines how
  | the users are actually retrieved out of your database or other
  | storage mechanisms used by this application to persist your data.
  |
  | Supported: "session", "token"
  |
  */

  'guards' => [
    'web' => [
      'driver' => 'session',
      'provider' => 'users',
    ],

    'api' => [
      'driver' => 'token',
      'provider' => 'users',
      'hash' => false,
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | User Providers
  |--------------------------------------------------------------------------
  |
  | All authentication drivers have a user provider. This defines how the
  | users are actually retrieved out of your database or other storage
  | mechanisms used by this application to persist your user's data.
  |
  | Supported: "database", "eloquent"
  |
  */

  'providers' => [
    'users' => [
      'driver' => 'eloquent',
      'model' => App\Models\User::class,
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | Resetting Passwords
  |--------------------------------------------------------------------------
  |
  | Here you may set the options for resetting passwords including the
  | view that is your password reset e-mail. You may also set the
  | table that maintains all of the reset tokens for your app.
  |
  | The expire time is the number of minutes that the reset token should
  | be considered valid. This security feature keeps tokens short-lived
  | so they have less time to be guessed. You may change this as needed.
  |
  */

  'passwords' => [
    'users' => [
      'provider' => 'users',
      'table' => 'password_reset_tokens',
      'expire' => 60,
      'throttle' => 60,
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | Password Confirmation Timeout
  |--------------------------------------------------------------------------
  |
  | Here you may define the amount of seconds before a password confirmation
  | times out and the user is prompted to re-enter their password on the
  | confirmation screen. By default, the timeout lasts for three hours.
  |
  */

  'password_timeout' => 10800,

];
