<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
public function toArray($request)
{
return [
'id' => $this->id,
'content' => $this->content,
'media_url' => $this->media_url,
'media_type' => $this->media_type,
'visibility' => $this->visibility,
'likes_count' => $this->likes_count,
'comments_count' => $this->comments_count,
'is_liked' => $this->isLikedBy($request->user()),
'user' => new UserResource($this->user),
'comments' => CommentResource::collection($this->whenLoaded('comments')),
'created_at' => $this->created_at->toISOString(),
'updated_at' => $this->updated_at->toISOString(),
];
}
}