<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/triage-suggest',
    summary: 'Suggerimento codice triage',
    tags: ['Triage'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/TriageSuggestRequest')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Suggerimento', content: new OA\JsonContent(ref: '#/components/schemas/TriageSuggestResponse')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
class TriageSuggestPaths {}
