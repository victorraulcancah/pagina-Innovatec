<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // El rol Administrador (sembrado por la migración de roles), salvo que se pida otro con ->role().
            'role_id' => fn () => Role::query()->where('slug', 'admin')->value('id'),
            'active' => true,
        ];
    }

    /** El rol por su identificador (`editor`, `redactor`…) o el modelo ya creado. */
    public function role(Role|string $role): static
    {
        return $this->state(fn () => [
            'role_id' => $role instanceof Role ? $role->id : Role::query()->where('slug', $role)->value('id'),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
