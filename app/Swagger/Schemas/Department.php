<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Department',
    type: 'object',
    required: ['id', 'name', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Cardiologia'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
    ]
)]
class Department {}
