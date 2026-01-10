<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Investigation',
    type: 'object',
    required: ['id', 'title', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 10),
        new OA\Property(property: 'title', type: 'string', example: 'Emocromo'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Esame del sangue completo'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
    ]
)]
class Investigation {}
