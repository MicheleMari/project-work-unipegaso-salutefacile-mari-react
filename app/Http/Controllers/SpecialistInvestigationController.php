<?php

namespace App\Http\Controllers;

use App\Models\SpecialistInvestigation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SpecialistInvestigationController extends Controller
{
    public function index()
    {
        return SpecialistInvestigation::with('department:id,name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150|unique:specialist_investigations,title',
            'description' => 'nullable|string',
            'discipline' => 'nullable|string|max:120',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        return response(SpecialistInvestigation::create($data), Response::HTTP_CREATED);
    }

    public function show(SpecialistInvestigation $specialistInvestigation)
    {
        return $specialistInvestigation;
    }

    public function update(Request $request, SpecialistInvestigation $specialistInvestigation)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150|unique:specialist_investigations,title,' . $specialistInvestigation->id,
            'description' => 'nullable|string',
            'discipline' => 'nullable|string|max:120',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $specialistInvestigation->update($data);

        return $specialistInvestigation;
    }

    public function destroy(SpecialistInvestigation $specialistInvestigation)
    {
        $specialistInvestigation->delete();

        return response()->noContent();
    }
}
