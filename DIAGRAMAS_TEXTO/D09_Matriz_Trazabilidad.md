# D09 · MATRIZ DE TRAZABILIDAD

**Tipo:** Generales

## Qué es
La comprobación de que cada diagrama coincide con el código real del proyecto.

## Flujo
Un verificador automático compara:
1. Número de rutas del código = número que dice el diagrama.
2. Cada error guardado en el código existe en el diagrama con su código correcto.
3. Cada tabla usada está en el esquema de la base de datos.
4. Roles y permisos del RBAC están completos.

## Resultado
- **311 de 311 comprobaciones correctas · 0 fallos.**

---
*Verificado con `npm run diagramas:verify`.*