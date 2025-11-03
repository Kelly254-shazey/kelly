<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;

class MakeAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:make-admin {--email= : Email of the user to promote} {--role=super_admin : Role name to assign}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign the admin role to a user by email (local/dev only)';

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

        $roleName = $this->option('role') ?: 'super_admin';

        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $role = Role::firstOrCreate(['name' => $roleName]);

        $this->line("Found user: id={$user->id}, name={$user->name}, email={$user->email}");
        if (! $this->confirm("Assign role '{$role->name}' to this user?")) {
            $this->info('Aborted.');
            return 1;
        }

        $user->role_id = $role->id;
        $user->save();

        $this->info("User {$email} promoted to role '{$role->name}'.");
        return 0;
    }
}
