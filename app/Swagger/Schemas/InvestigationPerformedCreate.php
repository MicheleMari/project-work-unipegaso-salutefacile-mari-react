<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'InvestigationPerformedCreate',
    type: 'object',
    required: ['emergency_id', 'investigation_id', 'performed_by'],
    properties: [
        new OA\Property(property: 'emergency_id', type: 'integer', format: 'int64', example: 100),
        new OA\Property(property: 'investigation_id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'performed_by', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'performed_at', type: 'string', format: 'date-time', nullable: true, example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'outcome', type: 'string', nullable: true, example: 'Nessuna anomalia'),
        new OA\Property(property: 'notes', type: 'string', nullable: true, example: 'Note aggiuntive'),
        new OA\Property(property: 'attachment_id', type: 'integer', format: 'int64', nullable: true, example: 15),
    ]
)]
class InvestigationPerformedCreate {}
