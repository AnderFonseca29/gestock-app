-- ============================================
-- GESTOCK - 01_create_database.sql
-- Crea la base de datos principal.
-- Ejecutar con psql como superusuario:
--   psql -U postgres -f 01_create_database.sql
-- ============================================

CREATE DATABASE "Gestock_db"
  WITH ENCODING 'UTF8'
       LC_COLLATE = 'es_CO.UTF-8'
       LC_CTYPE = 'es_CO.UTF-8'
       TEMPLATE = template0;

COMMENT ON DATABASE "Gestock_db" IS 'Base de datos del sistema de gestión de inventario GESTOCK';