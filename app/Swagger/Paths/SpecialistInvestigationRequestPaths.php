<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/specialist-investigation-requests',
    summary: 'Elenco richieste indagini specialistiche',
    tags: ['SpecialistInvestigationRequests'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista richieste',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/SpecialistInvestigationRequest'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/specialist-investigation-requests',
    summary: 'Crea richiesta indagine specialistica',
    tags: ['SpecialistInvestigationRequests'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationRequestCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationRequest')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/specialist-investigation-requests/{specialist_investigation_request}',
    summary: 'Dettaglio richiesta indagine specialistica',
    tags: ['SpecialistInvestigationRequests'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation_request',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationRequest')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/specialist-investigation-requests/{specialist_investigation_request}',
    summary: 'Aggiorna richiesta indagine specialistica',
    tags: ['SpecialistInvestigationRequests'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation_request',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationRequestUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationRequest')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/specialist-investigation-requests/{specialist_investigation_request}',
    summary: 'Elimina richiesta indagine specialistica',
    tags: ['SpecialistInvestigationRequests'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation_request',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class SpecialistInvestigationRequestPaths {}
