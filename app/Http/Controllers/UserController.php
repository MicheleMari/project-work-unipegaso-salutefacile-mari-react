<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        return User::select('id', 'name', 'surname', 'email', 'department_id')
            ->with('department:id,name')
            ->orderBy('name')
            ->get();
    }
}
