<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\OpenApi(security: [['sessionAuth' => []]])]
#[OA\Info(
    title: 'SaluteFacile API',
    version: '1.0.0',
    description: 'API REST per la gestione di un pronto soccorso per la gestione di emergenze, visite specialistiche, esami e referti.',
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sessionAuth',
    type: 'apiKey',
    in: 'cookie',
    name: 'laravel_session',
    description: 'Autenticazione via sessione Laravel. Effettua il login su /login e usa il cookie di sessione.'
)]
class OpenApi {}
