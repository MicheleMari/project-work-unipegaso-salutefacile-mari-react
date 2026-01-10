<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/specialist-visits',
    summary: 'Elenco visite specialistiche',
    tags: ['SpecialistVisits'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista visite',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/SpecialistVisit'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/specialist-visits',
    summary: 'Crea visita specialistica',
    tags: ['SpecialistVisits'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistVisitCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistVisit')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/specialist-visits/{specialist_visit}',
    summary: 'Dettaglio visita specialistica',
    tags: ['SpecialistVisits'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_visit',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistVisit')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 403, description: 'Non autorizzato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/specialist-visits/{specialist_visit}',
    summary: 'Aggiorna visita specialistica',
    tags: ['SpecialistVisits'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_visit',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistVisitUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistVisit')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 403, description: 'Non autorizzato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/specialist-visits/{specialist_visit}',
    summary: 'Elimina visita specialistica',
    tags: ['SpecialistVisits'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_visit',
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
class SpecialistVisitPaths {}
