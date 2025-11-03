<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-admin {--email= : Email} {--password= : Password} {--name="Admin User" : Full name} {--username= : Username} {--create-wallet : Create wallet if missing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update an admin user and optionally create a wallet (local/dev only)';

    public function handle(): int
    {
        if (app()->environment('production')) {
            $this->error('Refusing to run in production environment.');
            return 1;
        }

        $email = $this->option('email') ?: $this->ask('Admin email');
        $password = $this->option('password') ?: $this->secret('Password (will not echo)');
        $name = $this->option('name') ?: 'Admin User';
        $username = $this->option('username') ?: explode('@', $email)[0];
        $createWallet = $this->option('create-wallet');

        if (! $email) {
            $this->error('Email is required.');
            return 1;
        }
        if (! $password) {
            $this->error('Password is required.');
            return 1;
        }

        $role = Role::firstOrCreate(['name' => 'super_admin']);

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'username' => $username,
                'password' => Hash::make($password),
                'role_id' => $role->id,
            ]
        );

        $this->info("Admin user created/updated: id={$user->id}, email={$user->email}");

        if ($createWallet) {
            $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0, 'total_earnings' => 0, 'total_spent' => 0]);
            $this->info("Wallet ensured for user id={$user->id}, wallet_id={$wallet->id}");
        } else {
            // ensure wallet exists silently if not present (useful default)
            if (! $user->wallet) {
                $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0, 'total_earnings' => 0, 'total_spent' => 0]);
                $this->info("Wallet created for user id={$user->id}, wallet_id={$wallet->id}");
            }
        }

        $this->info('Done. You can now login with the provided credentials.');
        return 0;
    }
}
