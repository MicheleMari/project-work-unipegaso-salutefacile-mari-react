<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AttachmentController extends Controller
{
    public function index()
    {
        return Attachment::with(['investigationPerformed', 'specialistVisit'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'investigation_id' => 'nullable|exists:investigations_performed,id',
            'specialist_visit_id' => 'nullable|exists:specialist_visits,id',
            'storage_path' => 'required|string|max:255',
            'original_name' => 'required|string|max:255',
            'mime_type' => 'required|string|max:100',
            'size_bytes' => 'nullable|integer|min:0',
        ]);

        return response(Attachment::create($data)->load(['investigationPerformed', 'specialistVisit']), Response::HTTP_CREATED);
    }

    public function show(Attachment $attachment)
    {
        return $attachment->load(['investigationPerformed', 'specialistVisit']);
    }

    public function update(Request $request, Attachment $attachment)
    {
        $data = $request->validate([
            'investigation_id' => 'nullable|exists:investigations_performed,id',
            'specialist_visit_id' => 'nullable|exists:specialist_visits,id',
            'storage_path' => 'required|string|max:255',
            'original_name' => 'required|string|max:255',
            'mime_type' => 'required|string|max:100',
            'size_bytes' => 'nullable|integer|min:0',
        ]);

        $attachment->update($data);

        return $attachment->fresh()->load(['investigationPerformed', 'specialistVisit']);
    }

    public function destroy(Attachment $attachment)
    {
        $attachment->delete();

        return response()->noContent();
    }
}
