<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ensure default roles exist so users with role_id default to 1 pass FK checks
        Role::firstOrCreate(['name' => 'User']);
        Role::firstOrCreate(['name' => 'Admin']);
        Role::firstOrCreate(['name' => 'Seller']);
    // Ensure super admin role exists
            $superRole = Role::firstOrCreate(['name' => 'super_admin']);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create or update the provided super admin account
            // Create or update the provided super admin account
            // Use ADMIN_PASSWORD env var when available for safer local provisioning
            $adminPassword = env('ADMIN_PASSWORD', 'flo341');

            User::updateOrCreate(
                ['email' => 'kelly123simiyu@gmail.com'],
                [
                    'name' => 'Kelly Simiyu',
                    'username' => 'kelly123simiyu',
                    'password' => Hash::make($adminPassword),
                'role_id' => $superRole->id,
            ]
        );

        // Seed demo marketplace data
        $this->call([\Database\Seeders\MarketplaceSeeder::class]);
    }
}
