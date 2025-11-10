<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserTableSeeder extends Seeder
{
  public function run()
  {
    $users = [
      [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make('password'),
        'county' => 'Nairobi',
        'gender' => 'male',
        'role_id' => 1,
      ],
      [
        'name' => 'Sarah Smith',
        'email' => 'sarah@example.com',
        'password' => Hash::make('password'),
        'county' => 'Mombasa',
        'gender' => 'female',
        'role_id' => 1,
      ],
      [
        'name' => 'Mike Johnson',
        'email' => 'mike@example.com',
        'password' => Hash::make('password'),
        'county' => 'Kisumu',
        'gender' => 'male',
        'role_id' => 2, // Seller
      ],
    ];

    foreach ($users as $userData) {
      $user = User::create($userData);
      Wallet::create(['user_id' => $user->id]);
    }
  }
}