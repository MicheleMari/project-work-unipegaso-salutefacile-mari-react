<?php

namespace App\Http\Controllers;

use App\Models\Emergency;
use App\Models\SpecialistVisit;
use App\Models\User;
use App\Notifications\SpecialistCalledNotification;
use App\Notifications\SpecialistReminderNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmergencyController extends Controller
{
    public function index()
    {
        $limit = (int) request('limit', 50);
        $limit = max(1, min($limit, 200)); // evita richieste troppo pesanti
        $user = request()->user();
        if ($user) {
            $user->loadMissing('permission');
        }

        return Emergency::query()
            ->select([
                'id',
                'description',
                'alert_code',
                'patient_id',
                'user_id',
                'specialist_id',
                'status',
                'result',
                'sended_to_ps',
                'notify_ps',
                'arrived_ps',
                'arrived_ps_at',
                'specialist_called_at',
                'created_at',
            ])
            ->with([
                'user:id,name,surname,permission_id',
                'user.permission:id,name',
                'patient:id,name,surname',
                'specialist:id,name,surname,department_id,avatar_path,is_available',
                'specialist.department:id,name',
            ])
            ->when(
                $user?->permission?->name === 'Operatore 118',
                fn ($query) => $query->where('user_id', $user->id),
            )
            ->when(
                $user?->permission?->name === 'Specialista',
                fn ($query) => $query->where('specialist_id', $user->id),
            )
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
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
            'result' => 'nullable|array',
            'sended_to_ps' => 'nullable|boolean',
            'notify_ps' => 'nullable|boolean',
            'arrived_ps' => 'nullable|boolean',
            'arrived_ps_at' => 'nullable|date',
        ]);

        $user = $request->user();
        if ($user) {
            $user->loadMissing('permission');
        }
        if ($user?->permission?->name === 'Operatore 118') {
            $data['user_id'] = $user->id;
            $data['arrived_ps'] = $data['arrived_ps'] ?? false;
            if (array_key_exists('notify_ps', $data) && $data['notify_ps'] === false) {
                $data['status'] = 'risolto_in_ambulanza';
            }
        }
        if ($user?->permission?->name === 'Operatore PS') {
            $data['notify_ps'] = false;
            $data['arrived_ps'] = true;
            $data['arrived_ps_at'] = now();
        }

        return response(Emergency::create($data), Response::HTTP_CREATED);
    }

    public function show(Emergency $emergency)
    {
        return $emergency->load(['user', 'patient']);
    }

    public function update(Request $request, Emergency $emergency)
    {
        $data = $request->validate([
            'description' => 'sometimes|nullable|string',
            'alert_code' => 'sometimes|nullable|in:bianco,verde,giallo,arancio,rosso',
            'user_id' => 'sometimes|exists:users,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'vital_signs' => 'sometimes|nullable|array',
            'status' => 'sometimes|nullable|string|max:50',
            'result' => 'sometimes|nullable|array',
            'sended_to_ps' => 'sometimes|boolean',
            'notify_ps' => 'sometimes|boolean',
            'arrived_ps' => 'sometimes|boolean',
            'arrived_ps_at' => 'sometimes|nullable|date',
        ]);

        if (array_key_exists('arrived_ps', $data) && $data['arrived_ps'] && ! $emergency->arrived_ps_at) {
            $data['arrived_ps_at'] = now();
        }

        $emergency->update($data);

        return $emergency->fresh(['user', 'patient']);
    }

    public function destroy(Emergency $emergency)
    {
        $emergency->delete();

        return response()->noContent();
    }

    public function callSpecialist(Request $request, Emergency $emergency)
    {
        $data = $request->validate([
            'specialist_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $specialist = User::findOrFail($data['specialist_id']);

        DB::transaction(function () use ($emergency, $specialist, $data) {
            $emergency->update([
                'specialist_id' => $specialist->id,
                'specialist_called_at' => now(),
                'status' => 'specialist_called',
            ]);

            $emergency->loadMissing('patient');

            if ($specialist->is_available !== false) {
                $specialist->forceFill(['is_available' => false])->save();
            }

            $specialist->notify(new SpecialistCalledNotification($emergency, $data['message'] ?? null));
        });

        return $emergency->load([
            'patient:id,name,surname',
            'specialist:id,name,surname,department_id,avatar_path,is_available',
            'specialist.department:id,name',
        ]);
    }

    public function remindSpecialist(Request $request, Emergency $emergency)
    {
        $data = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        if (! $emergency->specialist_id) {
            return response()->json(['message' => 'Nessuno specialista associato'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $specialist = User::findOrFail($emergency->specialist_id);
        $emergency->loadMissing('patient');

        $specialist->notify(new SpecialistReminderNotification($emergency, $data['message'] ?? null));

        return response()->json(['status' => 'reminded'], Response::HTTP_OK);
    }

    public function specialistReport(Request $request, Emergency $emergency)
    {
        $data = $request->validate([
            'notes' => 'required|string',
            'disposition' => 'nullable|string|max:60',
            'needs_follow_up' => 'nullable|boolean',
            'send_to_ps' => 'nullable|boolean',
        ]);

        $user = $request->user();
        if ($user) {
            $user->loadMissing('permission');
        }
        if (! $user || $user->permission?->name !== 'Specialista') {
            return response()->json(['message' => 'Utente non autorizzato'], Response::HTTP_FORBIDDEN);
        }
        if ($emergency->specialist_id !== $user->id) {
            return response()->json(['message' => 'Emergenza non assegnata'], Response::HTTP_FORBIDDEN);
        }
        if (! $user->department_id) {
            return response()->json(['message' => 'Reparto non associato allo specialista'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $visit = SpecialistVisit::firstOrCreate(
            [
                'emergency_id' => $emergency->id,
                'user_id' => $user->id,
            ],
            [
                'patient_id' => $emergency->patient_id,
                'department_id' => $user->department_id,
                'status' => 'in_progress',
            ],
        );

        $resultPayload = [
            'notes' => $data['notes'],
            'disposition' => $data['disposition'] ?? null,
            'needs_follow_up' => $data['needs_follow_up'] ?? false,
            'reported_at' => now()->toISOString(),
        ];

        $visit->update([
            'status' => 'completed',
            'report_received_at' => now(),
            'needs_follow_up' => $data['needs_follow_up'] ?? false,
            'disposition' => $data['disposition'] ?? null,
            'notes' => $data['notes'],
        ]);

        $emergency->update([
            'result' => $resultPayload,
            'sended_to_ps' => ! empty($data['send_to_ps']),
        ]);

        if (! empty($data['send_to_ps'])) {
            $emergency->update([
                'status' => 'chiusura',
            ]);
            if ($user->is_available === false) {
                $user->forceFill(['is_available' => true])->save();
            }
        }

        return response()->json([
            'emergency' => $emergency->fresh([
                'patient:id,name,surname',
                'specialist:id,name,surname,department_id,avatar_path,is_available',
                'specialist.department:id,name',
            ]),
            'visit' => $visit->fresh(['patient', 'department', 'user', 'emergency']),
        ]);
    }
}
