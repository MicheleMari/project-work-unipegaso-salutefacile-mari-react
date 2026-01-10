<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Emergency',
    type: 'object',
    required: ['id', 'user_id', 'patient_id', 'status', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 100),
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
        new OA\Property(property: 'specialist_id', type: 'integer', format: 'int64', nullable: true, example: 7),
        new OA\Property(property: 'vital_signs', ref: '#/components/schemas/VitalSigns', nullable: true),
        new OA\Property(property: 'status', type: 'string', example: 'triage'),
        new OA\Property(property: 'admission_department', type: 'string', nullable: true, example: 'Cardiologia'),
        new OA\Property(property: 'result', ref: '#/components/schemas/EmergencyResult', nullable: true),
        new OA\Property(property: 'sended_to_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'notify_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'arrived_ps', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'arrived_ps_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'closed_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T12:00:00Z'),
        new OA\Property(property: 'specialist_called_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:15:00Z'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'user', ref: '#/components/schemas/UserSummary', nullable: true),
        new OA\Property(property: 'patient', ref: '#/components/schemas/Patient', nullable: true),
        new OA\Property(property: 'specialist', ref: '#/components/schemas/UserSummary', nullable: true),
    ]
)]
class Emergency {}
