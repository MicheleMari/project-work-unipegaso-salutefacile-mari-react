<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EmergencyCallSpecialistRequest',
    type: 'object',
    required: ['specialist_id'],
    properties: [
        new OA\Property(property: 'specialist_id', type: 'integer', format: 'int64', example: 7),
        new OA\Property(property: 'message', type: 'string', maxLength: 500, nullable: true, example: 'Intervento urgente'),
    ]
)]
class EmergencyCallSpecialistRequest {}
