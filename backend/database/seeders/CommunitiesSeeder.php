<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Community;
use App\Models\User;

class CommunitiesSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::first();

        $communities = [
            ['name' => 'Nairobi Tech Enthusiasts', 'description' => 'For tech lovers in Nairobi to share ideas and opportunities'],
            ['name' => 'Kenya Entrepreneurs', 'description' => 'Network with fellow entrepreneurs across Kenya'],
            ['name' => 'Photography Club', 'description' => 'Share and critique photos'],
        ];

        foreach ($communities as $c) {
            $community = Community::create([
                'name' => $c['name'],
                'slug' => \Illuminate\Support\Str::slug($c['name']) . '-' . \Illuminate\Support\Str::random(4),
                'description' => $c['description'],
                'owner_id' => $owner->id,
                'privacy' => 'public'
            ]);
            $community->members()->attach($owner->id);
        }
    }
}
