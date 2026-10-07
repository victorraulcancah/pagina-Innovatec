<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\HomeSettingController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\HomeController;
use App\Http\Middleware\AuthenticateAdmin;
use App\Support\SiteSections;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

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
