-- ============================================================
-- GESTOCK - Base de datos completa (psql)
-- Script consolidado: crea la BD y aplica todo el esquema.
--   psql -U postgres -f database/gestock.sql
-- ============================================================

CREATE DATABASE "Gestock_db"
  WITH ENCODING 'UTF8'
       LC_COLLATE = 'es_CO.UTF-8'
       LC_CTYPE = 'es_CO.UTF-8'
       TEMPLATE = template0;

\c "Gestock_db"

-- ============================================================
-- Esquema (equivalente a backend/sql/02_create_tables.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS empresas (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(200) NOT NULL,
  nit                 VARCHAR(50)  NOT NULL UNIQUE,
  correo              VARCHAR(200) NOT NULL,
  telefono            VARCHAR(30),
  direccion           VARCHAR(255),
  estado              VARCHAR(15)  NOT NULL DEFAULT 'Activa'
                      CHECK (estado IN ('Activa', 'Inactiva')),
  moneda              VARCHAR(50)  NOT NULL DEFAULT 'COP - Peso Colombiano',
  formato_fecha       VARCHAR(20)  NOT NULL DEFAULT 'DD/MM/YYYY',
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(80) NOT NULL UNIQUE,
  descripcion    VARCHAR(255),
  estado         VARCHAR(15) NOT NULL DEFAULT 'Activo'
                 CHECK (estado IN ('Activo', 'Inactivo')),
  fecha_creacion TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permisos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  codigo      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  modulo      VARCHAR(60)  NOT NULL
);

CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id     INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(150) NOT NULL,
  apellido            VARCHAR(150) NOT NULL,
  email               VARCHAR(200) NOT NULL UNIQUE,
  password_hash       VARCHAR(100) NOT NULL,
  estado              VARCHAR(15)  NOT NULL DEFAULT 'Activo'
                      CHECK (estado IN ('Activo', 'Inactivo')),
  rol_id              INT NOT NULL REFERENCES roles(id),
  empresa_id          INT REFERENCES empresas(id) ON DELETE SET NULL,
  ultimo_acceso       TIMESTAMP,
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  estado      VARCHAR(15)  NOT NULL DEFAULT 'Activo'
              CHECK (estado IN ('Activo', 'Inactivo'))
);

