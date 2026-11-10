<?php

namespace App\Providers;

use App\Models\HomeSetting;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimits();

        // Favicon e imagen para compartir: vienen de "Datos de la empresa".
        View::composer('app', function ($view): void {
            try {
                $view->with('brand', HomeSetting::current()->headBranding());
            } catch (\Throwable) {
                $view->with('brand', null);
            }
        });
    }

    /**
     * Límites con nombre propio: los de `throttle:6,1` comparten un mismo contador por dirección, y activar la
     * verificación en dos pasos y entrar enseguida lo agotaría.
     */
    protected function configureRateLimits(): void
    {
        RateLimiter::for('two-factor-code', fn (Request $request) => Limit::perMinute(6)->by('code|'.$request->ip()));
        RateLimiter::for('two-factor-settings', fn (Request $request) => Limit::perMinute(10)->by('settings|'.$request->ip()));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
