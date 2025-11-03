<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Event;

class MessagingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_user_can_send_a_direct_message_to_another_user()
    {
    // Ensure a default role exists (users table has role_id default=1 FK)
    Role::create(['name' => 'user']);

    // Create two users
    $sender = User::factory()->create();
    $recipient = User::factory()->create();

        // Act as the sender via sanctum
        $this->actingAs($sender, 'sanctum');

        // Prevent broadcasting to external services during tests
        Event::fake();

        // Send a message by specifying the recipient user_id
        $payload = [
            'user_id' => $recipient->id,
            'content' => 'Hello from test',
        ];

        $response = $this->postJson('/api/messages', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message' => [
                'id', 'conversation_id', 'user_id', 'content', 'created_at'
            ],
            'conversation' => [
                'id', 'type', 'created_by'
            ]
        ]);

        // Ensure message exists in the database
        $this->assertDatabaseHas('messages', [
            'content' => 'Hello from test',
            'user_id' => $sender->id,
        ]);
    }
}
