<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecialistInvestigationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'emergency_id',
        'specialist_investigation_id',
        'requested_by',
        'specialist_visit_id',
        'status',
        'requested_at',
        'scheduled_at',
        'report_expected_at',
        'report_received_at',
        'outcome',
        'notes',
        'follow_up_action',
        'disposition',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'report_expected_at' => 'datetime',
        'report_received_at' => 'datetime',
    ];

    public function emergency(): BelongsTo
    {
        return $this->belongsTo(Emergency::class);
    }

    public function specialistInvestigation(): BelongsTo
    {
        return $this->belongsTo(SpecialistInvestigation::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function specialistVisit(): BelongsTo
    {
        return $this->belongsTo(SpecialistVisit::class);
    }
}
