<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/login',
    summary: 'Login',
    description: 'Autentica l utente e crea la sessione.',
    tags: ['Auth'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/LoginRequest')
    ),
    responses: [
        new OA\Response(response: 204, description: 'Login effettuato'),
        new OA\Response(
            response: 401,
            description: 'Credenziali non valide',
            content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
        ),
        new OA\Response(
            response: 422,
            description: 'Errore di validazione',
            content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
        ),
    ],
    security: []
)]
class AuthPaths {}
