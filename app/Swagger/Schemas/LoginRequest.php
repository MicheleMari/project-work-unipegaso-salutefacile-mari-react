<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'LoginRequest',
    type: 'object',
    required: ['email', 'password'],
    properties: [
        new OA\Property(
            property: 'email',
            type: 'string',
            example: 'user@example.com',
            description: 'Email oppure user_identity_code.'
        ),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret'),
        new OA\Property(property: 'remember', type: 'boolean', nullable: true, example: true),
    ]
)]
class LoginRequest {}
