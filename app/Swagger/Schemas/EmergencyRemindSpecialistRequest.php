<?php

namespace App\Swagger\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EmergencyRemindSpecialistRequest',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', maxLength: 500, nullable: true, example: 'Promemoria intervento'),
    ]
)]
class EmergencyRemindSpecialistRequest {}
