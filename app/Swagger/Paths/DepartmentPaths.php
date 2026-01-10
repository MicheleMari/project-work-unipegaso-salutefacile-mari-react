<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/departments',
    summary: 'Elenco reparti',
    tags: ['Departments'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista reparti',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Department'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/departments',
    summary: 'Crea reparto',
    tags: ['Departments'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/DepartmentCreate')
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: 'Creato',
            content: new OA\JsonContent(ref: '#/components/schemas/Department')
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/departments/{department}',
    summary: 'Dettaglio reparto',
    tags: ['Departments'],
    parameters: [
        new OA\Parameter(name: 'department', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/Department')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/departments/{department}',
    summary: 'Aggiorna reparto',
    tags: ['Departments'],
    parameters: [
        new OA\Parameter(name: 'department', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/DepartmentUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/Department')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/departments/{department}',
    summary: 'Elimina reparto',
    tags: ['Departments'],
    parameters: [
        new OA\Parameter(name: 'department', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class DepartmentPaths {}
