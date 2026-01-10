<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TriageSuggestRequest',
    type: 'object',
    required: ['motivo_accesso'],
    properties: [
        new OA\Property(property: 'motivo_accesso', type: 'string', minLength: 3, example: 'Dolore toracico'),
        new OA\Property(property: 'codice_fiscale', type: 'string', nullable: true, example: 'RSSMRA80A01H501U'),
        new OA\Property(property: 'vital_signs', ref: '#/components/schemas/VitalSigns', nullable: true),
    ]
)]
class TriageSuggestRequest {}
