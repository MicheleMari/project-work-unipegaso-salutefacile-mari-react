<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'surname',
        'fiscal_code',
        'residence_address',
        'phone',
        'email',
    ];

    public function emergencies(): HasMany
    {
        return $this->hasMany(Emergency::class);
    }

    public function specialistVisits(): HasMany
    {
        return $this->hasMany(SpecialistVisit::class);
    }
}
