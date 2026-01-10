<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/users',
    summary: 'Elenco utenti',
    tags: ['Users'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista utenti',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/UserSummary'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class UserPaths {}
