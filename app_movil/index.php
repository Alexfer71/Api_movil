<?php
/**
 * index.php
 * Redirige todas las peticiones entrantes a api.php
 * preservando el query string original.
 */
if (!headers_sent()) {
    $qs = !empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '';
    header('Location: api.php' . $qs, true, 301);
    exit;
}