<?php

namespace App\Http\Controllers;

use App\Models\SpecialistInvestigationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class SpecialistInvestigationRequestController extends Controller
{
    public function index()
    {
        return SpecialistInvestigationRequest::with([
            'emergency.patient',
            'specialistInvestigation',
            'requester',
            'specialistVisit',
        ])->get();
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        return response(
            SpecialistInvestigationRequest::create($data)->load([
                'emergency.patient',
                'specialistInvestigation',
                'requester',
                'specialistVisit',
            ]),
            Response::HTTP_CREATED,
        );
    }

    public function show(SpecialistInvestigationRequest $specialistInvestigationRequest)
    {
        return $specialistInvestigationRequest->load([
            'emergency.patient',
            'specialistInvestigation',
            'requester',
            'specialistVisit',
        ]);
    }

    public function update(Request $request, SpecialistInvestigationRequest $specialistInvestigationRequest)
    {
        $data = $this->validatePayload($request, $specialistInvestigationRequest);

        $specialistInvestigationRequest->update($data);

        return $specialistInvestigationRequest->fresh()->load([
            'emergency.patient',
            'specialistInvestigation',
            'requester',
            'specialistVisit',
        ]);
    }

    public function destroy(SpecialistInvestigationRequest $specialistInvestigationRequest)
    {
        $specialistInvestigationRequest->delete();

        return response()->noContent();
    }

    protected function validatePayload(Request $request, ?SpecialistInvestigationRequest $existing = null): array
    {
        return $request->validate([
            'emergency_id' => ['required', 'exists:emergencies,id'],
            'specialist_investigation_id' => ['required', 'exists:specialist_investigations,id'],
            'requested_by' => ['required', 'exists:users,id'],
            'specialist_visit_id' => ['nullable', 'exists:specialist_visits,id'],
            'status' => [
                'required',
                'string',
                'max:40',
                Rule::in(['requested', 'scheduled', 'in_progress', 'waiting_report', 'completed', 'cancelled']),
            ],
            'requested_at' => ['nullable', 'date'],
            'scheduled_at' => ['nullable', 'date'],
            'report_expected_at' => ['nullable', 'date'],
            'report_received_at' => ['nullable', 'date'],
            'outcome' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'follow_up_action' => ['nullable', 'string', 'max:120'],
            'disposition' => ['nullable', 'string', 'max:60'],
        ]);
    }
}
