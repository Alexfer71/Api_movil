<?php
/**
 * conexion.php
 * Clase de conexión PDO a MySQL.
 *
 * NOTA IMPORTANTE sobre ATTR_EMULATE_PREPARES = false:
 * Con esta opción activada, PDO usa sentencias preparadas REALES del servidor
 * MySQL, lo que significa que NO se puede reutilizar el mismo placeholder
 * (p.ej. :login) más de una vez en la misma consulta.
 * Si necesita reutilizar un valor, use parámetros distintos con el mismo valor:
 *   ':login1' => $v, ':login2' => $v
 * Todos los casos afectados ya han sido corregidos en api.php.
 */
class Conexion {
    private string $host     = "localhost";
    private string $db_name  = "api_tienda";
    private string $username = "root";
    private string $password = "";
    private ?PDO   $conn     = null;

    public function obtenerConexion(): PDO {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,  // sentencias reales: NO reutilizar placeholders
                ]
            );
        } catch (PDOException $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
