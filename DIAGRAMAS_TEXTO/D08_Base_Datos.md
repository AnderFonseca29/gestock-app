# D08 · BASE DE DATOS

**Tipo:** Generales

## Qué es
Las 18 tablas de la base de datos `Gestock_db`: empresas, usuarios, roles, permisos, productos, categorías, bodegas, movimientos, recepciones, incidencias, mantenimientos, auditorías, sesiones, notificaciones, configuración, restablecimientos de contraseña, y las tablas de relación.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente nunca toca la base de datos.
2. El cliente le pide al servidor, y el servidor guarda o lee de la base.
3. El servidor responde al cliente con los datos o el error.

## Reglas importantes
- El **stock nunca queda negativo**: si sacan más de lo que hay, el sistema lo deja en cero.
- La bodega **nunca pasa de su capacidad**: el sistema recorta el espacio ocupado.
- Los datos **se guardan en el disco**: se probó que siguen ahí aunque se apague y encienda el servidor.

## Relaciones clave
- Usuarios → empresas; usuarios → roles.
- Productos → categorías y bodegas.
- Movimientos y recepciones → productos y bodegas.
- Auditorías y sesiones → usuarios.

---
*Verificado: prueba de persistencia (datos sobrevivieron al reinicio del servidor).*