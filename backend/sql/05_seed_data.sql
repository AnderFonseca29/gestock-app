-- ============================================
-- GESTOCK - 05_seed_data.sql
-- Datos semilla: empresa, usuarios de prueba,
-- permisos por rol, datos demo y configuración.
-- ============================================

-- Asegura la columna telefono (también creada en 02 y 06) para bases existentes.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);

-- Empresa demo ---------------------------------------------------------
INSERT INTO empresas (nombre, nit, correo, telefono, direccion, estado, moneda, formato_fecha)
VALUES ('GESTOCK S.A.S.', '900123456-7', 'contacto@gestock.com', '+57 601 123 4567', 'Av. El Dorado # 68-90, Bogotá',
        'Activa', 'COP - Peso Colombiano', 'DD/MM/YYYY')
ON CONFLICT (nit) DO NOTHING;

-- Usuarios de prueba (contraseñas documentadas en README) --------------
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id)
SELECT 'Carlos', 'Rodríguez', 'admin@gestock.com', '315 400 1111',
       '$2b$10$hdR9lkvMKZMBhK/s7hvuf.bGsurFYelR9Kt9fP8Sou0cLhiQ3CeSq',
       'Activo', r.id, e.id
FROM roles r, empresas e
WHERE r.nombre = 'Administrador' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id)
SELECT 'María', 'Fernández', 'supervisor@gestock.com', '315 400 2222',
       '$2b$10$aG9DnFwoT.0/HkN0/Y63R.ThnyszoPRkW/IP39hvrmt73ErHFFZKy',
       'Activo', r.id, e.id
FROM roles r, empresas e
WHERE r.nombre = 'Supervisor' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id)
SELECT 'Juan', 'Pérez', 'operario@gestock.com', '315 400 3333',
       '$2b$10$lY2sWSzpCS4fhsr9OLAazOBYGfKiiE9KNE7PRhJA3ZW.gnhTe2G/e',
       'Activo', r.id, e.id
FROM roles r, empresas e
WHERE r.nombre = 'Operario' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id)
SELECT 'Andrés', 'Gómez', 'tecnico@gestock.com', '315 400 4444',
       '$2b$10$jQdVNWobYkT0GJGT45iXWuo6JBv4LJF0frk3CPWEK7814I0AggvV2',
       'Activo', r.id, e.id
FROM roles r, empresas e
WHERE r.nombre = 'Técnico de Mantenimiento' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id)
SELECT 'Laura', 'Martínez', 'auditor@gestock.com', '315 400 5555',
       '$2b$10$te.aYBmfzv/5uLUz3m6PROERjSWYTeHs1n0QkAfqaSc8VObvS800a',
       'Activo', r.id, e.id
FROM roles r, empresas e
WHERE r.nombre = 'Auditor' AND e.nit = '900123456-7'
ON CONFLICT (email) DO NOTHING;

-- Permisos por rol -----------------------------------------------------

-- Administrador: TODOS los permisos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

-- Supervisor
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Supervisor'
  AND p.codigo IN (
    'dashboard.view',
    'productos.view', 'productos.create', 'productos.edit', 'productos.delete',
    'categorias.view', 'categorias.create', 'categorias.edit',
    'bodegas.view', 'bodegas.create', 'bodegas.edit',
    'inventario.view', 'inventario.registrar', 'movimientos.view',
    'recepcion.view', 'recepcion.create', 'recepcion.edit',
    'historial.view',
    'reportes.view', 'reportes.exportar',
    'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver',
    'notificaciones.view',
    'usuarios.view', 'usuarios.password'
  )
ON CONFLICT DO NOTHING;

