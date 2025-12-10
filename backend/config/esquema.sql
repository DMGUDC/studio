-- =====================================================
-- XChef - Sistema de Gestión de Restaurantes
-- Esquema de Base de Datos MySQL
-- Todos los nombres en español
-- =====================================================

-- Configuración inicial
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Crear la base de datos (eliminar si existe para reinstalación limpia)
DROP DATABASE IF EXISTS xchef_db;
CREATE DATABASE xchef_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xchef_db;

-- =====================================================
-- Tabla: usuarios
-- Almacena información de todos los usuarios del sistema
-- =====================================================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Mesero',
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    url_avatar VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: permisos_usuario
-- Almacena los permisos de acceso de cada usuario
-- =====================================================
DROP TABLE IF EXISTS permisos_usuario;
CREATE TABLE permisos_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL,
    permiso VARCHAR(100) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unico_permiso_usuario (usuario_id, permiso)
);

-- =====================================================
-- Tabla: pisos
-- Almacena los pisos/áreas del restaurante
-- =====================================================
DROP TABLE IF EXISTS pisos;
CREATE TABLE pisos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: mesas
-- Almacena información de las mesas del restaurante
-- =====================================================
DROP TABLE IF EXISTS mesas;
CREATE TABLE mesas (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    piso_id VARCHAR(50),
    estado ENUM('disponible', 'ocupada') DEFAULT 'disponible',
    forma ENUM('cuadrada', 'redonda') DEFAULT 'cuadrada',
    posicion_x DECIMAL(5,2) DEFAULT 0,
    posicion_y DECIMAL(5,2) DEFAULT 0,
    personas INT,
    pedido_id VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piso_id) REFERENCES pisos(id) ON DELETE SET NULL
);

-- =====================================================
-- Tabla: categorias_inventario
-- Categorías para los productos de inventario
-- =====================================================
DROP TABLE IF EXISTS categorias_inventario;
CREATE TABLE categorias_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- Tabla: inventario
-- Almacena los productos del inventario
-- =====================================================
DROP TABLE IF EXISTS inventario;
CREATE TABLE inventario (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock DECIMAL(10,2) DEFAULT 0,
    unidad VARCHAR(50) NOT NULL,
    umbral DECIMAL(10,2) DEFAULT 0,
    precio DECIMAL(10,2) DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: subrecetas
-- Almacena las sub-recetas/pasos de preparación
-- =====================================================
DROP TABLE IF EXISTS subrecetas;
CREATE TABLE subrecetas (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tiempo_preparacion INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: ingredientes_subreceta
-- Relación entre subrecetas e ingredientes del inventario
-- =====================================================
DROP TABLE IF EXISTS ingredientes_subreceta;
CREATE TABLE ingredientes_subreceta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subreceta_id VARCHAR(50) NOT NULL,
    inventario_id VARCHAR(50) NOT NULL,
    cantidad DECIMAL(10,3) DEFAULT 0,
    merma DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (subreceta_id) REFERENCES subrecetas(id) ON DELETE CASCADE,
    FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE CASCADE
);

-- =====================================================
-- Tabla: categorias_platillo
-- Categorías para los platillos del menú
-- =====================================================
DROP TABLE IF EXISTS categorias_platillo;
CREATE TABLE categorias_platillo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- Tabla: platillos
-- Almacena los platillos del menú
-- =====================================================
DROP TABLE IF EXISTS platillos;
CREATE TABLE platillos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) DEFAULT 0,
    descripcion TEXT,
    es_publico BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: platillo_subrecetas
-- Relación entre platillos y sus subrecetas
-- =====================================================
DROP TABLE IF EXISTS platillo_subrecetas;
CREATE TABLE platillo_subrecetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platillo_id VARCHAR(50) NOT NULL,
    subreceta_id VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0,
    FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE CASCADE,
    FOREIGN KEY (subreceta_id) REFERENCES subrecetas(id) ON DELETE CASCADE,
    UNIQUE KEY unico_platillo_subreceta (platillo_id, subreceta_id)
);

