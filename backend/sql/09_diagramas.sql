-- ============================================
-- GESTOCK - 09_diagramas.sql
-- Tabla de diagramas de arquitectura (imagenes en BYTEA), permiso y asignacion.
-- ============================================

CREATE TABLE IF NOT EXISTS diagramas (
  id              SERIAL PRIMARY KEY,
  numero          INT NOT NULL UNIQUE,
  nombre          VARCHAR(120) NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  categoria       VARCHAR(60) NOT NULL,
  descripcion     TEXT NOT NULL DEFAULT '',
  imagen          BYTEA NOT NULL,
  content_type    VARCHAR(40) NOT NULL DEFAULT 'image/png',
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO permisos (nombre, codigo, descripcion, modulo) VALUES
  ('Ver diagramas', 'diagramas.view', 'Consultar los diagramas de arquitectura del sistema.', 'Diagramas')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre IN ('Administrador', 'Supervisor', 'Auditor')
  AND p.codigo = 'diagramas.view'
ON CONFLICT DO NOTHING;