CREATE TABLE IF NOT EXISTS bodegas (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL UNIQUE,
  codigo      VARCHAR(20)  NOT NULL UNIQUE,
  ciudad      VARCHAR(100),
  direccion   VARCHAR(255),
  responsable VARCHAR(150),
  telefono    VARCHAR(30),
  capacidad   INT NOT NULL DEFAULT 0,
  ocupado     INT NOT NULL DEFAULT 0,
  activa      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS productos (
  id              SERIAL PRIMARY KEY,
  codigo          VARCHAR(50)  NOT NULL UNIQUE,
  nombre          VARCHAR(200) NOT NULL,
  descripcion     VARCHAR(500),
  categoria_id    INT REFERENCES categorias(id) ON DELETE SET NULL,
  bodega_id       INT REFERENCES bodegas(id) ON DELETE SET NULL,
  precio          NUMERIC(14,2) NOT NULL DEFAULT 0,
  costo           NUMERIC(14,2) NOT NULL DEFAULT 0,
  stock           INT NOT NULL DEFAULT 0,
  stock_min       INT NOT NULL DEFAULT 0,
  estado          VARCHAR(15)  NOT NULL DEFAULT 'Activo'
                  CHECK (estado IN ('Activo', 'Inactivo')),
  fecha_creacion  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id            SERIAL PRIMARY KEY,
  producto_id   INT REFERENCES productos(id) ON DELETE SET NULL,
  bodega_id     INT REFERENCES bodegas(id) ON DELETE SET NULL,
  tipo          VARCHAR(20) NOT NULL
                CHECK (tipo IN ('ENTRADA', 'SALIDA', 'TRANSFERENCIA')),
  cantidad      INT NOT NULL CHECK (cantidad > 0),
  motivo        VARCHAR(100) NOT NULL,
  responsable   VARCHAR(150) NOT NULL,
  observaciones VARCHAR(255),
  estado        VARCHAR(20) NOT NULL DEFAULT 'Validado'
                CHECK (estado IN ('Validado', 'Discrepancia')),
  usuario_id    INT REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recepciones (
  id               SERIAL PRIMARY KEY,
  numero_documento VARCHAR(50)  NOT NULL UNIQUE,
  proveedor        VARCHAR(200) NOT NULL,
  fecha_recepcion  TIMESTAMP    NOT NULL DEFAULT NOW(),
  usuario_id       INT NOT NULL REFERENCES usuarios(id),
  bodega_id        INT REFERENCES bodegas(id) ON DELETE SET NULL,
  estado           VARCHAR(20)  NOT NULL DEFAULT 'En Proceso'
                   CHECK (estado IN ('En Proceso', 'Validado', 'Discrepancia')),
  observaciones    VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS recepcion_detalle (
  id             SERIAL PRIMARY KEY,
  recepcion_id   INT NOT NULL REFERENCES recepciones(id) ON DELETE CASCADE,
  producto_id    INT NOT NULL REFERENCES productos(id),
  cantidad       INT NOT NULL CHECK (cantidad > 0),
  costo_unitario NUMERIC(14,2),
  UNIQUE (recepcion_id, producto_id)
);

CREATE TABLE IF NOT EXISTS incidencias (
  id               SERIAL PRIMARY KEY,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      TEXT NOT NULL,
  prioridad        VARCHAR(20) NOT NULL
                   CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  estado           VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                   CHECK (estado IN ('Pendiente', 'En Revisión', 'Resuelto')),
  reportado_por    INT NOT NULL REFERENCES usuarios(id),
  fecha            TIMESTAMP NOT NULL DEFAULT NOW(),
  resuelto_por     INT REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_resolucion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mantenimientos (
  id               SERIAL PRIMARY KEY,
  equipo           VARCHAR(150) NOT NULL,
  tipo             VARCHAR(20) NOT NULL
                   CHECK (tipo IN ('Preventivo', 'Correctivo', 'Predictivo')),
  fecha_programada DATE NOT NULL,
  estado           VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                   CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado')),
  usuario_id       INT REFERENCES usuarios(id) ON DELETE SET NULL,
  descripcion      VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS auditorias (
  id             SERIAL PRIMARY KEY,
  usuario_id     INT REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_nombre VARCHAR(300),
  accion         VARCHAR(30) NOT NULL,
  modulo         VARCHAR(60) NOT NULL,
  entidad        VARCHAR(120),
  registro_id    VARCHAR(60),
  descripcion    TEXT,
  fecha          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sesiones (
  id            SERIAL PRIMARY KEY,
  usuario_id    INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ip            VARCHAR(45),
  user_agent    TEXT,
  dispositivo   VARCHAR(30),
  navegador     VARCHAR(40),
  fecha_inicio  TIMESTAMP NOT NULL DEFAULT NOW(),
  ultimo_acceso TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_cierre  TIMESTAMP,
  estado        VARCHAR(15) NOT NULL DEFAULT 'Activa'
                CHECK (estado IN ('Activa', 'Cerrada'))
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo      VARCHAR(150) NOT NULL,
  mensaje     TEXT NOT NULL,
  tipo        VARCHAR(30) NOT NULL DEFAULT 'info',
  leida       BOOLEAN NOT NULL DEFAULT FALSE,
  fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave               VARCHAR(60) PRIMARY KEY,
  valor               TEXT NOT NULL,
  descripcion         VARCHAR(255),
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol         ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria  ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_bodega     ON productos(bodega_id);
CREATE INDEX IF NOT EXISTS idx_productos_nombre     ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha    ON movimientos_inventario(fecha);
CREATE INDEX IF NOT EXISTS idx_auditorias_fecha     ON auditorias(fecha);
CREATE INDEX IF NOT EXISTS idx_auditorias_modulo    ON auditorias(modulo);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado   ON incidencias(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario     ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_user  ON notificaciones(usuario_id, leida);

-- ============================================================
-- Datos semilla (roles, permisos, usuarios, demo)
-- ============================================================

INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema y gestión de usuarios, roles y permisos.'),
  ('Supervisor', 'Gestiona inventario, productos, bodegas, recepciones y reportes.'),
  ('Operario', 'Registra movimientos de inventario y reporta incidencias.'),
  ('Técnico de Mantenimiento', 'Programa y ejecuta mantenimientos, gestiona incidencias técnicas.'),
  ('Auditor', 'Consulta de solo lectura para auditoría y verificación de datos.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO permisos (nombre, codigo, descripcion, modulo) VALUES
  ('Ver dashboard', 'dashboard.view', 'Ver el panel de indicadores.', 'Dashboard'),
  ('Ver empresas', 'empresas.view', 'Consultar las empresas.', 'Empresas'),
  ('Crear empresas', 'empresas.create', 'Registrar nuevas empresas.', 'Empresas'),
  ('Editar empresas', 'empresas.edit', 'Actualizar datos de empresas.', 'Empresas'),
  ('Eliminar empresas', 'empresas.delete', 'Eliminar empresas.', 'Empresas'),
  ('Ver usuarios', 'usuarios.view', 'Consultar el listado de usuarios.', 'Usuarios'),
  ('Crear usuarios', 'usuarios.create', 'Registrar usuarios.', 'Usuarios'),
  ('Editar usuarios', 'usuarios.edit', 'Actualizar usuarios y roles.', 'Usuarios'),
  ('Desactivar usuarios', 'usuarios.desactivar', 'Activar o desactivar cuentas.', 'Usuarios'),
  ('Eliminar usuarios', 'usuarios.delete', 'Eliminar usuarios.', 'Usuarios'),
  ('Ver roles', 'roles.view', 'Consultar roles.', 'Roles'),
  ('Crear roles', 'roles.create', 'Crear roles nuevos.', 'Roles'),
  ('Editar roles', 'roles.edit', 'Actualizar roles.', 'Roles'),
  ('Eliminar roles', 'roles.delete', 'Eliminar roles.', 'Roles'),
  ('Asignar permisos a roles', 'roles.asignar_permisos', 'Asignar permisos a los roles.', 'Roles'),
  ('Ver permisos', 'permisos.view', 'Consultar el catálogo de permisos.', 'Roles'),
  ('Ver categorías', 'categorias.view', 'Consultar categorías.', 'Categorías'),
  ('Crear categorías', 'categorias.create', 'Registrar categorías.', 'Categorías'),
  ('Editar categorías', 'categorias.edit', 'Actualizar categorías.', 'Categorías'),
  ('Eliminar categorías', 'categorias.delete', 'Eliminar categorías.', 'Categorías'),
  ('Ver bodegas', 'bodegas.view', 'Consultar bodegas.', 'Bodegas'),
  ('Crear bodegas', 'bodegas.create', 'Registrar bodegas.', 'Bodegas'),
  ('Editar bodegas', 'bodegas.edit', 'Actualizar bodegas.', 'Bodegas'),
  ('Eliminar bodegas', 'bodegas.delete', 'Eliminar bodegas.', 'Bodegas'),
  ('Ver productos', 'productos.view', 'Consultar productos.', 'Productos'),
  ('Crear productos', 'productos.create', 'Registrar productos.', 'Productos'),
  ('Editar productos', 'productos.edit', 'Actualizar productos.', 'Productos'),
  ('Eliminar productos', 'productos.delete', 'Eliminar productos.', 'Productos'),
  ('Ver inventario', 'inventario.view', 'Consultar inventario y alertas.', 'Inventario'),
  ('Registrar inventario', 'inventario.registrar', 'Registrar ajustes de inventario.', 'Inventario'),
  ('Ver movimientos', 'movimientos.view', 'Consultar movimientos de inventario.', 'Inventario'),
  ('Ver recepciones', 'recepcion.view', 'Consultar recepciones de mercancía.', 'Recepción'),
  ('Crear recepciones', 'recepcion.create', 'Registrar recepciones de mercancía.', 'Recepción'),
  ('Editar recepciones', 'recepcion.edit', 'Actualizar recepciones.', 'Recepción'),
  ('Eliminar recepciones', 'recepcion.delete', 'Eliminar recepciones.', 'Recepción'),
  ('Ver historial logístico', 'historial.view', 'Consultar historial logístico.', 'Historial'),
  ('Ver auditoría', 'auditoria.view', 'Consultar registros de auditoría.', 'Auditoría'),
  ('Ver reportes', 'reportes.view', 'Consultar reportes.', 'Reportes'),
  ('Exportar reportes', 'reportes.exportar', 'Exportar reportes.', 'Reportes'),
  ('Ver mantenimientos', 'mantenimiento.view', 'Consultar mantenimientos.', 'Mantenimiento'),
  ('Crear mantenimientos', 'mantenimiento.create', 'Programar mantenimientos.', 'Mantenimiento'),
  ('Editar mantenimientos', 'mantenimiento.edit', 'Actualizar mantenimientos.', 'Mantenimiento'),
  ('Eliminar mantenimientos', 'mantenimiento.delete', 'Eliminar mantenimientos.', 'Mantenimiento'),
  ('Ver incidencias', 'incidencias.view', 'Consultar incidencias.', 'Incidencias'),
  ('Crear incidencias', 'incidencias.create', 'Reportar incidencias.', 'Incidencias'),
  ('Editar incidencias', 'incidencias.edit', 'Actualizar incidencias.', 'Incidencias'),
  ('Resolver incidencias', 'incidencias.resolver', 'Resolver incidencias.', 'Incidencias'),
  ('Eliminar incidencias', 'incidencias.delete', 'Eliminar incidencias.', 'Incidencias'),
  ('Ver sesiones', 'sesiones.view', 'Consultar sesiones activas.', 'Sesiones'),
  ('Cerrar sesiones', 'sesiones.delete', 'Cerrar sesiones de usuarios.', 'Sesiones'),
  ('Ver notificaciones', 'notificaciones.view', 'Consultar notificaciones.', 'Notificaciones'),
  ('Ver configuración', 'configuracion.view', 'Consultar configuración del sistema.', 'Configuración'),
  ('Editar configuración', 'configuracion.edit', 'Actualizar configuración del sistema.', 'Configuración')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO empresas (nombre, nit, correo, telefono, direccion, estado, moneda, formato_fecha)
VALUES ('GESTOCK S.A.S.', '900123456-7', 'contacto@gestock.com', '+57 601 123 4567', 'Av. El Dorado # 68-90, Bogotá',
        'Activa', 'COP - Peso Colombiano', 'DD/MM/YYYY')
ON CONFLICT (nit) DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Supervisor'
  AND p.codigo IN (
    'dashboard.view', 'productos.view', 'productos.create', 'productos.edit', 'productos.delete',
    'categorias.view', 'categorias.create', 'categorias.edit', 'bodegas.view', 'bodegas.create', 'bodegas.edit',
    'inventario.view', 'inventario.registrar', 'movimientos.view', 'recepcion.view', 'recepcion.create', 'recepcion.edit',
    'historial.view', 'reportes.view', 'reportes.exportar', 'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver', 'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Operario'
  AND p.codigo IN (
    'inventario.view', 'productos.view', 'bodegas.view', 'movimientos.view',
    'recepcion.view', 'recepcion.create', 'incidencias.view', 'incidencias.create', 'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Técnico de Mantenimiento'
  AND p.codigo IN (
    'dashboard.view', 'productos.view', 'bodegas.view', 'movimientos.view', 'historial.view',
    'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver', 'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Auditor'
  AND p.codigo IN (
    'dashboard.view', 'empresas.view', 'usuarios.view', 'roles.view', 'permisos.view',
    'productos.view', 'categorias.view', 'bodegas.view', 'inventario.view', 'movimientos.view',
    'recepcion.view', 'historial.view', 'auditoria.view', 'reportes.view', 'reportes.exportar',
    'sesiones.view', 'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, password_hash, estado, rol_id, empresa_id)
SELECT 'Carlos', 'Rodríguez', 'admin@gestock.com',
       '$2b$10$hdR9lkvMKZMBhK/s7hvuf.bGsurFYelR9Kt9fP8Sou0cLhiQ3CeSq', 'Activo', r.id, e.id
FROM roles r, empresas e WHERE r.nombre = 'Administrador' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, password_hash, estado, rol_id, empresa_id)
SELECT 'María', 'Fernández', 'supervisor@gestock.com',
       '$2b$10$aG9DnFwoT.0/HkN0/Y63R.ThnyszoPRkW/IP39hvrmt73ErHFFZKy', 'Activo', r.id, e.id
FROM roles r, empresas e WHERE r.nombre = 'Supervisor' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, password_hash, estado, rol_id, empresa_id)
SELECT 'Juan', 'Pérez', 'operario@gestock.com',
       '$2b$10$lY2sWSzpCS4fhsr9OLAazOBYGfKiiE9KNE7PRhJA3ZW.gnhTe2G/e', 'Activo', r.id, e.id
FROM roles r, empresas e WHERE r.nombre = 'Operario' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, password_hash, estado, rol_id, empresa_id)
SELECT 'Andrés', 'Gómez', 'tecnico@gestock.com',
       '$2b$10$jQdVNWobYkT0GJGT45iXWuo6JBv4LJF0frk3CPWEK7814I0AggvV2', 'Activo', r.id, e.id
FROM roles r, empresas e WHERE r.nombre = 'Técnico de Mantenimiento' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, password_hash, estado, rol_id, empresa_id)
SELECT 'Laura', 'Martínez', 'auditor@gestock.com',
       '$2b$10$te.aYBmfzv/5uLUz3m6PROERjSWYTeHs1n0QkAfqaSc8VObvS800a', 'Activo', r.id, e.id
FROM roles r, empresas e WHERE r.nombre = 'Auditor' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
  ('notificacionesEmail', 'true', 'Enviar notificaciones por correo electrónico.'),
  ('resumenSemanal', 'true', 'Enviar resumen semanal de actividad.'),
  ('seguridadActiva', 'true', 'Activar medidas de seguridad del sistema.'),
  ('dosFactores', 'false', 'Autenticación de dos factores.'),
  ('tiempoSesion', '480', 'Tiempo máximo de sesión en minutos.'),
  ('expiracionPassword', '90', 'Días para expiración de contraseña.'),
  ('copiasSeguridad', 'true', 'Realizar copias de seguridad.'),
  ('backupAutomatico', 'true', 'Copias de seguridad automáticas.'),
  ('frecuenciaBackup', 'semanal', 'Frecuencia de copias de seguridad.')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica', 'Dispositivos y accesorios electrónicos.'),
  ('Ropa y Calzado', 'Prendas de vestir y calzado.'),
  ('Alimentos', 'Productos de consumo y perecederos.'),
  ('Herramientas', 'Herramientas manuales y eléctricas.'),
  ('Papelería', 'Artículos de oficina y papelería.'),
  ('Seguridad', 'Elementos de protección y seguridad industrial.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO bodegas (nombre, codigo, ciudad, direccion, responsable, telefono, capacidad, ocupado, activa) VALUES
  ('Bodega Central', 'BOD-01', 'Bogotá', 'Av. El Dorado # 68-90', 'Carlos Rodríguez', '+57 601 123 4567', 5000, 0, TRUE),
  ('Bodega Sur', 'BOD-02', 'Bogotá', 'Calle 54 Sur # 12-30', 'María Fernández', '+57 601 234 5678', 3000, 0, TRUE),
  ('Bodega Norte', 'BOD-03', 'Medellín', 'Carrera 46 # 10-20', 'Juan Pérez', '+57 604 345 6789', 4000, 0, TRUE)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'ELC-001', 'Portátil Empresarial', 'Laptop 14" 16GB RAM', c.id, b.id, 3200000, 2600000, 45, 10, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Electrónica' AND b.codigo = 'BOD-01'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'ELC-002', 'Monitor 24"', 'Monitor LED Full HD', c.id, b.id, 900000, 700000, 30, 8, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Electrónica' AND b.codigo = 'BOD-01'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'RPC-001', 'Camisa Manga Larga', 'Camisa corporativa talla M', c.id, b.id, 60000, 40000, 150, 25, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Ropa y Calzado' AND b.codigo = 'BOD-02'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'ALI-001', 'Café Molido 500g', 'Café de origen 500 gramos', c.id, b.id, 15000, 10000, 200, 30, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Alimentos' AND b.codigo = 'BOD-02'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'HER-001', 'Taladro 650W', 'Taladro percutor 650W', c.id, b.id, 250000, 180000, 20, 5, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Herramientas' AND b.codigo = 'BOD-03'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'PAP-001', 'Resma Papel Carta', 'Resma 500 hojas papel carta', c.id, b.id, 12000, 8000, 3, 15, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Papelería' AND b.codigo = 'BOD-03'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 'SEG-001', 'Casco de Seguridad', 'Casco industrial con arnés', c.id, b.id, 45000, 30000, 5, 10, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Seguridad' AND b.codigo = 'BOD-01'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO movimientos_inventario (producto_id, bodega_id, tipo, cantidad, motivo, responsable, estado, usuario_id)
SELECT p.id, p.bodega_id, 'ENTRADA', 50, 'Compra inicial', 'María Fernández', 'Validado', u.id
FROM productos p, usuarios u WHERE p.codigo = 'ELC-001' AND u.email = 'supervisor@gestock.com'
ON CONFLICT DO NOTHING;

INSERT INTO movimientos_inventario (producto_id, bodega_id, tipo, cantidad, motivo, responsable, estado, usuario_id)
SELECT p.id, p.bodega_id, 'ENTRADA', 30, 'Compra inicial', 'María Fernández', 'Validado', u.id
FROM productos p, usuarios u WHERE p.codigo = 'ELC-002' AND u.email = 'supervisor@gestock.com'
ON CONFLICT DO NOTHING;

UPDATE bodegas b SET ocupado = LEAST(b.capacidad, (SELECT COALESCE(SUM(p.stock), 0) FROM productos p WHERE p.bodega_id = b.id));