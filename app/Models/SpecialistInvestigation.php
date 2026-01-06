<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecialistInvestigation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'discipline',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(SpecialistInvestigationRequest::class);
    }
}
