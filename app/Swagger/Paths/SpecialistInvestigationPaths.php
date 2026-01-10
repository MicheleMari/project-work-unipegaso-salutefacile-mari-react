<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/specialist-investigations',
    summary: 'Elenco indagini specialistiche',
    tags: ['SpecialistInvestigations'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista indagini',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/SpecialistInvestigation'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/specialist-investigations',
    summary: 'Crea indagine specialistica',
    tags: ['SpecialistInvestigations'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/specialist-investigations/{specialist_investigation}',
    summary: 'Dettaglio indagine specialistica',
    tags: ['SpecialistInvestigations'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/specialist-investigations/{specialist_investigation}',
    summary: 'Aggiorna indagine specialistica',
    tags: ['SpecialistInvestigations'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int64')
        ),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigationUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/SpecialistInvestigation')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/specialist-investigations/{specialist_investigation}',
    summary: 'Elimina indagine specialistica',
    tags: ['SpecialistInvestigations'],
    parameters: [
        new OA\Parameter(
            name: 'specialist_investigation',
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
class SpecialistInvestigationPaths {}
