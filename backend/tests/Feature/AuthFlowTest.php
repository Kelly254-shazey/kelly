<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_register_login_and_fetch_user_via_token()
    {
        // Ensure default role exists so FK constraints succeed
        \App\Models\Role::create(['name' => 'User']);

        // Register
        $registerPayload = [
            'first_name' => 'Smoke',
            'last_name' => 'Tester',
            'email' => 'smoke@example.com',
            'password' => 'password123',
            'date_of_birth' => '1990-01-01',
            'county' => 'Nairobi',
            'gender' => 'other',
            'terms' => true,
        ];

        $this->postJson('/api/auth/register', $registerPayload)
            ->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);

        // Login
        $loginPayload = [
            'email' => 'smoke@example.com',
            'password' => 'password123'
        ];

        $loginResp = $this->postJson('/api/auth/login', $loginPayload)
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token'])
            ->json();

        $token = $loginResp['token'];

        // Fetch authenticated user
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/user')
            ->assertStatus(200)
            ->assertJsonFragment(['email' => 'smoke@example.com']);
    }
}
