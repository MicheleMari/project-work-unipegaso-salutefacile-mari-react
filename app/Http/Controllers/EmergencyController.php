<?php

namespace App\Http\Controllers;

use App\Models\Emergency;
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
            'description' => 'nullable|string',
            'alert_code' => 'nullable|in:bianco,verde,giallo,arancio,rosso',
            'user_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:patients,id',
            'vital_signs' => 'nullable|array',
            'status' => 'nullable|string|max:50',
            'notify_ps' => 'nullable|boolean',
            'arrived_ps' => 'nullable|boolean',
            'arrived_ps_at' => 'nullable|date',
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
}
