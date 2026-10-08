<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/** Datos y contraseña de quien administra el sitio. */
class AccountController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/account', [
            'pages' => SiteSections::navigation(),
            'account' => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => ['required', 'current_password:api'],
            'password' => ['nullable', 'confirmed', Password::min(10)->letters()->numbers()],
        ], [
            'current_password.current_password' => 'La contraseña actual no es correcta.',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (filled($data['password'] ?? null)) {
            $user->password = $data['password'];
        }

        $user->save();

        return back()->with('status', 'Cuenta actualizada.');
    }
}
