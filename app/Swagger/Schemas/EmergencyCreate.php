<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EmergencyCreate',
    type: 'object',
    required: ['user_id', 'patient_id'],
    properties: [
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Dolore toracico'),
        new OA\Property(
            property: 'alert_code',
            type: 'string',
            nullable: true,
            enum: ['bianco', 'verde', 'giallo', 'arancio', 'rosso'],
            example: 'giallo'
        ),
        new OA\Property(property: 'user_id', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'patient_id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'vital_signs', ref: '#/components/schemas/VitalSigns', nullable: true),
        new OA\Property(property: 'status', type: 'string', nullable: true, example: 'triage'),
        new OA\Property(property: 'admission_department', type: 'string', nullable: true, example: 'Cardiologia'),
        new OA\Property(property: 'result', ref: '#/components/schemas/EmergencyResult', nullable: true),
        new OA\Property(property: 'sended_to_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'notify_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'arrived_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'arrived_ps_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:00:00Z'),
    ]
)]
class EmergencyCreate {}