-- =====================================================
-- Tabla: pedidos
-- Almacena los pedidos del restaurante
-- =====================================================
DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
    id VARCHAR(50) PRIMARY KEY,
    mesa VARCHAR(100) NOT NULL,
    mesero VARCHAR(100) NOT NULL,
    estado ENUM('Pendiente', 'Preparando', 'Listo', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    total DECIMAL(10,2) DEFAULT 0,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Otro'),
    personas INT DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: items_pedido
-- Almacena los items/productos de cada pedido
-- =====================================================
DROP TABLE IF EXISTS items_pedido;
CREATE TABLE items_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL,
    platillo_id VARCHAR(50),
    nombre_platillo VARCHAR(150) NOT NULL,
    cantidad INT DEFAULT 1,
    precio DECIMAL(10,2) DEFAULT 0,
    notas TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE SET NULL
);

-- =====================================================
-- Tabla: subrecetas_item_pedido
-- Estado de las subrecetas para cada item del pedido
-- =====================================================
DROP TABLE IF EXISTS subrecetas_item_pedido;
CREATE TABLE subrecetas_item_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_pedido_id INT NOT NULL,
    subreceta_id VARCHAR(50) NOT NULL,
    estado ENUM('Pendiente', 'Preparando', 'Listo') DEFAULT 'Pendiente',
    cocinero_asignado VARCHAR(50),
    FOREIGN KEY (item_pedido_id) REFERENCES items_pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (subreceta_id) REFERENCES subrecetas(id) ON DELETE CASCADE,
    FOREIGN KEY (cocinero_asignado) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =====================================================
-- Tabla: registros_financieros
-- Almacena ingresos y gastos
-- =====================================================
DROP TABLE IF EXISTS registros_financieros;
CREATE TABLE registros_financieros (
    id VARCHAR(50) PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10,2) NOT NULL,
    tipo ENUM('ingreso', 'gasto') NOT NULL,
    descripcion VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES para mejorar el rendimiento
-- =====================================================
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(creado_en);
CREATE INDEX idx_mesas_estado ON mesas(estado);
CREATE INDEX idx_inventario_categoria ON inventario(categoria);
CREATE INDEX idx_platillos_categoria ON platillos(categoria);
CREATE INDEX idx_registros_financieros_fecha ON registros_financieros(fecha);
CREATE INDEX idx_registros_financieros_tipo ON registros_financieros(tipo);

-- =====================================================
-- DATOS INICIALES - Insertar pisos por defecto
-- =====================================================
INSERT INTO pisos (id, nombre) VALUES
('piso1', 'Piso Principal'),
('terraza', 'Terraza');

-- =====================================================
-- DATOS INICIALES - Insertar usuario administrador por defecto
-- La contraseña es 'xchef123' hasheada con bcrypt
-- =====================================================
-- Contraseña: 123456 (hash bcrypt)
INSERT INTO usuarios (id, nombre, correo, contrasena, rol, estado, url_avatar) VALUES
('usr01', 'Gerente Demo', 'gerente@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Gerente', 'Activo', 'https://images.unsplash.com/photo-1521119989659-a83eee488004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjQyNzA2MTF8MA&ixlib=rb-4.1.0&q=80&w=1080'),
('usr02', 'Carlos', 'mesero@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Mesero', 'Activo', NULL),
('usr03', 'Ana', 'ana@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Mesero', 'Activo', NULL),
('usr04', 'Sofia', 'sofia@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Mesero', 'Inactivo', NULL),
('usr05', 'Juan', 'cocinero@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Cocinero', 'Activo', NULL),
('usr06', 'Maria', 'maria@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Cocinero', 'Activo', NULL),
('usr07', 'Pedro', 'pedro@xchef.local', '$2a$10$1stg2TOtUYFpl7n91Kz09OTp0QxdIFYAk4bxVLked2sKakYW6YNeG', 'Cocinero', 'Activo', NULL);

-- Permisos para el Gerente
INSERT INTO permisos_usuario (usuario_id, permiso) VALUES
('usr01', '/dashboard'),
('usr01', '/dashboard/mesas'),
('usr01', '/dashboard/pedidos'),
('usr01', '/dashboard/cocina'),
('usr01', '/dashboard/menu'),
('usr01', '/dashboard/inventario'),
('usr01', '/dashboard/finanzas'),
('usr01', '/dashboard/facturacion'),
('usr01', '/dashboard/usuarios');

-- Permisos para Meseros
INSERT INTO permisos_usuario (usuario_id, permiso) VALUES
('usr02', '/dashboard'),
('usr02', '/dashboard/mesas'),
('usr02', '/dashboard/pedidos'),
('usr03', '/dashboard'),
('usr03', '/dashboard/mesas'),
('usr03', '/dashboard/pedidos'),
('usr04', '/dashboard'),
('usr04', '/dashboard/mesas'),
('usr04', '/dashboard/pedidos');

