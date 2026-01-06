<?php

namespace App\Notifications;

use App\Models\Emergency;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SpecialistReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Emergency $emergency,
        protected ?string $message = null
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $patient = $this->emergency->patient;
        $patientName = trim(($patient->name ?? '') . ' ' . ($patient->surname ?? ''));

        return [
            'type' => 'specialist_reminder',
            'emergency_id' => $this->emergency->id,
            'patient_name' => $patientName ?: 'Paziente',
            'message' => $this->message,
            'reminded_at' => now(),
        ];
    }
}
