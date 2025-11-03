<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_authenticated_user_profile()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id', 'name', 'email'
                ],
                'is_own_profile',
                'is_following',
                'friendship_status'
            ]);

        $this->assertEquals($user->id, $response->json('user.id'));
        $this->assertTrue($response->json('is_own_profile'));
    }

    /** @test */
    public function it_returns_other_user_profile()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/profile/' . $other->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id', 'name', 'email'
                ],
                'is_own_profile',
                'is_following',
                'friendship_status'
            ]);

        $this->assertEquals($other->id, $response->json('user.id'));
        $this->assertFalse($response->json('is_own_profile'));
    }
}
