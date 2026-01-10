<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TriageSuggestHistory',
    type: 'object',
    required: ['code', 'reason', 'matches'],
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, example: 'arancio'),
        new OA\Property(property: 'reason', type: 'string', nullable: true, example: 'Casi simili recenti suggeriscono arancio'),
        new OA\Property(property: 'matches', type: 'integer', format: 'int32', example: 5),
    ]
)]
class TriageSuggestHistory {}
