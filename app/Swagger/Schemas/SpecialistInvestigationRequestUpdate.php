<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SpecialistInvestigationRequestUpdate',
    type: 'object',
    required: ['emergency_id', 'specialist_investigation_id', 'requested_by', 'status'],
    properties: [
        new OA\Property(property: 'emergency_id', type: 'integer', format: 'int64', example: 100),
        new OA\Property(property: 'specialist_investigation_id', type: 'integer', format: 'int64', example: 30),
        new OA\Property(property: 'requested_by', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'specialist_visit_id', type: 'integer', format: 'int64', nullable: true, example: 20),
        new OA\Property(property: 'status', type: 'string', example: 'requested'),
        new OA\Property(property: 'requested_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-02T10:00:00Z'),
        new OA\Property(property: 'report_expected_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-02T12:00:00Z'),
        new OA\Property(property: 'report_received_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-02T12:30:00Z'),
        new OA\Property(property: 'outcome', type: 'string', nullable: true, example: 'Esito positivo'),
        new OA\Property(property: 'notes', type: 'string', nullable: true, example: 'Note aggiuntive'),
        new OA\Property(property: 'follow_up_action', type: 'string', maxLength: 120, nullable: true, example: 'Controllo tra 7 giorni'),
        new OA\Property(property: 'disposition', type: 'string', maxLength: 60, nullable: true, example: 'dimissione'),
    ]
)]
class SpecialistInvestigationRequestUpdate {}
