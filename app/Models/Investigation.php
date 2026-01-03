<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Investigation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
    ];

    public function performedInvestigations(): HasMany
    {
        return $this->hasMany(InvestigationPerformed::class);
    }
}
