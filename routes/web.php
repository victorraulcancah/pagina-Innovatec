<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BlogAdminController;
use App\Http\Controllers\Admin\HomeSettingController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactMessageController;
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
Route::get('blog', [BlogController::class, 'index'])->name('blog');
Route::get('blog/{category}', [BlogController::class, 'index'])->name('blog.category');
Route::get('blog/{category}/{slug}', [BlogController::class, 'show'])->name('blog.post');
Route::post('contacto', [ContactMessageController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::get('{kind}', [OfferingController::class, 'index'])->whereIn('kind', ['soluciones', 'servicios'])->name('offerings');
Route::get('{kind}/{slug}', [OfferingController::class, 'show'])->whereIn('kind', ['soluciones', 'servicios'])->name('offering');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store'])->middleware('throttle:6,1')->name('login.store');

    Route::middleware(AuthenticateAdmin::class)->group(function () {
        Route::get('/', [HomeSettingController::class, 'edit'])->name('home');
        Route::post('inicio', [HomeSettingController::class, 'update'])->name('home.update');
        Route::get('blog', [BlogAdminController::class, 'index'])->name('blog');
        Route::post('blog/posts', [BlogAdminController::class, 'storePost'])->name('blog.posts.store');
        Route::post('blog/posts/{post}', [BlogAdminController::class, 'updatePost'])->name('blog.posts.update');
        Route::delete('blog/posts/{post}', [BlogAdminController::class, 'destroyPost'])->name('blog.posts.destroy');
        Route::post('blog/categories', [BlogAdminController::class, 'storeCategory'])->name('blog.categories.store');
        Route::post('blog/categories/{category}', [BlogAdminController::class, 'updateCategory'])->name('blog.categories.update');
        Route::delete('blog/categories/{category}', [BlogAdminController::class, 'destroyCategory'])->name('blog.categories.destroy');
        Route::get('mensajes', [MessageController::class, 'index'])->name('messages');
        Route::post('mensajes/{message}/leida', [MessageController::class, 'markRead'])->name('messages.read');
        Route::delete('mensajes/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
        Route::get('cuenta', [AccountController::class, 'edit'])->name('account');
        Route::post('cuenta', [AccountController::class, 'update'])->name('account.update');
        Route::get('{page}', [SectionController::class, 'edit'])->whereIn('page', array_keys(SiteSections::pages()))->name('section.edit');
        Route::post('{page}', [SectionController::class, 'update'])->whereIn('page', array_keys(SiteSections::pages()))->name('section.update');
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
    });
});
