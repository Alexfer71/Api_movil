<?php
require_once "cors.php";
header("Content-Type: application/json; charset=UTF-8");
require_once "conexion.php";

$conexion = new Conexion();
$conn     = $conexion->obtenerConexion();

$op = $_GET['op'] ?? '';

/** Lee el body JSON o hace fallback a $_POST */
function getInput(): array {
    $raw  = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : (is_array($_POST) ? $_POST : []);
}

/** Respuesta de éxito */
function ok(array $data): void {
    echo json_encode($data);
}

/** Respuesta de error */
function err(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
}

try {
    switch ($op) {

        // ══════════════════════════════════════════════════════════════
        // EMPRESAS
        // ══════════════════════════════════════════════════════════════
        case 'empresas_listar':
            $stmt = $conn->query("SELECT * FROM empresas ORDER BY id_empresa");
            ok($stmt->fetchAll());
            break;

        case 'empresa_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM empresas WHERE id_empresa = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Empresa no encontrada', 404);
            break;

        case 'empresa_insertar':
            $d = getInput();
            if (empty($d['razon_social']) || empty($d['ruc'])) { err('razon_social y ruc son requeridos'); break; }
            $stmt = $conn->prepare(
                "INSERT INTO empresas (razon_social, ruc, direccion, telefono, email, activo)
                 VALUES (:razon_social, :ruc, :direccion, :telefono, :email, :activo)"
            );
            $stmt->execute([
                ':razon_social' => $d['razon_social'],
                ':ruc'          => $d['ruc'],
                ':direccion'    => $d['direccion']    ?? null,
                ':telefono'     => $d['telefono']     ?? null,
                ':email'        => $d['email']        ?? null,
                ':activo'       => $d['activo']       ?? 1,
            ]);
            ok(['message' => 'Empresa creada', 'id' => $conn->lastInsertId()]);
            break;

        case 'empresa_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE empresas SET razon_social=:razon_social, ruc=:ruc, direccion=:direccion,
                 telefono=:telefono, email=:email, activo=:activo
                 WHERE id_empresa=:id"
            );
            $stmt->execute([
                ':razon_social' => $d['razon_social'] ?? '',
                ':ruc'          => $d['ruc']          ?? '',
                ':direccion'    => $d['direccion']    ?? null,
                ':telefono'     => $d['telefono']     ?? null,
                ':email'        => $d['email']        ?? null,
                ':activo'       => $d['activo']       ?? 1,
                ':id'           => $d['id_empresa']   ?? 0,
            ]);
            ok(['message' => 'Empresa actualizada']);
            break;

        case 'empresa_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM empresas WHERE id_empresa = :id");
            $stmt->execute([':id' => $d['id_empresa'] ?? 0]);
            ok(['message' => 'Empresa eliminada']);
            break;

        // ══════════════════════════════════════════════════════════════
        // PERFILES
        // ══════════════════════════════════════════════════════════════
        case 'perfiles_listar':
            $stmt = $conn->query("SELECT * FROM perfiles ORDER BY nivel_acceso DESC");
            ok($stmt->fetchAll());
            break;

        case 'perfil_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM perfiles WHERE id_perfil = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Perfil no encontrado', 404);
            break;

        case 'perfil_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO perfiles (nombre, descripcion, nivel_acceso, activo)
                 VALUES (:nombre, :descripcion, :nivel_acceso, :activo)"
            );
            $stmt->execute([
                ':nombre'       => $d['nombre']       ?? '',
                ':descripcion'  => $d['descripcion']  ?? null,
                ':nivel_acceso' => $d['nivel_acceso'] ?? 1,
                ':activo'       => $d['activo']       ?? 1,
            ]);
            ok(['message' => 'Perfil creado', 'id' => $conn->lastInsertId()]);
            break;

        case 'perfil_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE perfiles SET nombre=:nombre, descripcion=:descripcion,
                 nivel_acceso=:nivel_acceso, activo=:activo
                 WHERE id_perfil=:id"
            );
            $stmt->execute([
                ':nombre'       => $d['nombre']       ?? '',
                ':descripcion'  => $d['descripcion']  ?? null,
                ':nivel_acceso' => $d['nivel_acceso'] ?? 1,
                ':activo'       => $d['activo']       ?? 1,
                ':id'           => $d['id_perfil']    ?? 0,
            ]);
            ok(['message' => 'Perfil actualizado']);
            break;

        case 'perfil_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM perfiles WHERE id_perfil = :id");
            $stmt->execute([':id' => $d['id_perfil'] ?? 0]);
            ok(['message' => 'Perfil eliminado']);
            break;

        // ══════════════════════════════════════════════════════════════
        // USUARIOS
        // ══════════════════════════════════════════════════════════════
        case 'usuarios_listar':
            $stmt = $conn->query(
                "SELECT u.id_usuario, u.username, u.email, u.nombres, u.apellidos,
                        u.activo, u.created_at,
                        e.razon_social AS empresa, p.nombre AS perfil
                   FROM usuarios u
                   JOIN empresas e ON e.id_empresa = u.id_empresa
                   JOIN perfiles p ON p.id_perfil  = u.id_perfil
                  ORDER BY u.id_usuario"
            );
            ok($stmt->fetchAll());
            break;

        case 'usuario_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare(
                "SELECT u.id_usuario, u.id_empresa, u.id_perfil, u.username, u.email,
                        u.nombres, u.apellidos, u.activo, u.created_at,
                        e.razon_social AS empresa, p.nombre AS perfil
                   FROM usuarios u
                   JOIN empresas e ON e.id_empresa = u.id_empresa
                   JOIN perfiles p ON p.id_perfil  = u.id_perfil
                  WHERE u.id_usuario = :id"
            );
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Usuario no encontrado', 404);
            break;

        case 'usuario_insertar':
            $d = getInput();
            if (empty($d['password'])) { err('La contraseña es requerida'); break; }
            $hash = password_hash($d['password'], PASSWORD_BCRYPT);
            $stmt = $conn->prepare(
                "INSERT INTO usuarios (id_empresa, id_perfil, username, email, password, nombres, apellidos, activo)
                 VALUES (:id_empresa, :id_perfil, :username, :email, :password, :nombres, :apellidos, :activo)"
            );
            $stmt->execute([
                ':id_empresa' => $d['id_empresa'] ?? 0,
                ':id_perfil'  => $d['id_perfil']  ?? 0,
                ':username'   => $d['username']   ?? '',
                ':email'      => $d['email']      ?? '',
                ':password'   => $hash,
                ':nombres'    => $d['nombres']    ?? '',
                ':apellidos'  => $d['apellidos']  ?? '',
                ':activo'     => $d['activo']     ?? 1,
            ]);
            ok(['message' => 'Usuario creado', 'id' => $conn->lastInsertId()]);
            break;

        case 'usuario_actualizar':
            $d = getInput();
            if (!empty($d['password'])) {
                $hash = password_hash($d['password'], PASSWORD_BCRYPT);
                $stmt = $conn->prepare(
                    "UPDATE usuarios SET id_empresa=:id_empresa, id_perfil=:id_perfil,
                     username=:username, email=:email, password=:password,
                     nombres=:nombres, apellidos=:apellidos, activo=:activo
                     WHERE id_usuario=:id"
                );
            } else {
                $stmt = $conn->prepare(
                    "UPDATE usuarios SET id_empresa=:id_empresa, id_perfil=:id_perfil,
                     username=:username, email=:email,
                     nombres=:nombres, apellidos=:apellidos, activo=:activo
                     WHERE id_usuario=:id"
                );
            }
            $params = [
                ':id_empresa' => $d['id_empresa'] ?? 0,
                ':id_perfil'  => $d['id_perfil']  ?? 0,
                ':username'   => $d['username']   ?? '',
                ':email'      => $d['email']      ?? '',
                ':nombres'    => $d['nombres']    ?? '',
                ':apellidos'  => $d['apellidos']  ?? '',
                ':activo'     => $d['activo']     ?? 1,
                ':id'         => $d['id_usuario'] ?? 0,
            ];
            if (!empty($d['password'])) $params[':password'] = $hash;
            $stmt->execute($params);
            ok(['message' => 'Usuario actualizado']);
            break;

        case 'usuario_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
            $stmt->execute([':id' => $d['id_usuario'] ?? 0]);
            ok(['message' => 'Usuario eliminado']);
            break;

        // ══════════════════════════════════════════════════════════════
        // CORRECCIÓN PRINCIPAL: usuario_login
        // ERROR ORIGINAL: WHERE (u.username = :login OR u.email = :login)
        // PDO con ATTR_EMULATE_PREPARES=false NO permite reutilizar
        // el mismo placeholder dos veces → SQLSTATE[HY093]
        // SOLUCIÓN: usar :login1 y :login2 con el mismo valor
        // ══════════════════════════════════════════════════════════════
        case 'usuario_login':
            $d     = getInput();
            $login = trim($d['login'] ?? '');
            if (empty($login)) { err('El campo login es requerido'); break; }
        
            $stmt = $conn->prepare(
                "SELECT u.*, p.nombre AS perfil, p.nivel_acceso AS nivel_acceso, e.razon_social AS empresa
                    FROM usuarios u
                    JOIN perfiles p ON p.id_perfil = u.id_perfil
                    JOIN empresas e ON e.id_empresa = u.id_empresa
                    WHERE (u.username = :login1 OR u.email = :login2) AND u.activo = 1"
            );
            // ✅ CORREGIDO: dos parámetros distintos con el mismo valor
            $stmt->execute([':login1' => $login, ':login2' => $login]);
            $user = $stmt->fetch();
            if ($user && password_verify($d['password'] ?? '', $user['password'])) {
                unset($user['password']);
                ok(['message' => 'Login exitoso', 'usuario' => $user]);
            } else {
                err('Credenciales incorrectas', 401);
            }
            break;

        // ══════════════════════════════════════════════════════════════
        // CATEGORÍAS
        // ══════════════════════════════════════════════════════════════
        case 'categorias_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            if ($id_empresa) {
                $stmt = $conn->prepare("SELECT * FROM categorias WHERE id_empresa = :id AND activo = 1 ORDER BY nombre");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query("SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre");
            }
            ok($stmt->fetchAll());
            break;

        case 'categoria_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM categorias WHERE id_categoria = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Categoría no encontrada', 404);
            break;

        case 'categoria_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO categorias (id_empresa, nombre, descripcion, activo)
                 VALUES (:id_empresa, :nombre, :descripcion, :activo)"
            );
            $stmt->execute([
                ':id_empresa'  => $d['id_empresa']  ?? 0,
                ':nombre'      => $d['nombre']      ?? '',
                ':descripcion' => $d['descripcion'] ?? null,
                ':activo'      => $d['activo']      ?? 1,
            ]);
            ok(['message' => 'Categoría creada', 'id' => $conn->lastInsertId()]);
            break;

        case 'categoria_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE categorias SET nombre=:nombre, descripcion=:descripcion, activo=:activo
                 WHERE id_categoria=:id"
            );
            $stmt->execute([
                ':nombre'      => $d['nombre']       ?? '',
                ':descripcion' => $d['descripcion']  ?? null,
                ':activo'      => $d['activo']       ?? 1,
                ':id'          => $d['id_categoria'] ?? 0,
            ]);
            ok(['message' => 'Categoría actualizada']);
            break;

        case 'categoria_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM categorias WHERE id_categoria = :id");
            $stmt->execute([':id' => $d['id_categoria'] ?? 0]);
            ok(['message' => 'Categoría eliminada']);
            break;

        // ══════════════════════════════════════════════════════════════
        // PROVEEDORES
        // ══════════════════════════════════════════════════════════════
        case 'proveedores_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            if ($id_empresa) {
                $stmt = $conn->prepare("SELECT * FROM proveedores WHERE id_empresa = :id AND activo = 1 ORDER BY razon_social");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query("SELECT * FROM proveedores WHERE activo = 1 ORDER BY razon_social");
            }
            ok($stmt->fetchAll());
            break;

        case 'proveedor_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM proveedores WHERE id_proveedor = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Proveedor no encontrado', 404);
            break;

        case 'proveedor_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO proveedores (id_empresa, ruc, razon_social, contacto, email, telefono, direccion, categoria, activo)
                 VALUES (:id_empresa, :ruc, :razon_social, :contacto, :email, :telefono, :direccion, :categoria, :activo)"
            );
            $stmt->execute([
                ':id_empresa'   => $d['id_empresa']  ?? 0,
                ':ruc'          => $d['ruc']         ?? null,
                ':razon_social' => $d['razon_social'] ?? '',
                ':contacto'     => $d['contacto']    ?? null,
                ':email'        => $d['email']       ?? null,
                ':telefono'     => $d['telefono']    ?? null,
                ':direccion'    => $d['direccion']   ?? null,
                ':categoria'    => $d['categoria']   ?? null,
                ':activo'       => $d['activo']      ?? 1,
            ]);
            ok(['message' => 'Proveedor creado', 'id' => $conn->lastInsertId()]);
            break;

        case 'proveedor_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE proveedores SET ruc=:ruc, razon_social=:razon_social, contacto=:contacto,
                 email=:email, telefono=:telefono, direccion=:direccion, categoria=:categoria, activo=:activo
                 WHERE id_proveedor=:id"
            );
            $stmt->execute([
                ':ruc'          => $d['ruc']          ?? null,
                ':razon_social' => $d['razon_social'] ?? '',
                ':contacto'     => $d['contacto']     ?? null,
                ':email'        => $d['email']        ?? null,
                ':telefono'     => $d['telefono']     ?? null,
                ':direccion'    => $d['direccion']    ?? null,
                ':categoria'    => $d['categoria']    ?? null,
                ':activo'       => $d['activo']       ?? 1,
                ':id'           => $d['id_proveedor'] ?? 0,
            ]);
            ok(['message' => 'Proveedor actualizado']);
            break;

        case 'proveedor_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM proveedores WHERE id_proveedor = :id");
            $stmt->execute([':id' => $d['id_proveedor'] ?? 0]);
            ok(['message' => 'Proveedor eliminado']);
            break;

        // ══════════════════════════════════════════════════════════════
        // CLIENTES
        // ══════════════════════════════════════════════════════════════
        case 'clientes_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            if ($id_empresa) {
                $stmt = $conn->prepare("SELECT * FROM clientes WHERE id_empresa = :id AND activo = 1 ORDER BY nombres");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query("SELECT * FROM clientes WHERE activo = 1 ORDER BY nombres");
            }
            ok($stmt->fetchAll());
            break;

        case 'cliente_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM clientes WHERE id_cliente = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Cliente no encontrado', 404);
            break;

        case 'cliente_buscar':
            // ══════════════════════════════════════════════════════════
            // CORRECCIÓN: :q se usaba 3 veces en el mismo WHERE.
            // Con EMULATE_PREPARES=false esto causa HY093.
            // SOLUCIÓN: usar :q1, :q2, :q3 con el mismo valor.
            // ══════════════════════════════════════════════════════════
            $q          = '%' . trim($_GET['q'] ?? '') . '%';
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            $sql = "SELECT * FROM clientes
                     WHERE activo = 1
                       AND (nombres LIKE :q1 OR apellidos LIKE :q2 OR cedula_ruc LIKE :q3)";
            if ($id_empresa) $sql .= " AND id_empresa = :e";
            $sql .= " ORDER BY nombres LIMIT 30";
            $stmt = $conn->prepare($sql);
            // ✅ CORREGIDO: tres parámetros distintos con el mismo valor
            $params = [':q1' => $q, ':q2' => $q, ':q3' => $q];
            if ($id_empresa) $params[':e'] = $id_empresa;
            $stmt->execute($params);
            ok($stmt->fetchAll());
            break;

        case 'cliente_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO clientes (id_empresa, cedula_ruc, nombres, apellidos, email, telefono,
                 direccion, tipo_cliente, limite_credito, activo)
                 VALUES (:id_empresa, :cedula_ruc, :nombres, :apellidos, :email, :telefono,
                         :direccion, :tipo_cliente, :limite_credito, :activo)"
            );
            $stmt->execute([
                ':id_empresa'     => $d['id_empresa']     ?? 0,
                ':cedula_ruc'     => $d['cedula_ruc']     ?? null,
                ':nombres'        => $d['nombres']        ?? '',
                ':apellidos'      => $d['apellidos']      ?? null,
                ':email'          => $d['email']          ?? null,
                ':telefono'       => $d['telefono']       ?? null,
                ':direccion'      => $d['direccion']      ?? null,
                ':tipo_cliente'   => $d['tipo_cliente']   ?? 'natural',
                ':limite_credito' => $d['limite_credito'] ?? 0,
                ':activo'         => $d['activo']         ?? 1,
            ]);
            ok(['message' => 'Cliente creado', 'id' => $conn->lastInsertId()]);
            break;

        case 'cliente_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE clientes SET cedula_ruc=:cedula_ruc, nombres=:nombres, apellidos=:apellidos,
                 email=:email, telefono=:telefono, direccion=:direccion, tipo_cliente=:tipo_cliente,
                 limite_credito=:limite_credito, activo=:activo
                 WHERE id_cliente=:id"
            );
            $stmt->execute([
                ':cedula_ruc'     => $d['cedula_ruc']     ?? null,
                ':nombres'        => $d['nombres']        ?? '',
                ':apellidos'      => $d['apellidos']      ?? null,
                ':email'          => $d['email']          ?? null,
                ':telefono'       => $d['telefono']       ?? null,
                ':direccion'      => $d['direccion']      ?? null,
                ':tipo_cliente'   => $d['tipo_cliente']   ?? 'natural',
                ':limite_credito' => $d['limite_credito'] ?? 0,
                ':activo'         => $d['activo']         ?? 1,
                ':id'             => $d['id_cliente']     ?? 0,
            ]);
            ok(['message' => 'Cliente actualizado']);
            break;

        case 'cliente_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM clientes WHERE id_cliente = :id");
            $stmt->execute([':id' => $d['id_cliente'] ?? 0]);
            ok(['message' => 'Cliente eliminado']);
            break;

        // ══════════════════════════════════════════════════════════════
        // PRODUCTOS
        // ══════════════════════════════════════════════════════════════
        case 'productos_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            $base_sql =
                "SELECT p.*, c.nombre AS categoria_nombre, pr.razon_social AS proveedor_nombre
                   FROM productos p
                   LEFT JOIN categorias c   ON c.id_categoria  = p.id_categoria
                   LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor";
            if ($id_empresa) {
                $stmt = $conn->prepare($base_sql . " WHERE p.id_empresa = :id AND p.activo = 1 ORDER BY p.nombre");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query($base_sql . " WHERE p.activo = 1 ORDER BY p.nombre");
            }
            ok($stmt->fetchAll());
            break;

        case 'producto_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare(
                "SELECT p.*, c.nombre AS categoria_nombre, pr.razon_social AS proveedor_nombre
                   FROM productos p
                   LEFT JOIN categorias c   ON c.id_categoria  = p.id_categoria
                   LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor
                  WHERE p.id_producto = :id"
            );
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Producto no encontrado', 404);
            break;

        case 'producto_buscar':
            // ══════════════════════════════════════════════════════════
            // CORRECCIÓN: :q se usaba 2 veces → HY093
            // SOLUCIÓN: usar :q1, :q2
            // ══════════════════════════════════════════════════════════
            $q          = '%' . trim($_GET['q'] ?? '') . '%';
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            $sql = "SELECT p.*, c.nombre AS categoria_nombre
                      FROM productos p
                      LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
                     WHERE p.activo = 1
                       AND (p.nombre LIKE :q1 OR p.codigo LIKE :q2)";
            if ($id_empresa) $sql .= " AND p.id_empresa = :e";
            $sql .= " ORDER BY p.nombre LIMIT 30";
            $stmt = $conn->prepare($sql);
            // ✅ CORREGIDO: dos parámetros distintos con el mismo valor
            $params = [':q1' => $q, ':q2' => $q];
            if ($id_empresa) $params[':e'] = $id_empresa;
            $stmt->execute($params);
            ok($stmt->fetchAll());
            break;

        case 'productos_stock_bajo':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            if ($id_empresa) {
                $stmt = $conn->prepare(
                    "SELECT p.*, c.nombre AS categoria_nombre
                       FROM productos p
                       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
                      WHERE p.id_empresa = :e AND p.activo = 1 AND p.stock <= p.stock_minimo
                      ORDER BY p.stock ASC"
                );
                $stmt->execute([':e' => $id_empresa]);
            } else {
                $stmt = $conn->query(
                    "SELECT p.*, c.nombre AS categoria_nombre
                       FROM productos p
                       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
                      WHERE p.activo = 1 AND p.stock <= p.stock_minimo
                      ORDER BY p.stock ASC"
                );
            }
            ok($stmt->fetchAll());
            break;

        case 'producto_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO productos (id_empresa, id_categoria, id_proveedor, codigo, nombre, descripcion,
                 precio_compra, precio_venta, stock, stock_minimo, unidad_medida, imagen, activo)
                 VALUES (:id_empresa, :id_categoria, :id_proveedor, :codigo, :nombre, :descripcion,
                         :precio_compra, :precio_venta, :stock, :stock_minimo, :unidad_medida, :imagen, :activo)"
            );
            $stmt->execute([
                ':id_empresa'    => $d['id_empresa']    ?? 0,
                ':id_categoria'  => $d['id_categoria']  ?? null,
                ':id_proveedor'  => $d['id_proveedor']  ?? null,
                ':codigo'        => $d['codigo']        ?? '',
                ':nombre'        => $d['nombre']        ?? '',
                ':descripcion'   => $d['descripcion']   ?? null,
                ':precio_compra' => $d['precio_compra'] ?? 0,
                ':precio_venta'  => $d['precio_venta']  ?? 0,
                ':stock'         => $d['stock']         ?? 0,
                ':stock_minimo'  => $d['stock_minimo']  ?? 0,
                ':unidad_medida' => $d['unidad_medida'] ?? 'UNIDAD',
                ':imagen'        => $d['imagen']        ?? null,
                ':activo'        => $d['activo']        ?? 1,
            ]);
            ok(['message' => 'Producto creado', 'id' => $conn->lastInsertId()]);
            break;

        case 'producto_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE productos SET id_categoria=:id_categoria, id_proveedor=:id_proveedor,
                 codigo=:codigo, nombre=:nombre, descripcion=:descripcion,
                 precio_compra=:precio_compra, precio_venta=:precio_venta,
                 stock=:stock, stock_minimo=:stock_minimo, unidad_medida=:unidad_medida,
                 imagen=:imagen, activo=:activo
                 WHERE id_producto=:id"
            );
            $stmt->execute([
                ':id_categoria'  => $d['id_categoria']  ?? null,
                ':id_proveedor'  => $d['id_proveedor']  ?? null,
                ':codigo'        => $d['codigo']        ?? '',
                ':nombre'        => $d['nombre']        ?? '',
                ':descripcion'   => $d['descripcion']   ?? null,
                ':precio_compra' => $d['precio_compra'] ?? 0,
                ':precio_venta'  => $d['precio_venta']  ?? 0,
                ':stock'         => $d['stock']         ?? 0,
                ':stock_minimo'  => $d['stock_minimo']  ?? 0,
                ':unidad_medida' => $d['unidad_medida'] ?? 'UNIDAD',
                ':imagen'        => $d['imagen']        ?? null,
                ':activo'        => $d['activo']        ?? 1,
                ':id'            => $d['id_producto']   ?? 0,
            ]);
            ok(['message' => 'Producto actualizado']);
            break;

        case 'producto_actualizar_stock':
            $d = getInput();
            $stmt = $conn->prepare("UPDATE productos SET stock=:stock WHERE id_producto=:id");
            $stmt->execute([':stock' => $d['stock'] ?? 0, ':id' => $d['id_producto'] ?? 0]);
            ok(['message' => 'Stock actualizado']);
            break;

        case 'producto_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM productos WHERE id_producto = :id");
            $stmt->execute([':id' => $d['id_producto'] ?? 0]);
            ok(['message' => 'Producto eliminado']);
            break;

        // ══════════════════════════════════════════════════════════════
        // FORMAS DE PAGO
        // ══════════════════════════════════════════════════════════════
        case 'formas_pago_listar':
            $stmt = $conn->query("SELECT * FROM formas_pago WHERE activo = 1 ORDER BY nombre");
            ok($stmt->fetchAll());
            break;

        case 'forma_pago_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM formas_pago WHERE id_forma_pago = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            $row ? ok($row) : err('Forma de pago no encontrada', 404);
            break;

        case 'forma_pago_insertar':
            $d = getInput();
            $stmt = $conn->prepare(
                "INSERT INTO formas_pago (nombre, descripcion, activo)
                 VALUES (:nombre, :descripcion, :activo)"
            );
            $stmt->execute([
                ':nombre'      => $d['nombre']      ?? '',
                ':descripcion' => $d['descripcion'] ?? null,
                ':activo'      => $d['activo']      ?? 1,
            ]);
            ok(['message' => 'Forma de pago creada', 'id' => $conn->lastInsertId()]);
            break;

        case 'forma_pago_actualizar':
            $d = getInput();
            $stmt = $conn->prepare(
                "UPDATE formas_pago SET nombre=:nombre, descripcion=:descripcion, activo=:activo
                 WHERE id_forma_pago=:id"
            );
            $stmt->execute([
                ':nombre'      => $d['nombre']        ?? '',
                ':descripcion' => $d['descripcion']   ?? null,
                ':activo'      => $d['activo']        ?? 1,
                ':id'          => $d['id_forma_pago'] ?? 0,
            ]);
            ok(['message' => 'Forma de pago actualizada']);
            break;

        case 'forma_pago_eliminar':
            $d = getInput();
            $stmt = $conn->prepare("DELETE FROM formas_pago WHERE id_forma_pago = :id");
            $stmt->execute([':id' => $d['id_forma_pago'] ?? 0]);
            ok(['message' => 'Forma de pago eliminada']);
            break;

        // ══════════════════════════════════════════════════════════════
        // ÓRDENES
        // ══════════════════════════════════════════════════════════════
        case 'ordenes_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            $base_sql =
                "SELECT o.*,
                        c.nombres AS cliente_nombres, c.apellidos AS cliente_apellidos,
                        u.nombres AS usuario_nombres,
                        fp.nombre  AS forma_pago_nombre
                   FROM ordenes o
                   JOIN clientes    c  ON c.id_cliente    = o.id_cliente
                   JOIN usuarios    u  ON u.id_usuario    = o.id_usuario
                   JOIN formas_pago fp ON fp.id_forma_pago = o.id_forma_pago";
            if ($id_empresa) {
                $stmt = $conn->prepare($base_sql . " WHERE o.id_empresa = :id ORDER BY o.created_at DESC");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query($base_sql . " ORDER BY o.created_at DESC");
            }
            ok($stmt->fetchAll());
            break;

        case 'orden_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare(
                "SELECT o.*,
                        c.nombres AS cliente_nombres, c.apellidos AS cliente_apellidos, c.cedula_ruc,
                        u.nombres AS usuario_nombres,
                        fp.nombre  AS forma_pago_nombre
                   FROM ordenes o
                   JOIN clientes    c  ON c.id_cliente    = o.id_cliente
                   JOIN usuarios    u  ON u.id_usuario    = o.id_usuario
                   JOIN formas_pago fp ON fp.id_forma_pago = o.id_forma_pago
                  WHERE o.id_orden = :id"
            );
            $stmt->execute([':id' => $id]);
            $orden = $stmt->fetch();
            if (!$orden) { err('Orden no encontrada', 404); break; }
            $stmt2 = $conn->prepare(
                "SELECT oi.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo
                   FROM orden_items oi
                   JOIN productos p ON p.id_producto = oi.id_producto
                  WHERE oi.id_orden = :id"
            );
            $stmt2->execute([':id' => $id]);
            $orden['items'] = $stmt2->fetchAll();
            ok($orden);
            break;

        case 'orden_insertar':
            $d     = getInput();
            $items = $d['items'] ?? [];
            if (empty($items)) { err('Se requiere al menos un ítem en la orden'); break; }

            $conn->beginTransaction();
            $count     = $conn->query("SELECT COUNT(*) FROM ordenes")->fetchColumn();
            $num_orden = 'ORD-' . date('Y') . '-' . str_pad($count + 1, 6, '0', STR_PAD_LEFT);

            $stmt = $conn->prepare(
                "INSERT INTO ordenes (id_empresa, id_cliente, id_usuario, id_forma_pago, numero_orden,
                 subtotal, descuento, iva, total, estado, notas)
                 VALUES (:id_empresa, :id_cliente, :id_usuario, :id_forma_pago, :numero_orden,
                         :subtotal, :descuento, :iva, :total, :estado, :notas)"
            );
            $stmt->execute([
                ':id_empresa'    => $d['id_empresa']    ?? 0,
                ':id_cliente'    => $d['id_cliente']    ?? 0,
                ':id_usuario'    => $d['id_usuario']    ?? 0,
                ':id_forma_pago' => $d['id_forma_pago'] ?? 0,
                ':numero_orden'  => $num_orden,
                ':subtotal'      => $d['subtotal']      ?? 0,
                ':descuento'     => $d['descuento']     ?? 0,
                ':iva'           => $d['iva']           ?? 0,
                ':total'         => $d['total']         ?? 0,
                ':estado'        => $d['estado']        ?? 'pendiente',
                ':notas'         => $d['notas']         ?? null,
            ]);
            $id_orden = $conn->lastInsertId();

            $ins = $conn->prepare(
                "INSERT INTO orden_items (id_orden, id_producto, cantidad, precio_unitario, descuento, subtotal)
                 VALUES (:id_orden, :id_producto, :cantidad, :precio_unitario, :descuento, :subtotal)"
            );
            foreach ($items as $it) {
                $ins->execute([
                    ':id_orden'        => $id_orden,
                    ':id_producto'     => $it['id_producto']     ?? 0,
                    ':cantidad'        => $it['cantidad']        ?? 1,
                    ':precio_unitario' => $it['precio_unitario'] ?? 0,
                    ':descuento'       => $it['descuento']       ?? 0,
                    ':subtotal'        => $it['subtotal']        ?? 0,
                ]);
            }
            $conn->commit();
            ok(['message' => 'Orden creada', 'id_orden' => $id_orden, 'numero_orden' => $num_orden]);
            break;

        case 'orden_cambiar_estado':
            $d = getInput();
            $stmt = $conn->prepare("UPDATE ordenes SET estado=:estado WHERE id_orden=:id");
            $stmt->execute([':estado' => $d['estado'] ?? 'pendiente', ':id' => $d['id_orden'] ?? 0]);
            ok(['message' => 'Estado de orden actualizado']);
            break;

        case 'orden_eliminar':
            $d = getInput();
            $conn->beginTransaction();
            $conn->prepare("DELETE FROM orden_items WHERE id_orden = :id")->execute([':id' => $d['id_orden'] ?? 0]);
            $conn->prepare("DELETE FROM ordenes WHERE id_orden = :id")->execute([':id' => $d['id_orden'] ?? 0]);
            $conn->commit();
            ok(['message' => 'Orden eliminada']);
            break;

        // ══════════════════════════════════════════════════════════════
        // FACTURAS
        // ══════════════════════════════════════════════════════════════
        case 'facturas_listar':
            $id_empresa = intval($_GET['id_empresa'] ?? 0);
            $base_sql =
                "SELECT f.*,
                        c.nombres AS cliente_nombres, c.apellidos AS cliente_apellidos,
                        u.nombres AS usuario_nombres,
                        fp.nombre  AS forma_pago_nombre
                   FROM facturas f
                   JOIN clientes    c  ON c.id_cliente    = f.id_cliente
                   JOIN usuarios    u  ON u.id_usuario    = f.id_usuario
                   JOIN formas_pago fp ON fp.id_forma_pago = f.id_forma_pago";
            if ($id_empresa) {
                $stmt = $conn->prepare($base_sql . " WHERE f.id_empresa = :id ORDER BY f.fecha_emision DESC");
                $stmt->execute([':id' => $id_empresa]);
            } else {
                $stmt = $conn->query($base_sql . " ORDER BY f.fecha_emision DESC");
            }
            ok($stmt->fetchAll());
            break;

        case 'factura_obtener':
            $id = intval($_GET['id'] ?? 0);
            $stmt = $conn->prepare(
                "SELECT f.*,
                        c.nombres AS cliente_nombres, c.apellidos AS cliente_apellidos,
                        c.cedula_ruc, c.direccion AS cliente_direccion,
                        u.nombres AS usuario_nombres,
                        fp.nombre  AS forma_pago_nombre,
                        e.razon_social AS empresa_nombre, e.ruc AS empresa_ruc,
                        e.direccion AS empresa_direccion
                   FROM facturas f
                   JOIN clientes    c  ON c.id_cliente    = f.id_cliente
                   JOIN usuarios    u  ON u.id_usuario    = f.id_usuario
                   JOIN formas_pago fp ON fp.id_forma_pago = f.id_forma_pago
                   JOIN empresas    e  ON e.id_empresa    = f.id_empresa
                  WHERE f.id_factura = :id"
            );
            $stmt->execute([':id' => $id]);
            $factura = $stmt->fetch();
            if (!$factura) { err('Factura no encontrada', 404); break; }
            $stmt2 = $conn->prepare(
                "SELECT fi.*, p.codigo AS producto_codigo
                   FROM factura_items fi
                   LEFT JOIN productos p ON p.id_producto = fi.id_producto
                  WHERE fi.id_factura = :id"
            );
            $stmt2->execute([':id' => $id]);
            $factura['items'] = $stmt2->fetchAll();
            ok($factura);
            break;

        case 'factura_insertar':
            $d     = getInput();
            $items = $d['items'] ?? [];
            if (empty($items)) { err('Se requiere al menos un ítem en la factura'); break; }

            $conn->beginTransaction();
            $serie = $d['serie'] ?? '001-001';
            $count = $conn->prepare("SELECT COUNT(*) FROM facturas WHERE serie = :serie");
            $count->execute([':serie' => $serie]);
            $n       = intval($count->fetchColumn());
            $num_fac = $serie . '-' . str_pad($n + 1, 9, '0', STR_PAD_LEFT);

            $stmt = $conn->prepare(
                "INSERT INTO facturas (id_empresa, id_cliente, id_usuario, id_forma_pago, numero_factura,
                 serie, subtotal_0, subtotal_iva, iva_pct, iva_valor, descuento, total, estado, observacion)
                 VALUES (:id_empresa, :id_cliente, :id_usuario, :id_forma_pago, :numero_factura,
                         :serie, :subtotal_0, :subtotal_iva, :iva_pct, :iva_valor, :descuento, :total, :estado, :observacion)"
            );
            $stmt->execute([
                ':id_empresa'     => $d['id_empresa']    ?? 0,
                ':id_cliente'     => $d['id_cliente']    ?? 0,
                ':id_usuario'     => $d['id_usuario']    ?? 0,
                ':id_forma_pago'  => $d['id_forma_pago'] ?? 0,
                ':numero_factura' => $num_fac,
                ':serie'          => $serie,
                ':subtotal_0'     => $d['subtotal_0']    ?? 0,
                ':subtotal_iva'   => $d['subtotal_iva']  ?? 0,
                ':iva_pct'        => $d['iva_pct']       ?? 15,
                ':iva_valor'      => $d['iva_valor']     ?? 0,
                ':descuento'      => $d['descuento']     ?? 0,
                ':total'          => $d['total']         ?? 0,
                ':estado'         => $d['estado']        ?? 'emitida',
                ':observacion'    => $d['observacion']   ?? null,
            ]);
            $id_factura = $conn->lastInsertId();

            $ins = $conn->prepare(
                "INSERT INTO factura_items (id_factura, id_producto, descripcion, cantidad,
                 precio_unitario, descuento, codigo_iva, tarifa_iva, subtotal)
                 VALUES (:id_factura, :id_producto, :descripcion, :cantidad,
                         :precio_unitario, :descuento, :codigo_iva, :tarifa_iva, :subtotal)"
            );
            foreach ($items as $it) {
                $ins->execute([
                    ':id_factura'      => $id_factura,
                    ':id_producto'     => $it['id_producto']     ?? null,
                    ':descripcion'     => $it['descripcion']     ?? '',
                    ':cantidad'        => $it['cantidad']        ?? 1,
                    ':precio_unitario' => $it['precio_unitario'] ?? 0,
                    ':descuento'       => $it['descuento']       ?? 0,
                    ':codigo_iva'      => $it['codigo_iva']      ?? 2,
                    ':tarifa_iva'      => $it['tarifa_iva']      ?? 15,
                    ':subtotal'        => $it['subtotal']        ?? 0,
                ]);
            }
            $conn->commit();
            ok(['message' => 'Factura creada', 'id_factura' => $id_factura, 'numero_factura' => $num_fac]);
            break;

        case 'factura_cambiar_estado':
            $d = getInput();
            $stmt = $conn->prepare("UPDATE facturas SET estado=:estado WHERE id_factura=:id");
            $stmt->execute([':estado' => $d['estado'] ?? 'emitida', ':id' => $d['id_factura'] ?? 0]);
            ok(['message' => 'Estado de factura actualizado']);
            break;

        case 'factura_anular':
            $d = getInput();
            $stmt = $conn->prepare("UPDATE facturas SET estado='anulada' WHERE id_factura=:id");
            $stmt->execute([':id' => $d['id_factura'] ?? 0]);
            ok(['message' => 'Factura anulada']);
            break;

        // ══════════════════════════════════════════════════════════════
        // REPORTES / DASHBOARD
        // ══════════════════════════════════════════════════════════════

        // ══════════════════════════════════════════════════════════════
        // CORRECCIÓN: reporte_resumen usaba :e repetido 7 veces en
        // subconsultas → HY093 con EMULATE_PREPARES=false.
        // SOLUCIÓN: usar bindValue para ligar el mismo valor 7 veces
        // con parámetros numerados o usar un único bind con bindValue.
        // Se usa la forma más limpia: parámetros distintos :e1…:e7
        // ══════════════════════════════════════════════════════════════
        case 'reporte_resumen':
            $id_empresa = intval($_GET['id_empresa'] ?? 1);
            $stmt = $conn->prepare(
                "SELECT
                    (SELECT COUNT(*) FROM productos   WHERE id_empresa=:e1 AND activo=1)             AS total_productos,
                    (SELECT COUNT(*) FROM clientes    WHERE id_empresa=:e2 AND activo=1)             AS total_clientes,
                    (SELECT COUNT(*) FROM proveedores WHERE id_empresa=:e3 AND activo=1)             AS total_proveedores,
                    (SELECT COUNT(*) FROM ordenes     WHERE id_empresa=:e4)                          AS total_ordenes,
                    (SELECT COALESCE(SUM(total),0) FROM ordenes  WHERE id_empresa=:e5 AND estado='pagado')       AS ventas_pagadas,
                    (SELECT COALESCE(SUM(total),0) FROM facturas WHERE id_empresa=:e6 AND estado='autorizada')   AS facturacion_total,
                    (SELECT COUNT(*) FROM productos WHERE id_empresa=:e7 AND stock <= stock_minimo AND activo=1) AS productos_stock_bajo"
            );
            // ✅ CORREGIDO: siete parámetros distintos con el mismo valor
            $stmt->execute([
                ':e1' => $id_empresa, ':e2' => $id_empresa, ':e3' => $id_empresa,
                ':e4' => $id_empresa, ':e5' => $id_empresa, ':e6' => $id_empresa,
                ':e7' => $id_empresa,
            ]);
            ok($stmt->fetch());
            break;

        case 'reporte_ventas_por_mes':
            $id_empresa = intval($_GET['id_empresa'] ?? 1);
            $anio       = intval($_GET['anio'] ?? date('Y'));
            $stmt = $conn->prepare(
                "SELECT MONTH(created_at) AS mes, SUM(total) AS total, COUNT(*) AS cantidad
                   FROM ordenes
                  WHERE id_empresa = :e AND YEAR(created_at) = :anio AND estado = 'pagado'
                  GROUP BY MONTH(created_at)
                  ORDER BY mes"
            );
            $stmt->execute([':e' => $id_empresa, ':anio' => $anio]);
            ok($stmt->fetchAll());
            break;

        case 'reporte_productos_mas_vendidos':
            $id_empresa = intval($_GET['id_empresa'] ?? 1);
            $limite     = intval($_GET['limite'] ?? 10);
            $stmt = $conn->prepare(
                "SELECT p.id_producto, p.nombre, p.codigo,
                        SUM(oi.cantidad) AS cantidad_vendida,
                        SUM(oi.subtotal) AS total_vendido
                   FROM orden_items oi
                   JOIN productos p ON p.id_producto = oi.id_producto
                   JOIN ordenes   o ON o.id_orden    = oi.id_orden
                  WHERE o.id_empresa = :e AND o.estado = 'pagado'
                  GROUP BY p.id_producto, p.nombre, p.codigo
                  ORDER BY cantidad_vendida DESC
                  LIMIT :limite"
            );
            $stmt->bindValue(':e',      $id_empresa, PDO::PARAM_INT);
            $stmt->bindValue(':limite', $limite,     PDO::PARAM_INT);
            $stmt->execute();
            ok($stmt->fetchAll());
            break;

        case 'reporte_clientes_top':
            $id_empresa = intval($_GET['id_empresa'] ?? 1);
            $limite     = intval($_GET['limite'] ?? 10);
            $stmt = $conn->prepare(
                "SELECT c.id_cliente, c.nombres, c.apellidos, c.cedula_ruc,
                        COUNT(o.id_orden) AS total_ordenes,
                        COALESCE(SUM(o.total),0) AS total_comprado
                   FROM clientes c
                   LEFT JOIN ordenes o ON o.id_cliente = c.id_cliente AND o.estado = 'pagado'
                  WHERE c.id_empresa = :e AND c.activo = 1
                  GROUP BY c.id_cliente, c.nombres, c.apellidos, c.cedula_ruc
                  ORDER BY total_comprado DESC
                  LIMIT :limite"
            );
            $stmt->bindValue(':e',      $id_empresa, PDO::PARAM_INT);
            $stmt->bindValue(':limite', $limite,     PDO::PARAM_INT);
            $stmt->execute();
            ok($stmt->fetchAll());
            break;

        case 'reporte_facturas_por_estado':
            $id_empresa = intval($_GET['id_empresa'] ?? 1);
            $stmt = $conn->prepare(
                "SELECT estado, COUNT(*) AS cantidad, COALESCE(SUM(total),0) AS total
                   FROM facturas
                  WHERE id_empresa = :e
                  GROUP BY estado"
            );
            $stmt->execute([':e' => $id_empresa]);
            ok($stmt->fetchAll());
            break;

        // ══════════════════════════════════════════════════════════════
        // DEFAULT
        // ══════════════════════════════════════════════════════════════
        default:
            err('Operación no válida. Parámetro ?op= requerido.');
            break;
    }

} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
