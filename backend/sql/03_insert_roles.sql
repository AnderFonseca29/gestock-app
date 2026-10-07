-- ============================================
-- GESTOCK - 03_insert_roles.sql
-- Roles del sistema (sin duplicados).
-- ============================================

INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema y gestión de usuarios, roles y permisos.'),
  ('Supervisor', 'Gestiona inventario, productos, bodegas, recepciones y reportes.'),
  ('Operario', 'Registra movimientos de inventario y reporta incidencias.'),
  ('Técnico de Mantenimiento', 'Programa y ejecuta mantenimientos, gestiona incidencias técnicas.'),
  ('Auditor', 'Consulta de solo lectura para auditoría y verificación de datos.')
ON CONFLICT (nombre) DO NOTHING;