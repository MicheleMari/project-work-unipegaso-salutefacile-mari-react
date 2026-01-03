<?php

namespace App\Http\Controllers;

use App\Models\InvestigationPerformed;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvestigationPerformedController extends Controller
{
    public function index()
    {
        return InvestigationPerformed::with(['emergency', 'investigation', 'performer', 'attachment'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'emergency_id' => 'required|exists:emergencies,id',
            'investigation_id' => 'required|exists:investigations,id',
            'performed_by' => 'required|exists:users,id',
            'performed_at' => 'nullable|date',
            'outcome' => 'nullable|string',
            'notes' => 'nullable|string',
            'attachment_id' => 'nullable|exists:attachments,id',
        ]);

        return response(
            InvestigationPerformed::create($data)->load(['emergency', 'investigation', 'performer', 'attachment']),
            Response::HTTP_CREATED
        );
    }

    public function show(InvestigationPerformed $investigationsPerformed)
    {
        return $investigationsPerformed->load(['emergency', 'investigation', 'performer', 'attachment']);
    }

    public function update(Request $request, InvestigationPerformed $investigationsPerformed)
    {
        $data = $request->validate([
            'emergency_id' => 'required|exists:emergencies,id',
            'investigation_id' => 'required|exists:investigations,id',
            'performed_by' => 'required|exists:users,id',
            'performed_at' => 'nullable|date',
            'outcome' => 'nullable|string',
            'notes' => 'nullable|string',
            'attachment_id' => 'nullable|exists:attachments,id',
        ]);

        $investigationsPerformed->update($data);

        return $investigationsPerformed->fresh()->load(['emergency', 'investigation', 'performer', 'attachment']);
    }

    public function destroy(InvestigationPerformed $investigationsPerformed)
    {
        $investigationsPerformed->delete();

        return response()->noContent();
    }
}
