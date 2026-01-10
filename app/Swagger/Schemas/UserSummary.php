<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserSummary',
    type: 'object',
    required: ['id', 'name', 'surname'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 5),
        new OA\Property(property: 'name', type: 'string', example: 'Lucia'),
        new OA\Property(property: 'surname', type: 'string', example: 'Bianchi'),
        new OA\Property(property: 'email', type: 'string', nullable: true, example: 'lucia.bianchi@example.com'),
        new OA\Property(property: 'department_id', type: 'integer', format: 'int64', nullable: true, example: 2),
        new OA\Property(property: 'is_available', type: 'boolean', nullable: true, example: true),
        new OA\Property(property: 'avatar', type: 'string', nullable: true, example: 'https://example.com/storage/avatars/1.png'),
        new OA\Property(property: 'avatar_path', type: 'string', nullable: true, example: 'avatars/1.png'),
        new OA\Property(property: 'permission_id', type: 'integer', format: 'int64', nullable: true, example: 3),
        new OA\Property(property: 'permission', ref: '#/components/schemas/Permission', nullable: true),
        new OA\Property(property: 'department', ref: '#/components/schemas/Department', nullable: true),
    ]
)]
class UserSummary {}
