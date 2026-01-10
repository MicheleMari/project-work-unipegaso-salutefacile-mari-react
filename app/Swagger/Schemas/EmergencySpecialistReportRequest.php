<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EmergencySpecialistReportRequest',
    type: 'object',
    required: ['notes'],
    properties: [
        new OA\Property(property: 'notes', type: 'string', example: 'Valutazione completata'),
        new OA\Property(property: 'disposition', type: 'string', maxLength: 60, nullable: true, example: 'dimissione'),
        new OA\Property(property: 'needs_follow_up', type: 'boolean', nullable: true, example: false),
        new OA\Property(property: 'send_to_ps', type: 'boolean', nullable: true, example: true),
    ]
)]
class EmergencySpecialistReportRequest {}
