-- ============================================
-- GESTOCK - 07_seguridad_passwords.sql
-- Seguridad de contraseñas:
--   * Permiso dedicado para que Administrador y
--     Supervisor puedan cambiar contraseñas de
--     otros usuarios.
--   * Hash de códigos de recuperación en la BD.
-- Idempotente: puede ejecutarse varias veces.
-- ============================================

-- 1) Ampliar el campo de código para almacenar el hash SHA-256
--    de los códigos de recuperación (64 caracteres hex).
ALTER TABLE restablecimientos_contrasena ALTER COLUMN codigo TYPE VARCHAR(64);

-- 2) Nuevo permiso: cambiar contraseñas de usuarios.
INSERT INTO permisos (nombre, codigo, descripcion, modulo) VALUES
  ('Cambiar contraseñas de usuarios', 'usuarios.password',
   'Cambiar la contraseña de otros usuarios.', 'Usuarios')
ON CONFLICT (codigo) DO NOTHING;

-- 3) Otorgar el permiso a Administrador (que recibe todos los permisos).
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Administrador' AND p.codigo = 'usuarios.password'
ON CONFLICT DO NOTHING;

-- 4) Otorgar el permiso a Supervisor.
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Supervisor' AND p.codigo = 'usuarios.password'
ON CONFLICT DO NOTHING;

-- 5) El Supervisor ahora puede consultar usuarios (acceso a la página).
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Supervisor' AND p.codigo = 'usuarios.view'
ON CONFLICT DO NOTHING;