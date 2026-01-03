<?php

namespace App\Http\Controllers;

use App\Models\SpecialistVisit;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SpecialistVisitController extends Controller
{
    public function index()
    {
        return SpecialistVisit::with(['patient', 'department', 'user', 'emergency'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'emergency_id' => 'required|exists:emergencies,id',
        ]);

        return response(SpecialistVisit::create($data)->load(['patient', 'department', 'user', 'emergency']), Response::HTTP_CREATED);
    }

    public function show(SpecialistVisit $specialistVisit)
    {
        return $specialistVisit->load(['patient', 'department', 'user', 'emergency']);
    }

    public function update(Request $request, SpecialistVisit $specialistVisit)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'emergency_id' => 'required|exists:emergencies,id',
        ]);

        $specialistVisit->update($data);

        return $specialistVisit->fresh()->load(['patient', 'department', 'user', 'emergency']);
    }

    public function destroy(SpecialistVisit $specialistVisit)
    {
        $specialistVisit->delete();

        return response()->noContent();
    }
}
