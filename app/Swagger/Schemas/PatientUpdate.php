<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'PatientUpdate',
    type: 'object',
    required: ['name', 'surname', 'fiscal_code'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 100, example: 'Mario'),
        new OA\Property(property: 'surname', type: 'string', maxLength: 100, example: 'Rossi'),
        new OA\Property(property: 'fiscal_code', type: 'string', maxLength: 50, example: 'RSSMRA80A01H501U'),
        new OA\Property(property: 'residence_address', type: 'string', maxLength: 255, nullable: true, example: 'Via Roma 1'),
        new OA\Property(property: 'phone', type: 'string', maxLength: 30, nullable: true, example: '+39 333 0000000'),
        new OA\Property(property: 'email', type: 'string', maxLength: 150, nullable: true, example: 'mario.rossi@example.com'),
    ]
)]
class PatientUpdate {}
