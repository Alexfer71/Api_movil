-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-03-2026 a las 00:27:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `api_tienda`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `id_empresa`, `nombre`, `descripcion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Electrónica', 'Equipos electrónicos, computadoras y accesorios', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 1, 'Alimentos', 'Productos alimenticios y bebidas', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, 'Ropa y Calzado', 'Prendas de vestir y calzado en general', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 1, 'Hogar', 'Artículos para el hogar y decoración', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 1, 'Papelería', 'Útiles de oficina, papelería y suministros', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `cedula_ruc` varchar(20) DEFAULT NULL,
  `nombres` varchar(200) NOT NULL,
  `apellidos` varchar(200) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `tipo_cliente` enum('natural','juridico') NOT NULL DEFAULT 'natural',
  `limite_credito` decimal(12,2) DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `id_empresa`, `cedula_ruc`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`, `tipo_cliente`, `limite_credito`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, '1712345678', 'Andrés', 'Torres', 'andres.torres@gmail.com', '0981234567', 'Calle Mariana de Jesús 12, Quito', 'natural', 500.00, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 1, '0923456789', 'Gabriela', 'Salinas', 'gaby.salinas@hotmail.com', '0976543210', 'Av. 9 de Octubre 88, Guayaquil', 'natural', 1000.00, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, '1890123456001', 'Soluciones Integrales S.A.', '', 'info@solintegrales.com', '022456789', 'Shyris 1500 Of. 301, Quito', 'juridico', 5000.00, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 1, '0134567890', 'Luis', 'Cárdenas', 'luis.cardenas@yahoo.com', '0998765432', 'Av. Huayna Capac 456, Cuenca', 'natural', 300.00, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 1, '1756789012', 'Patricia', 'Vega', 'patricia.vega@outlook.com', '0987654321', 'Calle Chimborazo 77, Riobamba', 'natural', 800.00, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id_empresa` int(11) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `ruc` varchar(20) NOT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id_empresa`, `razon_social`, `ruc`, `direccion`, `telefono`, `email`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Mi Empresa S.A.', '1790012345001', 'Av. República 123, Quito', '022345678', 'info@miempresa.com', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 'Comercial Norte Cía.', '1790098765001', 'Calle Sucre 456, Guayaquil', '042876543', 'norte@comercial.com', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 'Distribuidora Sur S.A.', '1790055511001', 'Av. Bolívar 789, Cuenca', '072123456', 'sur@distribuidora.com', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 'Tech Solutions EC', '1790033322001', 'Naciones Unidas 321, Quito', '022567890', 'tech@solutions.ec', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 'Importadora Global', '1790077744001', 'Malecón 654, Guayaquil', '042654321', 'global@importadora.ec', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id_factura` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_forma_pago` int(11) NOT NULL,
  `numero_factura` varchar(30) NOT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `subtotal_0` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal_iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva_pct` tinyint(4) NOT NULL DEFAULT 15,
  `iva_valor` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('emitida','autorizada','anulada') NOT NULL DEFAULT 'emitida',
  `observacion` text DEFAULT NULL,
  `fecha_emision` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id_factura`, `id_empresa`, `id_cliente`, `id_usuario`, `id_forma_pago`, `numero_factura`, `serie`, `subtotal_0`, `subtotal_iva`, `iva_pct`, `iva_valor`, `descuento`, `total`, `estado`, `observacion`, `fecha_emision`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 1, '001-001-000000001', '001-001', 0.00, 950.00, 15, 142.50, 0.00, 1092.50, 'autorizada', 'Venta laptop', '2026-02-01 10:35:00', '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 1, 2, 3, 2, '001-001-000000002', '001-001', 0.00, 40.00, 15, 6.00, 5.00, 41.00, 'emitida', 'Accesorios varios', '2026-02-10 14:20:00', '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, 3, 2, 3, '001-001-000000003', '001-001', 0.00, 561.00, 15, 84.15, 50.00, 595.15, 'autorizada', 'Factura corporativa', '2026-02-15 09:10:00', '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 1, 4, 3, 1, '001-001-000000004', '001-001', 0.00, 36.00, 15, 5.40, 0.00, 41.40, 'emitida', NULL, '2026-02-20 16:50:00', '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 1, 5, 2, 5, '001-001-000000005', '001-001', 11.00, 62.00, 15, 9.30, 10.00, 72.30, 'anulada', 'Anulada por devolución', '2026-02-22 11:25:00', '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_items`
