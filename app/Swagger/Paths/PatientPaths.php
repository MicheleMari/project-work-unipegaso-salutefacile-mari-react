<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/patients',
    summary: 'Elenco pazienti',
    tags: ['Patients'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista pazienti',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Patient'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/patients',
    summary: 'Crea paziente',
    description: 'Se esiste un paziente con lo stesso fiscal_code, restituisce quello esistente.',
    tags: ['Patients'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/PatientCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/Patient')),
        new OA\Response(response: 200, description: 'Gia esistente', content: new OA\JsonContent(ref: '#/components/schemas/Patient')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/patients/{patient}',
    summary: 'Dettaglio paziente',
    tags: ['Patients'],
    parameters: [
        new OA\Parameter(name: 'patient', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/Patient')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/patients/{patient}',
    summary: 'Aggiorna paziente',
    tags: ['Patients'],
    parameters: [
        new OA\Parameter(name: 'patient', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/PatientUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/Patient')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/patients/{patient}',
    summary: 'Elimina paziente',
    tags: ['Patients'],
    parameters: [
        new OA\Parameter(name: 'patient', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class PatientPaths {}
