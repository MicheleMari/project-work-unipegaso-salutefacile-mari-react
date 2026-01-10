<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EmergencyResult',
    type: 'object',
    properties: [
        new OA\Property(property: 'notes', type: 'string', example: 'Stato stabile'),
        new OA\Property(property: 'disposition', type: 'string', nullable: true, example: 'dimissione'),
        new OA\Property(property: 'needs_follow_up', type: 'boolean', example: false),
        new OA\Property(property: 'reported_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
    ]
)]
class EmergencyResult {}
