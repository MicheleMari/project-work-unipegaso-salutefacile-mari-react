<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AttachmentUpdate',
    type: 'object',
    required: ['storage_path', 'original_name', 'mime_type'],
    properties: [
        new OA\Property(property: 'investigation_id', type: 'integer', format: 'int64', nullable: true, example: 2),
        new OA\Property(property: 'specialist_visit_id', type: 'integer', format: 'int64', nullable: true, example: 7),
        new OA\Property(property: 'storage_path', type: 'string', maxLength: 255, example: 'attachments/report.pdf'),
        new OA\Property(property: 'original_name', type: 'string', maxLength: 255, example: 'report.pdf'),
        new OA\Property(property: 'mime_type', type: 'string', maxLength: 100, example: 'application/pdf'),
        new OA\Property(property: 'size_bytes', type: 'integer', format: 'int64', nullable: true, example: 102400),
    ]
)]
class AttachmentUpdate {}
