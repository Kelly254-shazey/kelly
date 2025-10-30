// database/migrations/2024_01_01_000029_create_stream_messages_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('stream_messages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('stream_id')->constrained('live_streams')->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->text('content');
      $table->timestamps();
    });
  }
  public function down()
  {
    Schema::dropIfExists('stream_messages');
  }
};