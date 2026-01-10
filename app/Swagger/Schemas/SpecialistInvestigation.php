<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SpecialistInvestigation',
    type: 'object',
    required: ['id', 'title', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 30),
        new OA\Property(property: 'title', type: 'string', example: 'Ecocardiogramma'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Esame specialistico cardiologico'),
        new OA\Property(property: 'discipline', type: 'string', nullable: true, example: 'Cardiologia'),
        new OA\Property(property: 'department_id', type: 'integer', format: 'int64', nullable: true, example: 2),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'department', ref: '#/components/schemas/Department', nullable: true),
    ]
)]
class SpecialistInvestigation {}
