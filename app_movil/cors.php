<?php
/**
 * cors.php
 * Cabeceras CORS — permite peticiones desde cualquier origen.
 * Incluir al inicio de api.php antes de cualquier output.
 */

// Evitar duplicados si ya se enviaron cabeceras
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Responder preflight OPTIONS inmediatamente
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
