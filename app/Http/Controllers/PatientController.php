<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientController extends Controller
{
    public function index()
    {
        return Patient::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'surname' => 'required|string|max:100',
            'fiscal_code' => 'required|string|max:50|unique:patients,fiscal_code',
            'residence_address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
        ]);

        return response(Patient::create($data), Response::HTTP_CREATED);
    }

    public function show(Patient $patient)
    {
        return $patient;
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'surname' => 'required|string|max:100',
            'fiscal_code' => 'required|string|max:50|unique:patients,fiscal_code,' . $patient->id,
            'residence_address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
        ]);

        $patient->update($data);

        return $patient;
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->noContent();
    }
}
