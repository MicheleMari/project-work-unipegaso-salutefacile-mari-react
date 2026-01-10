<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/health',
    summary: 'Health check',
    tags: ['Health'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'OK',
            content: new OA\JsonContent(ref: '#/components/schemas/HealthResponse')
        ),
        new OA\Response(
            response: 401,
            description: 'Non autenticato',
            content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
        ),
    ]
)]
class HealthPaths {}
