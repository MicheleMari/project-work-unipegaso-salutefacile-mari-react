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
        'specialist_id',
        'specialist_called_at',
    ];

    protected $casts = [
        'vital_signs' => 'array',
        'specialist_called_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function specialist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    public function investigationsPerformed(): HasMany
    {
        return $this->hasMany(InvestigationPerformed::class);
    }

    public function specialistInvestigationRequests(): HasMany
    {
        return $this->hasMany(SpecialistInvestigationRequest::class);
    }

    public function specialistVisits(): HasMany
    {
        return $this->hasMany(SpecialistVisit::class);
    }
}
