<?php

namespace App\Http\Controllers;

use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    public function index()
    {
        $communities = Community::withCount('members')->orderBy('members_count', 'desc')->paginate(12);
        return response()->json(['communities' => $communities]);
    }

    public function show(Community $community)
    {
        $community->load('owner');
        $isMember = auth()->check() ? $community->members()->where('user_id', auth()->id())->exists() : false;
        return response()->json(['community' => $community, 'is_member' => $isMember]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'privacy' => 'nullable|in:public,private'
        ]);

        $community = Community::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'description' => $request->description,
            'owner_id' => $request->user()->id,
            'privacy' => $request->privacy ?? 'public'
        ]);

        // owner automatically joins
        $community->members()->attach($request->user()->id);

        return response()->json(['community' => $community], 201);
    }

    public function join(Community $community)
    {
        $user = request()->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $community->members()->syncWithoutDetaching([$user->id]);

        return response()->json(['message' => 'Joined community']);
    }

    public function leave(Community $community)
    {
        $user = request()->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $community->members()->detach($user->id);

        return response()->json(['message' => 'Left community']);
    }
}