-- Permisos para Cocineros
INSERT INTO permisos_usuario (usuario_id, permiso) VALUES
('usr05', '/dashboard/cocina'),
('usr05', '/dashboard/menu'),
('usr05', '/dashboard/inventario'),
('usr06', '/dashboard/cocina'),
('usr06', '/dashboard/menu'),
('usr06', '/dashboard/inventario'),
('usr07', '/dashboard/cocina'),
('usr07', '/dashboard/menu'),
('usr07', '/dashboard/inventario');

-- =====================================================
-- DATOS INICIALES - Mesas
-- =====================================================
INSERT INTO mesas (id, nombre, piso_id, estado, forma, posicion_x, posicion_y) VALUES
('mesa1', 'Mesa 1', 'piso1', 'disponible', 'cuadrada', 10, 10),
('mesa2', 'Mesa 2', 'piso1', 'disponible', 'cuadrada', 35, 10),
('mesa3', 'Mesa 3', 'piso1', 'disponible', 'cuadrada', 60, 10),
('mesa4', 'Mesa 4', 'piso1', 'disponible', 'redonda', 10, 40),
('mesa5', 'Mesa 5', 'piso1', 'disponible', 'redonda', 35, 40),
('barra1', 'Barra 1', 'piso1', 'disponible', 'cuadrada', 85, 10),
('barra2', 'Barra 2', 'piso1', 'disponible', 'cuadrada', 85, 30),
('mesa8', 'Mesa 8', 'piso1', 'disponible', 'cuadrada', 10, 70),
('terraza1', 'Terraza 1', 'terraza', 'disponible', 'cuadrada', 15, 20),
('terraza2', 'Terraza 2', 'terraza', 'disponible', 'cuadrada', 45, 20),
('terraza3', 'Terraza 3', 'terraza', 'disponible', 'redonda', 75, 20),
('terraza4', 'Terraza 4', 'terraza', 'disponible', 'redonda', 15, 60);

-- =====================================================
-- DATOS INICIALES - Inventario
-- =====================================================
INSERT INTO inventario (id, nombre, categoria, stock, unidad, umbral, precio) VALUES
('inv1', 'Tomates', 'Vegetales', 20, 'kg', 5, 1.50),
('inv2', 'Pechuga de Pollo', 'Carnes', 15, 'kg', 10, 8.00),
('inv3', 'Queso Mozzarella', 'Lácteos', 8, 'kg', 4, 7.50),
('inv4', 'Harina de Trigo', 'Secos', 50, 'kg', 20, 1.00),
('inv5', 'Aceite de Oliva', 'Aceites', 10, 'litros', 5, 12.00),
('inv6', 'Vino Tinto', 'Bebidas', 3, 'botellas', 5, 9.50),
('inv7', 'Servilletas', 'No Alimentos', 5, 'paquetes', 2, 2.00),
('inv8', 'Sal', 'Condimentos', 25, 'kg', 2, 0.50),
('inv9', 'Levadura', 'Secos', 1, 'kg', 0.5, 20.00),
('inv10', 'Salsa de tomate', 'Salsas', 10, 'litros', 3, 2.50),
('inv11', 'Lechuga Romana', 'Vegetales', 30, 'unidades', 10, 0.80),
('inv12', 'Yemas de huevo', 'Lácteos', 100, 'unidades', 20, 0.20),
('inv13', 'Anchoas', 'Conservas', 20, 'latas', 5, 3.00),
('inv14', 'Ajo', 'Vegetales', 5, 'cabezas', 2, 0.30),
('inv15', 'Mostaza', 'Condimentos', 2, 'kg', 0.5, 10.00),
('inv16', 'Pasta', 'Secos', 40, 'kg', 10, 2.00),
('inv17', 'Panceta', 'Carnes', 10, 'kg', 3, 15.00),
('inv18', 'Queso Pecorino', 'Lácteos', 5, 'kg', 1, 25.00),
('inv19', 'Carne de res', 'Carnes', 20, 'kg', 5, 10.00),
('inv20', 'Pan de hamburguesa', 'Panadería', 50, 'unidades', 10, 0.50),
('inv21', 'Papas', 'Vegetales', 30, 'kg', 10, 1.20);

