<?php

namespace App\Http\Controllers;

use App\Models\Emergency;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmergencyController extends Controller
{
    public function index()
    {
        return Emergency::with(['user', 'patient'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'nullable|string',
            'alert_code' => 'nullable|in:bianco,verde,giallo,arancio,rosso',
            'user_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:patients,id',
            'vital_signs' => 'nullable|array',
            'status' => 'nullable|string|max:50',
        ]);

        return response(Emergency::create($data), Response::HTTP_CREATED);
    }

    public function show(Emergency $emergency)
    {
        return $emergency->load(['user', 'patient']);
    }

    public function update(Request $request, Emergency $emergency)
    {
        $data = $request->validate([
            'description' => 'nullable|string',
            'alert_code' => 'nullable|in:bianco,verde,giallo,arancio,rosso',
            'user_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:patients,id',
            'vital_signs' => 'nullable|array',
            'status' => 'nullable|string|max:50',
        ]);

        $emergency->update($data);

        return $emergency->fresh(['user', 'patient']);
    }

    public function destroy(Emergency $emergency)
    {
        $emergency->delete();

        return response()->noContent();
    }
}
