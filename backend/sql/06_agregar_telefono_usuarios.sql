-- ============================================
-- GESTOCK - 06_agregar_telefono_usuarios.sql
-- Agrega el teléfono móvil al usuario para
-- la recuperación de contraseña por SMS.
-- ============================================

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);

-- Teléfonos de los usuarios de prueba (se asignan solo si aún no tienen uno).
UPDATE usuarios SET telefono = '315 400 1111' WHERE email = 'admin@gestock.com'      AND telefono IS NULL;
UPDATE usuarios SET telefono = '315 400 2222' WHERE email = 'supervisor@gestock.com' AND telefono IS NULL;
UPDATE usuarios SET telefono = '315 400 3333' WHERE email = 'operario@gestock.com'   AND telefono IS NULL;
UPDATE usuarios SET telefono = '315 400 4444' WHERE email = 'tecnico@gestock.com'    AND telefono IS NULL;
UPDATE usuarios SET telefono = '315 400 5555' WHERE email = 'auditor@gestock.com'    AND telefono IS NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_telefono ON usuarios(telefono);