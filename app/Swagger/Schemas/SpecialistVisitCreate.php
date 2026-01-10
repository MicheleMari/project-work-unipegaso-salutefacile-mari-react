<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SpecialistVisitCreate',
    type: 'object',
    required: ['patient_id', 'department_id', 'user_id', 'emergency_id'],
    properties: [
        new OA\Property(property: 'patient_id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'department_id', type: 'integer', format: 'int64', example: 2),
        new OA\Property(property: 'user_id', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'emergency_id', type: 'integer', format: 'int64', example: 100),
        new OA\Property(property: 'status', type: 'string', nullable: true, example: 'scheduled'),
        new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'report_expected_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T12:00:00Z'),
        new OA\Property(property: 'report_received_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T12:30:00Z'),
        new OA\Property(property: 'needs_follow_up', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'disposition', type: 'string', maxLength: 60, nullable: true, example: 'dimissione'),
        new OA\Property(property: 'notes', type: 'string', nullable: true, example: 'Note cliniche'),
    ]
)]
class SpecialistVisitCreate {}
