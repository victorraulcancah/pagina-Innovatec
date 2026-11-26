<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ID de medición de Google Analytics 4 (G-XXXXXXXXXX). Vacío = no se mide nada.
    'google_analytics' => [
        'id' => env('GA_MEASUREMENT_ID'),
    ],

    // Formulario web de Zoho CRM: los mensajes de Contacto también llegan allá como Leads. Vacío = no se envía.
    // Los dos valores son los campos ocultos xnQsjsdp y xmIwtLD del código del formulario web de Zoho.
    'zoho_crm' => [
        'url' => env('ZOHO_CRM_WEBFORM_URL', 'https://crm.zoho.com/crm/WebToLeadForm'),
        'xnqsjsdp' => env('ZOHO_CRM_XNQSJSDP'),
        'xmiwtld' => env('ZOHO_CRM_XMIWTLD'),
    ],

];
