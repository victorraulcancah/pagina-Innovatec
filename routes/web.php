<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\HomeSettingController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OfferingController;
use App\Http\Controllers\PageController;
use App\Http\Middleware\AuthenticateAdmin;
use App\Support\SiteSections;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('nosotros', [PageController::class, 'about'])->name('about');
Route::get('experiencia', [PageController::class, 'experience'])->name('experience');
Route::get('clientes', [PageController::class, 'clients'])->name('clients');
Route::get('contacto', [PageController::class, 'contact'])->name('contact');
Route::get('{kind}', [OfferingController::class, 'index'])->whereIn('kind', ['soluciones', 'servicios'])->name('offerings');
Route::get('{kind}/{slug}', [OfferingController::class, 'show'])->whereIn('kind', ['soluciones', 'servicios'])->name('offering');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store'])->middleware('throttle:6,1')->name('login.store');

    Route::middleware(AuthenticateAdmin::class)->group(function () {
        Route::get('/', [HomeSettingController::class, 'edit'])->name('home');
        Route::post('inicio', [HomeSettingController::class, 'update'])->name('home.update');
        Route::get('{page}', [SectionController::class, 'edit'])->whereIn('page', array_keys(SiteSections::pages()))->name('section.edit');
        Route::post('{page}', [SectionController::class, 'update'])->whereIn('page', array_keys(SiteSections::pages()))->name('section.update');
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
    });
});
