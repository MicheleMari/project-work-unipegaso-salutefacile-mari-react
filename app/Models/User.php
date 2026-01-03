<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'surname',
        'permission_id',
        'department_id',
        'user_identity_code',
        'email',
        'password_hash',
        'avatar_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'avatar_path',
    ];

    /**
     * Accessors that should be appended to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar',
    ];

    /**
     * Laravel expects an accessor named getAuthPassword to retrieve the hashed password.
     * We map it to our custom password_hash column.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Compute the public URL for the stored avatar, if present.
     */
    protected function avatar(): Attribute
    {
        return Attribute::get(function (?string $value, array $attributes) {
            if (! isset($attributes['avatar_path'])) {
                return null;
            }

            return Storage::disk('public')->url($attributes['avatar_path']);
        });
    }

    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function emergencies(): HasMany
    {
        return $this->hasMany(Emergency::class);
    }

    public function investigationsPerformed(): HasMany
    {
        return $this->hasMany(InvestigationPerformed::class, 'performed_by');
    }

    public function specialistVisits(): HasMany
    {
        return $this->hasMany(SpecialistVisit::class);
    }
}
