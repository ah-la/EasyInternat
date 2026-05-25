<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StagiaireController;
use App\Http\Controllers\Api\ChambreController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PresenceController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\SortieController;
use App\Http\Controllers\Api\ResponsableController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/demandes', [DemandeController::class, 'store']);
Route::post('/verify-candidat', [DemandeController::class, 'verifyCandidat']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:admin,responsable');

    Route::middleware('role:admin,responsable')->group(function () {
        Route::apiResource('/demandes', DemandeController::class)->except(['store']);
        Route::post('/demandes/{demande}/accept', [DemandeController::class, 'accept']);
        Route::post('/demandes/{demande}/refuse', [DemandeController::class, 'refuse']);
        Route::apiResource('/stagiaires', StagiaireController::class);
        Route::apiResource('/chambres', ChambreController::class);
        Route::apiResource('/paiements', PaiementController::class);
        Route::get('/presences', [PresenceController::class, 'index']);
        Route::apiResource('/sorties', SortieController::class)->except(['show', 'store']);
        Route::apiResource('/reclamations', ReclamationController::class)->except(['store']);
        Route::get('/pdf/{type}', [PdfController::class, 'export']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/responsables', ResponsableController::class)->except(['show']);
    });

    Route::middleware('role:stagiaire')->group(function () {
        Route::post('/presences/mark', [PresenceController::class, 'mark']);
        Route::post('/sorties', [SortieController::class, 'store']);
        Route::post('/reclamations', [ReclamationController::class, 'store']);
    });
});
