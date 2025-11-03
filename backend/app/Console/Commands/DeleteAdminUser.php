<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class DeleteAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:delete-user {--email= : Email of the user to delete (required)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete a user by email (local/dev only)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (app()->environment('production')) {
            $this->error('Refusing to run in production environment.');
            return 1;
        }

        $email = $this->option('email');
        if (! $email) {
            $this->error('Please provide --email option.');
            return 1;
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->info("No user found with email {$email}.");
            return 0;
        }

        // show brief summary and ask for confirmation
        $this->line("Found user: id={$user->id}, name={$user->name}, email={$user->email}");
        if (! $this->confirm('Are you sure you want to delete this user?')) {
            $this->info('Aborted.');
            return 1;
        }

        $user->delete();

        $this->info("User {$email} deleted successfully.");
        return 0;
    }
}
