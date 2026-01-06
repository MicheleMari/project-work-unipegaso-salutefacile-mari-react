<?php

use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\InvestigationController;
use App\Http\Controllers\InvestigationPerformedController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\SpecialistInvestigationController;
use App\Http\Controllers\SpecialistInvestigationRequestController;
use App\Http\Controllers\SpecialistVisitController;
use App\Http\Controllers\TriageSuggestController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('emergencies', EmergencyController::class);
    Route::apiResource('investigations', InvestigationController::class);
    Route::apiResource('investigations-performed', InvestigationPerformedController::class);
    Route::apiResource('specialist-investigations', SpecialistInvestigationController::class);
    Route::apiResource('specialist-investigation-requests', SpecialistInvestigationRequestController::class);
    Route::apiResource('specialist-visits', SpecialistVisitController::class);
    Route::apiResource('attachments', AttachmentController::class);
    Route::get('users', [UserController::class, 'index']);
    Route::post('triage-suggest', TriageSuggestController::class);
});
