<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);

        $user = User::query()
            ->select(['id', 'name', 'email', 'password', 'role', 'category', 'is_active', 'last_login_at'])
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte inactif. Contactez l administrateur.'], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'user' => $user->makeHidden(['password']),
            'token' => $user->createToken('api-token')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Deconnecte']);
    }
}
