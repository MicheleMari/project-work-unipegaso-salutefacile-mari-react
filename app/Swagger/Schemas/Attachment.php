<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Attachment',
    type: 'object',
    required: ['id', 'storage_path', 'original_name', 'mime_type', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 15),
        new OA\Property(property: 'investigation_id', type: 'integer', format: 'int64', nullable: true, example: 2),
        new OA\Property(property: 'specialist_visit_id', type: 'integer', format: 'int64', nullable: true, example: 7),
        new OA\Property(property: 'storage_path', type: 'string', example: 'attachments/report.pdf'),
        new OA\Property(property: 'original_name', type: 'string', example: 'report.pdf'),
        new OA\Property(property: 'mime_type', type: 'string', example: 'application/pdf'),
        new OA\Property(property: 'size_bytes', type: 'integer', format: 'int64', nullable: true, example: 102400),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-01-01T10:00:00Z'),
        new OA\Property(property: 'investigation_performed', ref: '#/components/schemas/InvestigationPerformed', nullable: true),
        new OA\Property(property: 'specialist_visit', ref: '#/components/schemas/SpecialistVisit', nullable: true),
    ]
)]
class Attachment {}
