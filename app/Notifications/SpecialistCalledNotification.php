<?php

namespace App\Notifications;

use App\Models\Emergency;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SpecialistCalledNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Emergency $emergency,
        protected ?string $message = null
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        $patient = $this->emergency->patient;
        $patientName = trim(($patient->name ?? '') . ' ' . ($patient->surname ?? ''));

        return [
            'type' => 'specialist_call',
            'emergency_id' => $this->emergency->id,
            'patient_name' => $patientName ?: 'Paziente',
            'message' => $this->message,
            'called_at' => now(),
        ];
    }
}
