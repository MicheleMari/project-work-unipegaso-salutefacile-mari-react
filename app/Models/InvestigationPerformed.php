<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestigationPerformed extends Model
{
    use HasFactory;

    protected $table = 'investigations_performed';

    protected $fillable = [
        'emergency_id',
        'investigation_id',
        'performed_by',
        'performed_at',
        'outcome',
        'notes',
        'attachment_id',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    public function emergency(): BelongsTo
    {
        return $this->belongsTo(Emergency::class);
    }

    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'attachment_id');
    }
}
