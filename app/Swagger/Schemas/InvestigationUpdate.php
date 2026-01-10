<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'InvestigationUpdate',
    type: 'object',
    required: ['title'],
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 150, example: 'Emocromo'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Esame del sangue completo'),
    ]
)]
class InvestigationUpdate {}