-- Operario
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Operario'
  AND p.codigo IN (
    'inventario.view',
    'productos.view', 'productos.create',
    'categorias.view',
    'bodegas.view',
    'movimientos.view',
    'recepcion.view', 'recepcion.create',
    'incidencias.view', 'incidencias.create',
    'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

-- Técnico de Mantenimiento: SOLO funciones de mantenimiento (programación e incidencias).
-- Primero se retiran los permisos ajenos a su función (idempotente).
DELETE FROM rol_permiso rp
USING roles r, permisos p
WHERE rp.rol_id = r.id AND rp.permiso_id = p.id
  AND r.nombre = 'Técnico de Mantenimiento'
  AND p.codigo IN (
    'dashboard.view', 'productos.view', 'bodegas.view',
    'movimientos.view', 'historial.view'
  );

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Técnico de Mantenimiento'
  AND p.codigo IN (
    'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver',
    'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

-- Auditor (solo lectura)
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Auditor'
  AND p.codigo IN (
    'dashboard.view',
    'empresas.view',
    'usuarios.view',
    'roles.view', 'permisos.view',
    'productos.view', 'productos.create',
    'categorias.view',
    'bodegas.view',
    'inventario.view', 'movimientos.view',
    'recepcion.view',
    'historial.view',
    'auditoria.view',
    'reportes.view', 'reportes.exportar',
    'sesiones.view',
    'configuracion.view',
    'notificaciones.view'
  )
ON CONFLICT DO NOTHING;

-- Roles con acceso a usuarios/roles pueden ver la configuración del sistema.
-- Auditor ya posee usuarios.view/roles.view; aquí se asegura que también vea Configuración.

-- Configuración del sistema -------------------------------------------
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
  ('notificacionesEmail', 'true',   'Enviar notificaciones por correo electrónico.'),
  ('resumenSemanal',      'true',   'Enviar resumen semanal de actividad.'),
  ('seguridadActiva',     'true',   'Activar medidas de seguridad del sistema.'),
  ('dosFactores',         'false',  'Autenticación de dos factores.'),
  ('tiempoSesion',        '480',    'Tiempo máximo de sesión en minutos.'),
  ('expiracionPassword',  '90',     'Días para expiración de contraseña.'),
  ('copiasSeguridad',     'true',   'Realizar copias de seguridad.'),
  ('backupAutomatico',    'true',   'Copias de seguridad automáticas.'),
  ('frecuenciaBackup',    'semanal','Frecuencia de copias de seguridad.')
ON CONFLICT (clave) DO NOTHING;

-- Datos demo: categorías -----------------------------------------------
INSERT INTO categorias (empresa_id, nombre, descripcion) VALUES
  (1, 'Electrónica',   'Dispositivos y accesorios electrónicos.'),
  (1, 'Ropa y Calzado','Prendas de vestir y calzado.'),
  (1, 'Alimentos',     'Productos de consumo y perecederos.'),
  (1, 'Herramientas',  'Herramientas manuales y eléctricas.'),
  (1, 'Papelería',     'Artículos de oficina y papelería.'),
  (1, 'Seguridad',     'Elementos de protección y seguridad industrial.')
ON CONFLICT (empresa_id, nombre) DO NOTHING;

-- Datos demo: bodegas ---------------------------------------------------
INSERT INTO bodegas (empresa_id, nombre, codigo, ciudad, direccion, responsable, telefono, capacidad, ocupado, activa) VALUES
  (1, 'Bodega Central', 'BOD-01', 'Bogotá', 'Av. El Dorado # 68-90', 'Carlos Rodríguez', '+57 601 123 4567', 5000, 0, TRUE),
  (1, 'Bodega Sur',     'BOD-02', 'Bogotá', 'Calle 54 Sur # 12-30', 'María Fernández',  '+57 601 234 5678', 3000, 0, TRUE),
  (1, 'Bodega Norte',   'BOD-03', 'Medellín', 'Carrera 46 # 10-20', 'Juan Pérez',       '+57 604 345 6789', 4000, 0, TRUE)
ON CONFLICT (empresa_id, nombre) DO NOTHING;

-- Datos demo: productos -------------------------------------------------
INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'ELC-001', 'Portátil Empresarial', 'Laptop 14" 16GB RAM', c.id, b.id, 3200000, 2600000, 45, 10, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Electrónica' AND b.codigo = 'BOD-01'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'ELC-002', 'Monitor 24"', 'Monitor LED Full HD', c.id, b.id, 900000, 700000, 30, 8, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Electrónica' AND b.codigo = 'BOD-01'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'RPC-001', 'Camisa Manga Larga', 'Camisa corporativa talla M', c.id, b.id, 60000, 40000, 150, 25, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Ropa y Calzado' AND b.codigo = 'BOD-02'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'ALI-001', 'Café Molido 500g', 'Café de origen 500 gramos', c.id, b.id, 15000, 10000, 200, 30, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Alimentos' AND b.codigo = 'BOD-02'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'HER-001', 'Taladro 650W', 'Taladro percutor 650W', c.id, b.id, 250000, 180000, 20, 5, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Herramientas' AND b.codigo = 'BOD-03'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'PAP-001', 'Resma Papel Carta', 'Resma 500 hojas papel carta', c.id, b.id, 12000, 8000, 3, 15, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Papelería' AND b.codigo = 'BOD-03'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado)
SELECT 1, 'SEG-001', 'Casco de Seguridad', 'Casco industrial con arnés', c.id, b.id, 45000, 30000, 5, 10, 'Activo'
FROM categorias c, bodegas b WHERE c.nombre = 'Seguridad' AND b.codigo = 'BOD-01'
ON CONFLICT (empresa_id, codigo) DO NOTHING;

-- Datos demo: movimientos iniciales -------------------------------------
INSERT INTO movimientos_inventario (empresa_id, producto_id, bodega_id, tipo, cantidad, motivo, responsable, estado, usuario_id)
SELECT 1, p.id, p.bodega_id, 'ENTRADA', 50, 'Compra inicial', 'María Fernández', 'Validado', u.id
FROM productos p, usuarios u
WHERE p.codigo = 'ELC-001' AND u.email = 'supervisor@gestock.com'
  AND NOT EXISTS (SELECT 1 FROM movimientos_inventario m2 WHERE m2.producto_id = p.id AND m2.motivo = 'Compra inicial');

INSERT INTO movimientos_inventario (empresa_id, producto_id, bodega_id, tipo, cantidad, motivo, responsable, estado, usuario_id)
SELECT 1, p.id, p.bodega_id, 'ENTRADA', 30, 'Compra inicial', 'María Fernández', 'Validado', u.id
FROM productos p, usuarios u
WHERE p.codigo = 'ELC-002' AND u.email = 'supervisor@gestock.com'
  AND NOT EXISTS (SELECT 1 FROM movimientos_inventario m2 WHERE m2.producto_id = p.id AND m2.motivo = 'Compra inicial');

-- Ajuste de ocupación de bodegas según inventario -----------------------
UPDATE bodegas b SET ocupado = LEAST(b.capacidad, (SELECT COALESCE(SUM(p.stock), 0) FROM productos p WHERE p.bodega_id = b.id));