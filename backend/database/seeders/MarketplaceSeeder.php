<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MarketplaceSeeder extends Seeder
{
    public function run()
    {
        // Create a demo seller user
        $seller = User::firstOrCreate([
            'email' => 'seller@example.com'
        ], [
            'name' => 'Demo Seller',
            'username' => 'demoseller',
            'password' => Hash::make('password'),
        ]);

        // Create a few sample products
        $products = [
            [
                'user_id' => $seller->id,
                'title' => 'Demo Phone',
                'description' => 'A demo smartphone for testing',
                'price' => 15000.00,
                'category' => 'Electronics',
                'condition' => 'used',
                'county' => 'Nairobi',
                'location' => 'Westlands',
                'images' => json_encode(['/default-product.svg']),
            ],
            [
                'user_id' => $seller->id,
                'title' => 'Demo Bicycle',
                'description' => 'A demo mountain bike',
                'price' => 30000.00,
                'category' => 'Sports',
                'condition' => 'used',
                'county' => 'Kiambu',
                'location' => 'Thika',
                'images' => json_encode(['/default-product.svg']),
            ]
        ];

        foreach ($products as $p) {
            Product::firstOrCreate([
                'title' => $p['title'],
                'user_id' => $p['user_id']
            ], $p);
        }
    }
}
