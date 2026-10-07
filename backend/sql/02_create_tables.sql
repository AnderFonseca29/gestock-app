-- ============================================
-- GESTOCK - 02_create_tables.sql
-- Define todas las tablas del sistema.
-- ============================================

-- Empresas -------------------------------------------------------------
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

-- Roles ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(80) NOT NULL UNIQUE,
  descripcion    VARCHAR(255),
  estado         VARCHAR(15) NOT NULL DEFAULT 'Activo'
                 CHECK (estado IN ('Activo', 'Inactivo')),
  fecha_creacion TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Permisos -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permisos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  codigo      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  modulo      VARCHAR(60)  NOT NULL
);

-- Relación rol <-> permiso ---------------------------------------------
CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id     INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- Usuarios -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(150) NOT NULL,
  apellido            VARCHAR(150) NOT NULL,
  email               VARCHAR(200) NOT NULL UNIQUE,
  telefono            VARCHAR(30),
  password_hash       VARCHAR(100) NOT NULL,
  estado              VARCHAR(15)  NOT NULL DEFAULT 'Activo'
                      CHECK (estado IN ('Activo', 'Inactivo')),
  rol_id              INT NOT NULL REFERENCES roles(id),
  empresa_id          INT REFERENCES empresas(id) ON DELETE SET NULL,
  ultimo_acceso       TIMESTAMP,
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Categorías -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre      VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255),
  estado      VARCHAR(15)  NOT NULL DEFAULT 'Activo'
              CHECK (estado IN ('Activo', 'Inactivo')),
  UNIQUE (nombre)
);

-- Bodegas --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bodegas (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre      VARCHAR(150) NOT NULL,
  codigo      VARCHAR(20)  NOT NULL,
  ciudad      VARCHAR(100),
  direccion   VARCHAR(255),
  responsable VARCHAR(150),
  telefono    VARCHAR(30),
  capacidad   INT NOT NULL DEFAULT 0,
  ocupado     INT NOT NULL DEFAULT 0,
  activa      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (nombre),
  UNIQUE (codigo)
);

-- Productos ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id              SERIAL PRIMARY KEY,
  empresa_id      INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo          VARCHAR(50)  NOT NULL,
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
  fecha_creacion  TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (codigo)
);

-- Movimientos de inventario -------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id           SERIAL PRIMARY KEY,
  empresa_id   INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id  INT REFERENCES productos(id) ON DELETE SET NULL,
  bodega_id    INT REFERENCES bodegas(id) ON DELETE SET NULL,
  tipo         VARCHAR(20) NOT NULL
               CHECK (tipo IN ('ENTRADA', 'SALIDA', 'TRANSFERENCIA')),
  cantidad     INT NOT NULL CHECK (cantidad > 0),
  motivo       VARCHAR(100) NOT NULL,
  responsable  VARCHAR(150) NOT NULL,
  observaciones VARCHAR(255),
  estado       VARCHAR(20) NOT NULL DEFAULT 'Validado'
               CHECK (estado IN ('Validado', 'Discrepancia')),
  usuario_id   INT REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recepción de mercancías ---------------------------------------------
CREATE TABLE IF NOT EXISTS recepciones (
  id               SERIAL PRIMARY KEY,
  empresa_id       INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_documento VARCHAR(50)  NOT NULL,
  proveedor        VARCHAR(200) NOT NULL,
  fecha_recepcion  TIMESTAMP    NOT NULL DEFAULT NOW(),
  usuario_id       INT NOT NULL REFERENCES usuarios(id),
  bodega_id        INT REFERENCES bodegas(id) ON DELETE SET NULL,
  estado           VARCHAR(20)  NOT NULL DEFAULT 'En Proceso'
                   CHECK (estado IN ('En Proceso', 'Validado', 'Discrepancia')),
  observaciones    VARCHAR(255),
  UNIQUE (numero_documento)
);

CREATE TABLE IF NOT EXISTS recepcion_detalle (
  id             SERIAL PRIMARY KEY,
  recepcion_id   INT NOT NULL REFERENCES recepciones(id) ON DELETE CASCADE,
  producto_id    INT NOT NULL REFERENCES productos(id),
  cantidad       INT NOT NULL CHECK (cantidad > 0),
  costo_unitario NUMERIC(14,2),
  UNIQUE (recepcion_id, producto_id)
);

-- Incidencias ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidencias (
  id                SERIAL PRIMARY KEY,
  empresa_id        INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo            VARCHAR(150) NOT NULL,
  descripcion       TEXT NOT NULL,
  prioridad         VARCHAR(20) NOT NULL
                    CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  estado            VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente', 'En Revisión', 'Resuelto')),
  reportado_por     INT NOT NULL REFERENCES usuarios(id),
  fecha             TIMESTAMP NOT NULL DEFAULT NOW(),
  resuelto_por      INT REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_resolucion  TIMESTAMP
);

-- Mantenimientos -------------------------------------------------------
CREATE TABLE IF NOT EXISTS mantenimientos (
  id                SERIAL PRIMARY KEY,
  empresa_id        INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  equipo            VARCHAR(150) NOT NULL,
  tipo              VARCHAR(20) NOT NULL
                    CHECK (tipo IN ('Preventivo', 'Correctivo', 'Predictivo')),
  fecha_programada  DATE NOT NULL,
  estado            VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado')),
  usuario_id        INT REFERENCES usuarios(id) ON DELETE SET NULL,
  descripcion       VARCHAR(500)
);

-- Auditoría ------------------------------------------------------------
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

-- Sesiones -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones (
  id            SERIAL PRIMARY KEY,
  usuario_id    INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id    INT REFERENCES empresas(id) ON DELETE SET NULL,
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

-- Notificaciones -------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo      VARCHAR(150) NOT NULL,
  mensaje     TEXT NOT NULL,
  tipo        VARCHAR(30) NOT NULL DEFAULT 'info',
  leida       BOOLEAN NOT NULL DEFAULT FALSE,
  fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Configuración del sistema -------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave               VARCHAR(60) PRIMARY KEY,
  valor               TEXT NOT NULL,
  descripcion         VARCHAR(255),
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes ------------------------------------
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

-- Restablecimiento de contraseña ---------------------------------------
CREATE TABLE IF NOT EXISTS restablecimientos_contrasena (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo      VARCHAR(64) NOT NULL,
  expira_en   TIMESTAMP NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restablecimientos_usuario ON restablecimientos_contrasena(usuario_id, usado);