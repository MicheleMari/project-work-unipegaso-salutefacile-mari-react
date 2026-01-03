<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Emergency extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'alert_code',
        'user_id',
        'patient_id',
        'vital_signs',
        'status',
    ];

    protected $casts = [
        'vital_signs' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function investigationsPerformed(): HasMany
    {
        return $this->hasMany(InvestigationPerformed::class);
    }

    public function specialistVisits(): HasMany
    {
        return $this->hasMany(SpecialistVisit::class);
    }
}
