<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecialistVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'department_id',
        'user_id',
        'emergency_id',
        'status',
        'scheduled_at',
        'report_expected_at',
        'report_received_at',
        'needs_follow_up',
        'disposition',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'report_expected_at' => 'datetime',
        'report_received_at' => 'datetime',
        'needs_follow_up' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function emergency(): BelongsTo
    {
        return $this->belongsTo(Emergency::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function specialistInvestigationRequests(): HasMany
    {
        return $this->hasMany(SpecialistInvestigationRequest::class);
    }
}
