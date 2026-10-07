\encoding UTF8
SELECT r.id, r.nombre, string_agg(p.codigo, ', ' ORDER BY p.codigo) AS permisos
FROM roles r
JOIN rol_permiso rp ON rp.rol_id = r.id
JOIN permisos p ON p.id = rp.permiso_id
WHERE r.id = 5
GROUP BY r.id, r.nombre;