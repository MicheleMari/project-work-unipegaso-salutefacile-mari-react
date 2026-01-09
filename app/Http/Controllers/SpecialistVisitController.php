<?php

namespace App\Http\Controllers;

use App\Models\SpecialistVisit;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SpecialistVisitController extends Controller
{
    public function index()
    {
        $user = request()->user();
        if ($user) {
            $user->loadMissing('permission');
        }

        return SpecialistVisit::with(['patient', 'department', 'user', 'emergency'])
            ->when(
                $user?->permission?->name === 'Specialista',
                fn ($query) => $query->where('user_id', $user->id),
            )
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'emergency_id' => 'required|exists:emergencies,id',
            'status' => 'nullable|string|in:scheduled,in_progress,waiting_report,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'report_expected_at' => 'nullable|date',
            'report_received_at' => 'nullable|date',
            'needs_follow_up' => 'nullable|boolean',
            'disposition' => 'nullable|string|max:60',
            'notes' => 'nullable|string',
        ]);

        return response(SpecialistVisit::create($data)->load(['patient', 'department', 'user', 'emergency']), Response::HTTP_CREATED);
    }

    public function show(SpecialistVisit $specialistVisit)
    {
        $user = request()->user();
        if ($user) {
            $user->loadMissing('permission');
        }
        if ($user?->permission?->name === 'Specialista' && $specialistVisit->user_id !== $user->id) {
            return response()->json(['message' => 'Visita non assegnata'], Response::HTTP_FORBIDDEN);
        }

        return $specialistVisit->load(['patient', 'department', 'user', 'emergency']);
    }

    public function update(Request $request, SpecialistVisit $specialistVisit)
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('permission');
        }
        if ($user?->permission?->name === 'Specialista' && $specialistVisit->user_id !== $user->id) {
            return response()->json(['message' => 'Visita non assegnata'], Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'emergency_id' => 'required|exists:emergencies,id',
            'status' => 'nullable|string|in:scheduled,in_progress,waiting_report,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'report_expected_at' => 'nullable|date',
            'report_received_at' => 'nullable|date',
            'needs_follow_up' => 'nullable|boolean',
            'disposition' => 'nullable|string|max:60',
            'notes' => 'nullable|string',
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
