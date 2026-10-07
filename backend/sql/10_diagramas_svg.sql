-- ============================================
-- GESTOCK - 10_diagramas_svg.sql
-- Los diagramas pasan de imagenes PNG a SVG generado desde el codigo.
-- ============================================

ALTER TABLE diagramas ADD COLUMN IF NOT EXISTS svg TEXT;
ALTER TABLE diagramas ADD COLUMN IF NOT EXISTS ancho INT NOT NULL DEFAULT 1600;
ALTER TABLE diagramas ADD COLUMN IF NOT EXISTS alto INT NOT NULL DEFAULT 1200;
ALTER TABLE diagramas ALTER COLUMN imagen DROP NOT NULL;