-- =====================================================
-- DATOS INICIALES - SubRecetas
-- =====================================================
INSERT INTO subrecetas (id, nombre, descripcion, tiempo_preparacion) VALUES
('sr1', 'Preparar masa', 'Mezclar harina, agua, levadura y sal. Amasar durante 10 minutos.', 10),
('sr2', 'Añadir salsa y queso', 'Extender la salsa de tomate sobre la masa y espolvorear mozzarella rallada.', 5),
('sr3', 'Hornear', 'Hornear a 220°C durante 15 minutos o hasta que esté dorada.', 15),
('sr4', 'Lavar y cortar lechuga', 'Lavar la lechuga romana y cortarla en trozos grandes.', 5),
('sr5', 'Preparar aderezo', 'Mezclar yemas de huevo, anchoas, ajo, mostaza y aceite.', 7),
('sr6', 'Hervir pasta', 'Cocinar la pasta al dente según las instrucciones del paquete.', 12),
('sr7', 'Saltear panceta', 'Cortar y saltear la panceta hasta que esté crujiente.', 5),
('sr8', 'Mezclar salsa', 'Batir huevos y queso Pecorino. Mezclar con la panceta y la pasta caliente.', 4),
('sr9', 'Emplatar', 'Servir inmediatamente con pimienta negra recién molida.', 2),
('sr10', 'Cocinar carne', 'Formar la hamburguesa y cocinarla al punto deseado.', 8),
('sr11', 'Montar hamburguesa', 'Colocar la carne en el pan con lechuga, tomate y salsas.', 3),
('sr12', 'Freír papas', 'Freír las papas en aceite caliente hasta que estén doradas y crujientes.', 10);

-- Ingredientes de subrecetas
INSERT INTO ingredientes_subreceta (subreceta_id, inventario_id, cantidad, merma) VALUES
('sr1', 'inv4', 0.5, 0),
('sr1', 'inv9', 0.01, 0),
('sr1', 'inv8', 0.02, 0),
('sr2', 'inv10', 0.1, 5),
('sr2', 'inv3', 0.2, 0),
('sr4', 'inv11', 1, 15),
('sr5', 'inv12', 2, 0),
('sr5', 'inv13', 0.5, 10),
('sr5', 'inv14', 0.25, 20),
('sr5', 'inv15', 0.01, 0),
('sr5', 'inv5', 0.1, 0),
('sr6', 'inv16', 0.2, 0),
('sr7', 'inv17', 0.1, 30),
('sr8', 'inv12', 2, 0),
('sr8', 'inv18', 0.05, 0),
('sr10', 'inv19', 0.25, 25),
('sr11', 'inv20', 1, 0),
('sr11', 'inv11', 0.1, 15),
('sr11', 'inv1', 0.1, 10),
('sr12', 'inv21', 0.3, 20);

-- =====================================================
-- DATOS INICIALES - Platillos
-- =====================================================
INSERT INTO platillos (id, nombre, categoria, precio, descripcion, es_publico) VALUES
('d1', 'Pizza Margherita', 'Pizzas', 12.50, 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca.', TRUE),
('d2', 'Ensalada César', 'Ensaladas', 8.00, 'Lechuga romana fresca con nuestro aderezo César casero, crutones y queso parmesano.', TRUE),
('d3', 'Pasta Carbonara', 'Pastas', 14.00, 'Auténtica pasta Carbonara con panceta crujiente, yemas de huevo y queso Pecorino.', FALSE),
('d4', 'Hamburguesa XChef', 'Hamburguesas', 11.50, 'Nuestra hamburguesa de la casa con carne de res premium, lechuga, tomate y salsa especial.', TRUE),
('d5', 'Papas Fritas', 'Acompañamientos', 4.00, 'Papas fritas crujientes y doradas, el acompañamiento perfecto.', TRUE);

-- Relación platillos-subrecetas
INSERT INTO platillo_subrecetas (platillo_id, subreceta_id, orden) VALUES
('d1', 'sr1', 1),
('d1', 'sr2', 2),
('d1', 'sr3', 3),
('d2', 'sr4', 1),
('d2', 'sr5', 2),
('d3', 'sr6', 1),
('d3', 'sr7', 2),
('d3', 'sr8', 3),
('d4', 'sr10', 1),
('d4', 'sr11', 2),
('d5', 'sr12', 1);

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- FIN DEL ESQUEMA
-- Para importar: mysql -u root -p < esquema.sql
-- Usuario por defecto: gerente@xchef.local / 123456
-- =====================================================
