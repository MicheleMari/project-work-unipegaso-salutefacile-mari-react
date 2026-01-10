<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'VitalSigns',
    type: 'object',
    properties: [
        new OA\Property(property: 'blood_pressure', type: 'string', nullable: true, example: '120/80'),
        new OA\Property(property: 'body_temperature', type: 'number', format: 'float', nullable: true, example: 36.8),
        new OA\Property(property: 'heart_rate', type: 'integer', format: 'int32', nullable: true, example: 75),
        new OA\Property(property: 'oxygen_saturation', type: 'integer', format: 'int32', nullable: true, example: 98),
    ]
)]
class VitalSigns {}
