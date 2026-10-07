-- =====================================================================
-- 08_multitenant.sql
-- Aislamiento de datos por empresa (multitenant).
-- Cada empresa tendrá sus propios productos, categorías, bodegas,
-- movimientos, incidencias, mantenimientos y recepciones.
-- =====================================================================

-- 1) Agregar columna empresa_id ---------------------------------------
ALTER TABLE categorias             ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE bodegas                ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE productos              ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE movimientos_inventario ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE incidencias            ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE mantenimientos         ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE recepciones            ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE sesiones               ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE SET NULL;

-- 2) Unicidad ahora es por empresa -------------------------------------
-- Idempotente: admite re-ejecución y bases nuevas (02 ya usa unicidad simple).
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_nombre_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'categorias'::regclass AND conname = 'categorias_empresa_nombre_key') THEN
    ALTER TABLE categorias ADD CONSTRAINT categorias_empresa_nombre_key UNIQUE (empresa_id, nombre);
  END IF;
END $$;

ALTER TABLE bodegas DROP CONSTRAINT IF EXISTS bodegas_nombre_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'bodegas'::regclass AND conname = 'bodegas_empresa_nombre_key') THEN
    ALTER TABLE bodegas ADD CONSTRAINT bodegas_empresa_nombre_key UNIQUE (empresa_id, nombre);
  END IF;
END $$;
ALTER TABLE bodegas DROP CONSTRAINT IF EXISTS bodegas_codigo_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'bodegas'::regclass AND conname = 'bodegas_empresa_codigo_key') THEN
    ALTER TABLE bodegas ADD CONSTRAINT bodegas_empresa_codigo_key UNIQUE (empresa_id, codigo);
  END IF;
END $$;

ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_codigo_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'productos'::regclass AND conname = 'productos_empresa_codigo_key') THEN
    ALTER TABLE productos ADD CONSTRAINT productos_empresa_codigo_key UNIQUE (empresa_id, codigo);
  END IF;
END $$;

ALTER TABLE recepciones DROP CONSTRAINT IF EXISTS recepciones_numero_documento_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'recepciones'::regclass AND conname = 'recepciones_empresa_numero_key') THEN
    ALTER TABLE recepciones ADD CONSTRAINT recepciones_empresa_numero_key UNIQUE (empresa_id, numero_documento);
  END IF;
END $$;

-- 3) Reasignar registros existentes a la empresa semilla (id 1) --------
UPDATE categorias SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE bodegas SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE productos SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE movimientos_inventario SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE incidencias SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE mantenimientos SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE recepciones SET empresa_id = 1 WHERE empresa_id IS NULL;

UPDATE sesiones s SET empresa_id = u.empresa_id
  FROM usuarios u
  WHERE s.usuario_id = u.id AND s.empresa_id IS NULL;

-- 4) NOT NULL tras el backfill ------------------------------------------
ALTER TABLE categorias ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE bodegas ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE productos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE movimientos_inventario ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE incidencias ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE mantenimientos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE recepciones ALTER COLUMN empresa_id SET NOT NULL;

-- 5) Índices por empresa --------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_categorias_empresa            ON categorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_bodegas_empresa               ON bodegas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa             ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa           ON movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_empresa           ON incidencias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_empresa        ON mantenimientos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_recepciones_empresa           ON recepciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_empresa              ON sesiones(empresa_id);