<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SpecialistInvestigationCreate',
    type: 'object',
    required: ['title'],
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 150, example: 'Ecocardiogramma'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Esame specialistico cardiologico'),
        new OA\Property(property: 'discipline', type: 'string', maxLength: 120, nullable: true, example: 'Cardiologia'),
        new OA\Property(property: 'department_id', type: 'integer', format: 'int64', nullable: true, example: 2),
    ]
)]
class SpecialistInvestigationCreate {}
