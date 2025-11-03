<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:reset-password {--email=kelly123simiyu@gmail.com : Admin email} {--password= : New password; if omitted uses ADMIN_PASSWORD env or default}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the admin user password (local/dev only)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Safety: refuse to run in production environment
        if (app()->environment('production')) {
            $this->error('Refusing to run in production environment.');
            return 1;
        }

        $email = $this->option('email') ?? 'kelly123simiyu@gmail.com';
        $password = $this->option('password') ?: env('ADMIN_PASSWORD', 'flo341');

        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("Password for {$email} reset successfully.");
        $this->info('New password comes from the --password option or ADMIN_PASSWORD env var.');

        return 0;
    }
}
