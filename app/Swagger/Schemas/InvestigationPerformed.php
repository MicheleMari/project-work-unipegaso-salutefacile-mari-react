<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'InvestigationPerformed',
    type: 'object',
    required: ['id', 'emergency_id', 'investigation_id', 'performed_by', 'performed_at', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 3),
        new OA\Property(property: 'emergency_id', type: 'integer', format: 'int64', example: 100),
        new OA\Property(property: 'investigation_id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'performed_by', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'performed_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'outcome', type: 'string', nullable: true, example: 'Nessuna anomalia'),
        new OA\Property(property: 'notes', type: 'string', nullable: true, example: 'Note aggiuntive'),
        new OA\Property(property: 'attachment_id', type: 'integer', format: 'int64', nullable: true, example: 15),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'emergency', ref: '#/components/schemas/Emergency', nullable: true),
        new OA\Property(property: 'investigation', ref: '#/components/schemas/Investigation', nullable: true),
        new OA\Property(property: 'performer', ref: '#/components/schemas/UserSummary', nullable: true),
        new OA\Property(property: 'attachment', ref: '#/components/schemas/Attachment', nullable: true),
    ]
)]
class InvestigationPerformed {}
