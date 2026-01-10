<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/emergencies',
    summary: 'Elenco emergenze',
    description: 'Restituisce le emergenze; per ruolo Operatore 118 e Specialista applica filtri automatici.',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Numero massimo di record (1-200).',
            schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 200)
        ),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista emergenze',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Emergency'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/emergencies',
    summary: 'Crea emergenza',
    tags: ['Emergencies'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/EmergencyCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/Emergency')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/emergencies/{emergency}',
    summary: 'Dettaglio emergenza',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/Emergency')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/emergencies/{emergency}',
    summary: 'Aggiorna emergenza',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/EmergencyUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/Emergency')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/emergencies/{emergency}',
    summary: 'Elimina emergenza',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/emergencies/{emergency}/call-specialist',
    summary: 'Chiama specialista',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/EmergencyCallSpecialistRequest')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Specialista associato', content: new OA\JsonContent(ref: '#/components/schemas/Emergency')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/emergencies/{emergency}/remind-specialist',
    summary: 'Invia promemoria specialista',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: false,
        content: new OA\JsonContent(ref: '#/components/schemas/EmergencyRemindSpecialistRequest')
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Promemoria inviato',
            content: new OA\JsonContent(
                type: 'object',
                properties: [new OA\Property(property: 'status', type: 'string', example: 'reminded')]
            )
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Nessuno specialista associato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/emergencies/{emergency}/specialist-report',
    summary: 'Report specialistico',
    tags: ['Emergencies'],
    parameters: [
        new OA\Parameter(name: 'emergency', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/EmergencySpecialistReportRequest')
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Report salvato',
            content: new OA\JsonContent(
                type: 'object',
                properties: [
                    new OA\Property(property: 'emergency', ref: '#/components/schemas/Emergency'),
                    new OA\Property(property: 'visit', ref: '#/components/schemas/SpecialistVisit'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 403, description: 'Non autorizzato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
class EmergencyPaths {}
