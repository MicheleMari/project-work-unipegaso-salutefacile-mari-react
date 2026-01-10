<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Patient',
    type: 'object',
    required: ['id', 'name', 'surname', 'fiscal_code', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'name', type: 'string', example: 'Mario'),
        new OA\Property(property: 'surname', type: 'string', example: 'Rossi'),
        new OA\Property(property: 'fiscal_code', type: 'string', example: 'RSSMRA80A01H501U'),
        new OA\Property(property: 'residence_address', type: 'string', nullable: true, example: 'Via Roma 1'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '+39 333 0000000'),
        new OA\Property(property: 'email', type: 'string', nullable: true, example: 'mario.rossi@example.com'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
    ]
)]
class Patient {}
