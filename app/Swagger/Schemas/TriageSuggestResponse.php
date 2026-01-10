<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TriageSuggestResponse',
    type: 'object',
    required: ['code', 'rule_based', 'history_based', 'reason'],
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, example: 'giallo'),
        new OA\Property(property: 'rule_based', ref: '#/components/schemas/TriageSuggestRule'),
        new OA\Property(property: 'history_based', ref: '#/components/schemas/TriageSuggestHistory'),
        new OA\Property(property: 'reason', type: 'string', example: 'Motivo di accesso con potenziale rischio'),
    ]
)]
class TriageSuggestResponse {}
