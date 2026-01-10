<?php

namespace App\Swagger\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/attachments',
    summary: 'Elenco allegati',
    tags: ['Attachments'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Lista allegati',
            content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Attachment'))
        ),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/attachments',
    summary: 'Crea allegato',
    tags: ['Attachments'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/AttachmentCreate')
    ),
    responses: [
        new OA\Response(response: 201, description: 'Creato', content: new OA\JsonContent(ref: '#/components/schemas/Attachment')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/attachments/{attachment}',
    summary: 'Dettaglio allegato',
    tags: ['Attachments'],
    parameters: [
        new OA\Parameter(name: 'attachment', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dettaglio', content: new OA\JsonContent(ref: '#/components/schemas/Attachment')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Put(
    path: '/api/attachments/{attachment}',
    summary: 'Aggiorna allegato',
    tags: ['Attachments'],
    parameters: [
        new OA\Parameter(name: 'attachment', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/AttachmentUpdate')
    ),
    responses: [
        new OA\Response(response: 200, description: 'Aggiornato', content: new OA\JsonContent(ref: '#/components/schemas/Attachment')),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Errore di validazione', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
    ]
)]
#[OA\Delete(
    path: '/api/attachments/{attachment}',
    summary: 'Elimina allegato',
    tags: ['Attachments'],
    parameters: [
        new OA\Parameter(name: 'attachment', in: 'path', required: true, schema: new OA\Schema(type: 'integer', format: 'int64')),
    ],
    responses: [
        new OA\Response(response: 204, description: 'Eliminato'),
        new OA\Response(response: 401, description: 'Non autenticato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Non trovato', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
class AttachmentPaths {}
