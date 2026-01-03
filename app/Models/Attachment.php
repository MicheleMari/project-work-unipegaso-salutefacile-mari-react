<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'investigation_id',
        'specialist_visit_id',
        'storage_path',
        'original_name',
        'mime_type',
        'size_bytes',
    ];

    public function investigationPerformed(): BelongsTo
    {
        return $this->belongsTo(InvestigationPerformed::class, 'investigation_id');
    }

    public function specialistVisit(): BelongsTo
    {
        return $this->belongsTo(SpecialistVisit::class);
    }
}
