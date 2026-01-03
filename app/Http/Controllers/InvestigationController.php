<?php

namespace App\Http\Controllers;

use App\Models\Investigation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvestigationController extends Controller
{
    public function index()
    {
        return Investigation::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150|unique:investigations,title',
            'description' => 'nullable|string',
        ]);

        return response(Investigation::create($data), Response::HTTP_CREATED);
    }

    public function show(Investigation $investigation)
    {
        return $investigation;
    }

    public function update(Request $request, Investigation $investigation)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150|unique:investigations,title,' . $investigation->id,
            'description' => 'nullable|string',
        ]);

        $investigation->update($data);

        return $investigation;
    }

    public function destroy(Investigation $investigation)
    {
        $investigation->delete();

        return response()->noContent();
    }
}