--

CREATE TABLE `factura_items` (
  `id_factura_item` int(11) NOT NULL,
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `descripcion` varchar(300) NOT NULL,
  `cantidad` decimal(12,4) NOT NULL DEFAULT 1.0000,
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `codigo_iva` tinyint(4) NOT NULL DEFAULT 2,
  `tarifa_iva` tinyint(4) NOT NULL DEFAULT 15,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `factura_items`
--

INSERT INTO `factura_items` (`id_factura_item`, `id_factura`, `id_producto`, `descripcion`, `cantidad`, `precio_unitario`, `descuento`, `codigo_iva`, `tarifa_iva`, `subtotal`, `created_at`) VALUES
(1, 1, 1, 'Laptop Dell Inspiron 15', 1.0000, 950.00, 0.00, 2, 15, 950.00, '2026-02-27 06:00:10'),
(2, 2, 2, 'Mouse Inalámbrico Logitech', 2.0000, 22.50, 5.00, 2, 15, 40.00, '2026-02-27 06:00:10'),
(3, 3, 1, 'Laptop Dell Inspiron 15', 1.0000, 950.00, 0.00, 2, 15, 950.00, '2026-02-27 06:00:10'),
(4, 3, 5, 'Resma Papel A4 75gr', 2.0000, 5.50, 0.00, 0, 0, 11.00, '2026-02-27 06:00:10'),
(5, 4, 4, 'Camiseta Polo Unisex Talla M', 2.0000, 18.00, 0.00, 2, 15, 36.00, '2026-02-27 06:00:10'),
(6, 5, 3, 'Arroz Integral 5kg', 4.0000, 7.25, 0.00, 2, 15, 29.00, '2026-02-27 06:00:10'),
(7, 5, 5, 'Resma Papel A4 75gr', 8.0000, 5.50, 0.00, 0, 0, 44.00, '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formas_pago`
--

CREATE TABLE `formas_pago` (
  `id_forma_pago` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `formas_pago`
--

INSERT INTO `formas_pago` (`id_forma_pago`, `nombre`, `descripcion`, `activo`, `created_at`) VALUES
(1, 'Efectivo', 'Pago en efectivo al momento de la entrega', 1, '2026-02-27 06:00:10'),
(2, 'Tarjeta de Crédito', 'Pago con tarjeta de crédito Visa/Mastercard', 1, '2026-02-27 06:00:10'),
(3, 'Transferencia', 'Transferencia bancaria o depósito', 1, '2026-02-27 06:00:10'),
(4, 'Cheque', 'Pago con cheque a la vista', 1, '2026-02-27 06:00:10'),
(5, 'Crédito 30 días', 'Crédito a 30 días plazo', 1, '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id_orden` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_forma_pago` int(11) NOT NULL,
  `numero_orden` varchar(30) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','pagado','cancelado') NOT NULL DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`id_orden`, `id_empresa`, `id_cliente`, `id_usuario`, `id_forma_pago`, `numero_orden`, `subtotal`, `descuento`, `iva`, `total`, `estado`, `notas`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 1, 'ORD-2026-0001', 950.00, 0.00, 142.50, 1092.50, 'pagado', 'Entrega inmediata', '2026-02-01 10:30:00', '2026-02-27 06:00:10'),
(2, 1, 2, 3, 2, 'ORD-2026-0002', 45.00, 5.00, 6.00, 46.00, 'pagado', 'Cliente frecuente', '2026-02-10 14:15:00', '2026-02-27 06:00:10'),
(3, 1, 3, 2, 3, 'ORD-2026-0003', 600.00, 50.00, 82.50, 632.50, 'pendiente', 'Facturar a nombre de empresa', '2026-02-15 09:00:00', '2026-02-27 06:00:10'),
(4, 1, 4, 3, 1, 'ORD-2026-0004', 36.00, 0.00, 5.40, 41.40, 'pendiente', NULL, '2026-02-20 16:45:00', '2026-02-27 06:00:10'),
(5, 1, 5, 2, 5, 'ORD-2026-0005', 110.00, 10.00, 15.00, 115.00, 'cancelado', 'Cliente solicitó cancelación', '2026-02-22 11:20:00', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_items`
--

CREATE TABLE `orden_items` (
  `id_orden_item` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` decimal(12,4) NOT NULL DEFAULT 1.0000,
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_items`
--

INSERT INTO `orden_items` (`id_orden_item`, `id_orden`, `id_producto`, `cantidad`, `precio_unitario`, `descuento`, `subtotal`, `created_at`) VALUES
(1, 1, 1, 1.0000, 950.00, 0.00, 950.00, '2026-02-27 06:00:10'),
(2, 2, 2, 2.0000, 22.50, 5.00, 40.00, '2026-02-27 06:00:10'),
(3, 3, 1, 1.0000, 950.00, 0.00, 950.00, '2026-02-27 06:00:10'),
(4, 3, 5, 2.0000, 5.50, 0.00, 11.00, '2026-02-27 06:00:10'),
(5, 4, 4, 2.0000, 18.00, 0.00, 36.00, '2026-02-27 06:00:10'),
(6, 5, 3, 4.0000, 7.25, 0.00, 29.00, '2026-02-27 06:00:10'),
(7, 5, 5, 8.0000, 5.50, 0.00, 44.00, '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfiles`
--

CREATE TABLE `perfiles` (
  `id_perfil` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `nivel_acceso` tinyint(4) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `perfiles`
--

INSERT INTO `perfiles` (`id_perfil`, `nombre`, `descripcion`, `nivel_acceso`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', 'Acceso total al sistema', 9, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 'Administrador', 'Gestión general de la empresa', 7, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 'Vendedor', 'Creación de órdenes y facturas', 4, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 'Bodeguero', 'Gestión de productos y stock', 3, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 'Contador', 'Acceso a reportes y facturas', 5, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_compra` decimal(12,2) NOT NULL DEFAULT 0.00,
  `precio_venta` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `unidad_medida` varchar(30) DEFAULT 'UNIDAD',
  `imagen` varchar(300) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `id_empresa`, `id_categoria`, `id_proveedor`, `codigo`, `nombre`, `descripcion`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `unidad_medida`, `imagen`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'ELEC-001', 'Laptop Dell Inspiron 15', 'Laptop Intel Core i5, 8GB RAM, 512GB SSD', 700.00, 950.00, 15, 3, 'UNIDAD', NULL, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 1, 1, 1, 'ELEC-002', 'Mouse Inalámbrico Logitech', 'Mouse ergonómico inalámbrico 2.4GHz', 12.00, 22.50, 80, 10, 'UNIDAD', NULL, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, 2, 2, 'ALIM-001', 'Arroz Integral 5kg', 'Arroz integral orgánico bolsa 5kg', 4.50, 7.25, 200, 30, 'FUNDA', NULL, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 1, 3, 3, 'ROPA-001', 'Camiseta Polo Unisex Talla M', 'Camiseta polo 100% algodón, varios colores', 8.00, 18.00, 50, 10, 'UNIDAD', NULL, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 1, 5, 5, 'PAPEL-001', 'Resma Papel A4 75gr', 'Resma 500 hojas papel bond A4 75gr', 3.20, 5.50, 120, 20, 'RESMA', NULL, 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `razon_social` varchar(200) NOT NULL,
  `contacto` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `id_empresa`, `ruc`, `razon_social`, `contacto`, `email`, `telefono`, `direccion`, `categoria`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, '0990111222001', 'TechImport S.A.', 'Pedro Vásquez', 'pedro@techimport.com', '0991234567', 'Av. Amazonas 100, Quito', 'Electrónica', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(2, 1, '0990333444001', 'Alimentos del Campo Cía.', 'Lucía Herrera', 'lucia@alicampo.com', '0997654321', 'Km 5 Vía Daule, Guayaquil', 'Alimentos', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, '0990555666001', 'Textiles Andes S.A.', 'Diego Ruiz', 'diego@texandes.com', '0994455667', 'Calle Bolívar 200, Ambato', 'Textil', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(4, 1, '0990777888001', 'HogarMax Distribuciones', 'Sandra Mora', 'sandra@hogarmax.com', '0992233445', 'Av. Del Ejército 55, Cuenca', 'Hogar', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(5, 1, '0990999000001', 'Papelería Office EC', 'Fernando León', 'fleon@officeec.com', '0998877665', 'Juan León Mera 321, Quito', 'Papelería', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_perfil` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `id_empresa`, `id_perfil`, `username`, `email`, `password`, `nombres`, `apellidos`, `activo`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 'jperez', 'jperez@miempresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan', 'Pérez', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(3, 1, 3, 'mgarcia', 'mgarcia@miempresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'García', 1, '2026-02-27 06:00:10', '2026-02-27 06:00:10'),
(6, 1, 1, 'admin', 'admin@empresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Sistema', 1, '2026-02-27 10:53:59', '2026-02-27 10:53:59');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD KEY `fk_categoria_empresa` (`id_empresa`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD KEY `fk_cliente_empresa` (`id_empresa`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id_empresa`),
  ADD UNIQUE KEY `ruc` (`ruc`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id_factura`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD KEY `fk_factura_empresa` (`id_empresa`),
  ADD KEY `fk_factura_cliente` (`id_cliente`),
  ADD KEY `fk_factura_usuario` (`id_usuario`),
  ADD KEY `fk_factura_forma_pago` (`id_forma_pago`);

--
-- Indices de la tabla `factura_items`
--
ALTER TABLE `factura_items`
  ADD PRIMARY KEY (`id_factura_item`),
  ADD KEY `fk_fitem_factura` (`id_factura`),
  ADD KEY `fk_fitem_producto` (`id_producto`);

--
-- Indices de la tabla `formas_pago`
--
ALTER TABLE `formas_pago`
  ADD PRIMARY KEY (`id_forma_pago`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id_orden`),
  ADD UNIQUE KEY `numero_orden` (`numero_orden`),
  ADD KEY `fk_orden_empresa` (`id_empresa`),
  ADD KEY `fk_orden_cliente` (`id_cliente`),
  ADD KEY `fk_orden_usuario` (`id_usuario`),
  ADD KEY `fk_orden_forma_pago` (`id_forma_pago`);

--
-- Indices de la tabla `orden_items`
--
ALTER TABLE `orden_items`
  ADD PRIMARY KEY (`id_orden_item`),
  ADD KEY `fk_oitem_orden` (`id_orden`),
  ADD KEY `fk_oitem_producto` (`id_producto`);

--
-- Indices de la tabla `perfiles`
--
ALTER TABLE `perfiles`
  ADD PRIMARY KEY (`id_perfil`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `uq_producto_codigo` (`id_empresa`,`codigo`),
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD KEY `fk_proveedor_empresa` (`id_empresa`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_empresa` (`id_empresa`),
  ADD KEY `fk_usuario_perfil` (`id_perfil`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `factura_items`
--
ALTER TABLE `factura_items`
  MODIFY `id_factura_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `formas_pago`
--
ALTER TABLE `formas_pago`
  MODIFY `id_forma_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `orden_items`
--
ALTER TABLE `orden_items`
  MODIFY `id_orden_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `perfiles`
--
ALTER TABLE `perfiles`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `fk_categoria_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_cliente_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `fk_factura_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  ADD CONSTRAINT `fk_factura_forma_pago` FOREIGN KEY (`id_forma_pago`) REFERENCES `formas_pago` (`id_forma_pago`),
  ADD CONSTRAINT `fk_factura_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `factura_items`
--
ALTER TABLE `factura_items`
  ADD CONSTRAINT `fk_fitem_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`),
  ADD CONSTRAINT `fk_fitem_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_orden_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `fk_orden_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  ADD CONSTRAINT `fk_orden_forma_pago` FOREIGN KEY (`id_forma_pago`) REFERENCES `formas_pago` (`id_forma_pago`),
  ADD CONSTRAINT `fk_orden_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `orden_items`
--
ALTER TABLE `orden_items`
  ADD CONSTRAINT `fk_oitem_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`id_orden`),
  ADD CONSTRAINT `fk_oitem_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `fk_producto_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  ADD CONSTRAINT `fk_producto_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`);

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `fk_proveedor_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  ADD CONSTRAINT `fk_usuario_perfil` FOREIGN KEY (`id_perfil`) REFERENCES `perfiles` (`id_perfil`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
