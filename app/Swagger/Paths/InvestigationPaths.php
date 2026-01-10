<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/investigations',
    summary: 'Elenco esami',
    tags: ['Investigations'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista esami',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Investigation'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/investigations',
    summary: 'Crea esame',
    tags: ['Investigations'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/InvestigationCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/Investigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/investigations/{investigation}',
    summary: 'Dettaglio esame',
    tags: ['Investigations'],
    parameters: [
        new OA\Parameter(name: 'investigation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/Investigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/investigations/{investigation}',
    summary: 'Aggiorna esame',
    tags: ['Investigations'],
    parameters: [
        new OA\Parameter(name: 'investigation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/InvestigationUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/Investigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/investigations/{investigation}',
    summary: 'Elimina esame',
    tags: ['Investigations'],
    parameters: [
        new OA\Parameter(name: 'investigation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class InvestigationPaths {}
