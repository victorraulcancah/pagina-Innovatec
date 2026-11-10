<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! auth('api')->attempt($credentials, false)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        $user = auth('api')->getLastAttempted();

        // Esta entrada no pide el código: una cuenta con verificación en dos pasos solo entra por el panel.
        if ($user->hasTwoFactor()) {
            return response()->json(['message' => 'Esta cuenta usa verificación en dos pasos: inicia sesión desde el panel.'], 403);
        }

        return $this->tokenResponse(auth('api')->login($user));
    }

    public function me(): JsonResponse
    {
        return response()->json(auth('api')->user());
    }

    public function refresh(): JsonResponse
    {
        return $this->tokenResponse(auth('api')->refresh());
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    private function tokenResponse(string $token): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl') * 60,
        ]);
    }
}
