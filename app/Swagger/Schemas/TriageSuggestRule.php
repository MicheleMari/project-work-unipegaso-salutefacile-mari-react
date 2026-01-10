<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TriageSuggestRule',
    type: 'object',
    required: ['code', 'reason'],
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, example: 'giallo'),
        new OA\Property(property: 'reason', type: 'string', nullable: true, example: 'Motivo di accesso con potenziale rischio'),
    ]
)]
class TriageSuggestRule {}
