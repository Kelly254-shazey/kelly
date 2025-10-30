// database/migrations/2024_01_01_000028_create_stream_viewers_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('stream_viewers', function (Blueprint $table) {
      $table->id();
      $table->foreignId('stream_id')->constrained('live_streams')->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->timestamp('joined_at')->useCurrent();
      $table->timestamps();
    });
  }
  public function down()
  {
    Schema::dropIfExists('stream_viewers');
  }
};