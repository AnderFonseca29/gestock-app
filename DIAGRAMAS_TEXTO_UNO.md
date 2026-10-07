# GESTOCK · LOS 34 DIAGRAMAS EN UN SOLO TEXTO (divididos por diagrama)

Explicación en español básico, cada diagrama con su flujo CLIENTE → MID → CLIENTE y todos sus mensajes de error.
==========================================================================================
==========================================================================================
D01_Portada
==========================================================================================
# D01 · PORTADA

**Tipo:** Generales

## Qué es
La hoja de presentación del conjunto: el proyecto GESTOCK y la lista de los 34 diagramas.

## Flujo CLIENTE → MID → CLIENTE
No interviene el servidor. Es solo información que presenta el sistema de diagramas.

## Errores
No aplica (no consulta datos).

---
*Verificado: parte de los 34 diagramas confirmados en la base de datos (311/311 comprobaciones correctas).*

==========================================================================================
==========================================================================================
D02_Arquitectura_General
==========================================================================================
# D02 · ARQUITECTURA GENERAL

**Tipo:** Generales

## Qué es
La vista de las 3 capas del sistema: página web (Angular), servidor (Node/Express) y base de datos (PostgreSQL).

## Flujo CLIENTE → MID → CLIENTE
1. El cliente (la página Angular) pide datos con su código de seguridad.
2. El MID (servidor Express) atiende la petición y consulta la base de datos.
3. El cliente recibe los datos en formato JSON y los muestra.

## Errores
- Si el servidor está apagado → "No se pudo completar la solicitud."
- Errores generales: datos malos, sin sesión, sin permiso, o error interno del servidor.

---
*Verificado: salud del servidor OK y pruebas de pantalla completas.*

==========================================================================================
==========================================================================================
D03_MID_Detalle
==========================================================================================
# D03 · MID DETALLE

**Tipo:** Generales

## Qué es
La capa intermedia (MID): lo que atraviesa cada petición y lo que nunca vuelve a tocar.

## Flujo CLIENTE → MID → CLIENTE
La petición pasa por este orden:
1. Límite de solicitudes (500 cada 15 minutos).
2. Revisión de los datos enviados (Zod).
3. Revisión del código de sesión (JWT).
4. Revisión del permiso del usuario.
5. Controlador → base de datos.
6. Respuesta directa al cliente.

## Errores
- Pasó el límite de solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- Cuando la respuesta vuelve, **no pasa de nuevo por el servidor**: va directo al cliente.

---
*Verificado: la cadena de pasos coincide con el código del servidor.*

==========================================================================================
==========================================================================================
D04_Autenticacion_y_Sesion
==========================================================================================
# D04 · AUTENTICACIÓN Y SESIÓN

**Tipo:** Generales

## Qué es
Entrar al sistema, crear el código de seguridad (JWT, dura 8 horas) y controlar las sesiones abiertas.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente envía correo y contraseña.
2. El servidor compara los datos, exige que la cuenta y el rol estén activos, crea el código y abre la sesión.
3. El cliente recibe el código, su usuario y sus permisos.

## Errores
- Datos mal puestos → "Los datos enviados no son válidos."
- Muchos intentos seguidos (máximo 5) → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Correo o contraseña mal → "Las credenciales ingresadas no son válidas."
- Usuario de otra empresa → "El usuario no pertenece a esa empresa."
- Cuenta desactivada → "Tu cuenta está inactiva. Contacta al administrador."
- Rol desactivado → "El rol asignado a tu cuenta está inactivo. Contacta al administrador."
- Código vencido → "Tu sesión ha expirado. Inicia sesión nuevamente."

---
*Verificado: pruebas de entrar/salir correctas en las suites E2E.*

==========================================================================================
==========================================================================================
D05_RBAC_Roles_Permisos
==========================================================================================
# D05 · RBAC — ROLES Y PERMISOS

**Tipo:** Generales

## Qué es
El mapa de roles (Administrador, Supervisor, Operario, Técnico, Auditor) y los permisos que protegen cada pantalla.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente entra y el servidor le entrega solo los permisos de su rol.
2. En cada pantalla, el servidor revisa de nuevo "¿este usuario puede entrar aquí?".
3. Si no puede, responde el error.
4. Si puede, devuelve los datos.

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."
- Además, los botones y páginas sin permiso ni siquiera se muestran.

## Reglas verificadas
- Cada rol tiene al menos un permiso.
- Cada permiso tiene al menos un rol dueño.
- El Administrador recibe todos los permisos.

---
*Verificado: revisión automática de roles y permisos correcta.*

==========================================================================================
==========================================================================================
D06_Patron_CRUD
==========================================================================================
# D06 · PATRÓN CRUD

**Tipo:** Generales

## Qué es
La secuencia base de crear, ver, editar y eliminar que usan casi todos los módulos.

## Flujo CLIENTE → MID → CLIENTE
- **Crear (POST):** el cliente envía los datos → el servidor los guarda y registra el cambio → "creado con éxito" (201).
- **Ver (GET):** el cliente pide la lista o un registro → el servidor responde los datos (200).
- **Editar (PUT):** el cliente envía los cambios → el servidor los guarda y registra → éxito (200).
- **Eliminar (DELETE):** el cliente pide borrar → el servidor borra y registra → "borrado" (200).

## Errores generales del patrón
- Datos malos → "Los datos enviados no son válidos." (400)
- Sin sesión → aviso de sesión (401)
- Sin permiso → "No tienes permisos para realizar esta acción." (403)
- No existe → "El ... no existe." (404)
- Repetido → "Ya existe un ..." (409)
- El registro está siendo usado → "No se puede eliminar porque está en uso." (409)

---
*Verificado: CRUD de usuarios, roles, productos, bodegas y categorías probados en las suites E2E.*

==========================================================================================
==========================================================================================
D07_Errores_Backend
==========================================================================================
# D07 · ERRORES DEL BACKEND

**Tipo:** Generales

## Qué es
Cómo el servidor clasifica todos los errores para dar mensajes claros en español.

## Flujo CLIENTE → MID → CLIENTE
1. Algo falla en cualquier parte.
2. El servidor atrapa el error, le pone un código y un mensaje.
3. El cliente recibe y muestra el mensaje en pantalla.

## Los 7 tipos de error
- **400** datos malos → "Los datos enviados no son válidos."
- **401** sin sesión → "No se proporcionó un token de acceso."
- **403** sin permiso → "No tienes permisos para realizar esta acción."
- **404** no existe → "El ... no existe."
- **409** repetido o en uso → "Ya existe un ..." / "No se puede eliminar porque está en uso."
- **429** demasiadas solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- **500** error interno → "Ocurrió un error inesperado en el servidor."

## Errores que vienen de la base de datos
- Campo obligatorio vacío → mensaje de datos no válidos.
- Valor repetido → "Ya existe un registro con esos datos."
- Tipo de dato incorrecto → mensaje de datos no válidos.

---
*Verificado: los 7 tipos de error se probaron en las suites E2E (401, 403, 404, 409 y 429 incluidos).*

==========================================================================================
==========================================================================================
D08_Base_Datos
==========================================================================================
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

==========================================================================================
==========================================================================================
D09_Matriz_Trazabilidad
==========================================================================================
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

==========================================================================================
==========================================================================================
D10_Controlador_Auth
==========================================================================================
# D10 · CONTROLADOR AUTH (7 rutas)

**Tipo:** Controladores

## Qué es
Entrar al sistema, ver el perfil, salir, cambiar la contraseña y recuperarla.
Rutas públicas (sin sesión): entrar (`/auth/login`) y recuperar (`/auth/recuperar`, `/auth/recuperar/validar`, `/auth/recuperar/restablecer`).

## Flujo CLIENTE → MID → CLIENTE
- **Entrar:** correo + contraseña → se comparan y se crea el código (8 h) y la sesión → recibe `{token, usuario, permisos}`.
- **Perfil:** envía su código → se revisa que siga sirviendo → recibe sus datos.
- **Salir:** envía su código → el servidor cierra la sesión → éxito.
- **Cambiar clave:** clave actual + nueva → se compara y se reemplaza → éxito.
- **Recuperar:** teléfono → el servidor crea un código de 6 números (15 min) y lo envía por mensaje → se valida el código y se pone la nueva clave → éxito.

## Errores
- Datos malos → "Los datos enviados no son válidos."
- Muchos intentos al entrar → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Correo o clave mal → "Las credenciales ingresadas no son válidas."
- Sin código → "No se proporcionó un token de acceso."
- Código vencido → "Tu sesión ha expirado. Inicia sesión nuevamente."
- Sesión cerrada → "Tu sesión fue cerrada. Inicia sesión nuevamente."
- Usuario borrado → "El usuario ya no existe en el sistema."
- Clave actual mal → "La contraseña actual no es correcta."
- Código de recuperación mal o vencido → "El código ingresado no es válido o ha expirado."
- Muchas solicitudes de recuperación → "Has superado el máximo de solicitudes de recuperación para esta cuenta. Espera 15 minutos."

---
*Verificado: pruebas de contraseñas 22/22, recuperación 6/6 y mensaje SMS de punta a punta.*

==========================================================================================
==========================================================================================
D11_Controlador_Usuario
==========================================================================================
# D11 · CONTROLADOR USUARIO (8 rutas)

**Tipo:** Controladores

## Qué es
Administrar usuarios: ver la lista o uno, crear, editar, cambiar estado, cambiar rol, cambiar clave y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista (con filtros) o detalle → datos (200).
- **Crear:** datos del usuario con su clave → la clave se guarda encriptada y se registra el cambio → 201.
- **Editar / estado / rol:** cambios → se guardan → 200.
- **Cambiar clave:** clave nueva → se guarda y **se cierran las sesiones de ese usuario** → 200.
- **Borrar:** se borra y se registra → 200.

## Errores
- No existe → "El usuario no existe."
- Correo repetido → "Ya existe un usuario con ese correo electrónico."
- Rol inexistente → "El rol seleccionado no existe."
- Cambiar su propia clave desde esta pantalla → "Para cambiar tu propia contraseña usa la opción de tu perfil."
- Borrarse a sí mismo → "No puedes eliminar tu propio usuario."

---
*Verificado: CRUD de usuarios y prohibiciones (400 y 403) en las suites E2E.*

==========================================================================================
==========================================================================================
D12_Controlador_Rol
==========================================================================================
# D12 · CONTROLADOR ROL (8 rutas)

**Tipo:** Controladores

## Qué es
Administrar los roles del sistema y los permisos de cada uno: ver, crear, editar, cambiar estado, asignar permisos y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista completa o lista básica (o uno por id) → datos (200).
- **Crear:** nombre + permisos → se guarda → 201.
- **Editar / estado / permisos:** cambios → se guardan (los permisos se reemplazan completos) → 200.
- **Borrar:** se borra → 200.

## Errores
- Nombre repetido → "Ya existe un rol con ese nombre."
- No existe → "El rol no existe."
- Rol que tiene usuarios asignados → "No se puede eliminar un rol que tiene usuarios asignados."

---
*Verificado: gestión de roles y asignación de permisos en las suites E2E.*

==========================================================================================
==========================================================================================
D13_Controlador_Permiso
==========================================================================================
# D13 · CONTROLADOR PERMISO (2 rutas)

**Tipo:** Controladores

## Qué es
Ver el catálogo de permisos para poder asignarlos a los roles.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista completa de permisos o la de un módulo.
2. El servidor revisa el permiso de lectura (`permisos.view`).
3. Devuelve el catálogo (200).

## Errores
- Sin sesión → aviso de sesión (401).
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: el catálogo se muestra en la pantalla de Roles y Usuarios.*

==========================================================================================
==========================================================================================
D14_Controlador_Empresa
==========================================================================================
# D14 · CONTROLADOR EMPRESA (6 rutas)

**Tipo:** Controladores

## Qué es
Administrar empresas: ver, cambiar de empresa, crear una empresa con su administrador, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Cambiar de empresa:** el cliente elige otra empresa y envía correo + contraseña → el servidor valida y mueve la sesión a esa empresa → 200.
- **Crear empresa con su admin:** el cliente envía los datos, el correo y la clave del administrador → el servidor crea empresa, rol y administrador todo junto (transacción) → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- Sesión no reconocida → "No se pudo identificar la sesión actual."
- No existe → "La empresa no existe."
- Empresa inactiva → "La empresa está inactiva. No puedes seleccionarla."
- NIT repetido → "Ya existe una empresa con ese NIT."
- Sin rol Administrador al crear → "No existe el rol Administrador en el sistema."

## Nota
Al borrar una empresa, sus usuarios y sesiones pueden quedar sin empresa (quedan huérfanos). Se recomendó corregirlo.

---
*Verificado: suite multientidad 41/41 (crear empresa, seleccionar, cambiar de empresa y datos aislados).*

==========================================================================================
==========================================================================================
D15_Controlador_Categoria
==========================================================================================
# D15 · CONTROLADOR CATEGORÍA (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar las categorías de productos: ver, crear, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** el cliente envía el nombre → se guarda y se registra el cambio → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra y se registra → 200.

## Errores
- No existe → "La categoría no existe."
- Nombre repetido → "Ya existe una categoría con ese nombre."
- Categoría que tiene productos → "No se puede eliminar porque está siendo utilizada." (409)

---
*Verificado: creación de categoría por pantalla y por API, con persistencia.*

==========================================================================================
==========================================================================================
D16_Controlador_Bodega
==========================================================================================
# D16 · CONTROLADOR BODEGA (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar las bodegas (lugares donde se guarda el inventario): ver, crear, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** datos de la bodega → se guardan → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.
- Al recibir o sacar mercancía, el servidor recalcula el espacio ocupado **sin pasarse de la capacidad** (LEAST de la capacidad, nunca negativo).

## Errores
- No existe → "La bodega no existe."
- Código repetido → "Ya existe una bodega con ese código."

---
*Verificado: creación de bodegas por pantalla y por API, con persistencia.*

==========================================================================================
==========================================================================================
D17_Controlador_Producto
==========================================================================================
# D17 · CONTROLADOR PRODUCTO (7 rutas)

**Tipo:** Controladores

## Qué es
Administrar los productos: ver lista y detalle, ver los de stock bajo, crear, editar, cambiar estado y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista, detalle o stock bajo → datos (200).
- **Crear:** datos del producto → se guardan → 201.
- **Editar / estado:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "El producto no existe."
- Código repetido → "Ya existe un producto con ese código."
- Producto con movimientos o recepciones → "No se puede eliminar porque está siendo utilizado." (409)

## Regla
El stock del producto se ajusta con cada movimiento y **nunca queda negativo**.

---
*Verificado: CRUD de productos y prueba de persistencia (producto creado por API sigue tras reiniciar el servidor).*

==========================================================================================
==========================================================================================
D18_Controlador_Movimiento
==========================================================================================
# D18 · CONTROLADOR MOVIMIENTO (4 rutas)

**Tipo:** Controladores

## Qué es
Registrar las entradas, salidas y transferencias del inventario, y ver el histórico.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista con filtros (búsqueda, tipo, estado, desde, hasta) con límite de 500 → datos con totales (200).
- **Registrar movimiento:** el cliente envía la cantidad y el tipo → el servidor guarda y ajusta el stock del producto y el espacio de la bodega → 201.
- **Borrar:** se borra (no devuelve el stock) → 200.

## Errores
- No existe → "El movimiento no existe."
- Producto inexistente → "El producto seleccionado no existe."
- Bodega inexistente → "La bodega seleccionada no existe."

## Regla clave
El stock **nunca queda negativo** ni la bodega pasa de su capacidad: el sistema lo recorta solo (no es un error).

---
*Verificado: movimiento de entrada por pantalla y persistencia del movimiento 25.*

==========================================================================================
==========================================================================================
D19_Controlador_Recepcion
==========================================================================================
# D19 · CONTROLADOR RECEPCIÓN (5 rutas)

**Tipo:** Controladores

## Qué es
Registrar la llegada de mercancía (cabecera + detalle de productos) y ver el historial logístico.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle (con su detalle de productos) → datos (200).
- **Crear:** cabecera + detalle juntos → se guarda todo → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "La recepción no existe."
- Número de documento repetido → "Ya existe una recepción con ese número de documento."
- Producto del detalle inexistente → "El producto seleccionado no existe."

## Permisos
- Leer: `recepcion.view` o `historial.view`.
- Crear/editar/borrar: `recepcion.create/edit/delete`.

---
*Verificado: recepción 24 con entrada de 13 unidades en las pruebas; historial logístico sin errores.*

==========================================================================================
==========================================================================================
D20_Controlador_Auditoria
==========================================================================================
# D20 · CONTROLADOR AUDITORÍA (2 rutas)

**Tipo:** Controladores

## Qué es
Ver el historial de auditoría: quién hizo qué y cuándo. Es de solo lectura.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista o un registro del historial.
2. El servidor revisa el permiso (`auditoria.view`).
3. Devuelve los registros (200).

## Errores
- No existe → "El registro de auditoría no existe."
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: lectura del historial con el rol correcto en las suites E2E.*

==========================================================================================
==========================================================================================
D21_Controlador_Incidencia
==========================================================================================
# D21 · CONTROLADOR INCIDENCIA (5 rutas)

**Tipo:** Controladores

## Qué es
Reportar y administrar incidencias (problemas o fallas). La prioridad solo puede ser Baja, Media, Alta o Crítica.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** el cliente envía título, descripción y prioridad → se valida la prioridad → se guarda y se registra el cambio → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "La incidencia no existe."
- Prioridad inválida → "Los datos enviados no son válidos."

---
*Verificado: incidencias creadas y listadas en las pruebas; pantalla auditada sin errores.*

==========================================================================================
==========================================================================================
D22_Controlador_Mantenimiento
==========================================================================================
# D22 · CONTROLADOR MANTENIMIENTO (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar los mantenimientos programados de los equipos o instalaciones.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** datos del mantenimiento → se guardan → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "El mantenimiento no existe."
- Datos malos → "Los datos enviados no son válidos."

---
*Verificado: pantalla de Programación cargada sin errores en las pruebas de landings.*

==========================================================================================
==========================================================================================
D23_Controlador_Sesion
==========================================================================================
# D23 · CONTROLADOR SESIÓN (3 rutas)

**Tipo:** Controladores

## Qué es
Ver las sesiones abiertas de un usuario (por ejemplo, en varios equipos) y poder cerrarlas.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista de sesiones activas → datos (200).
- **Cerrar otras:** el cliente pide cerrar todas menos la suya → el servidor las cierra → 200.
- **Cerrar una:** el cliente elige una sesión → se cierra → 200.

## Errores
- Su propia sesión no reconocida → "No se pudo identificar la sesión actual."
- Cerrar la sesión en la que está ahora → "No puedes cerrar la sesión actual desde aquí."
- No existe → "La sesión no existe."

---
*Verificado: control de sesiones, cierre de otras y salida en las suites E2E.*

==========================================================================================
==========================================================================================
D24_Controlador_Notificacion
==========================================================================================
# D24 · CONTROLADOR NOTIFICACIÓN (3 rutas)

**Tipo:** Controladores

## Qué es
Ver las notificaciones del usuario (por ejemplo, alertas del sistema) y marcarlas como leídas.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista de notificaciones.
2. El servidor revisa la sesión y el permiso.
3. Devuelve la lista (200).
4. El cliente marca una (PATCH) o todas (POST) como leídas → éxito (200).

## Errores
- Sin sesión reconocida → "No autenticado."
- No existe → "La notificación no existe."

---
*Verificado: la campana de notificaciones aparece en las pantallas sin errores de consola.*

==========================================================================================
==========================================================================================
D25_Controlador_Configuracion
==========================================================================================
# D25 · CONTROLADOR CONFIGURACIÓN (2 rutas)

**Tipo:** Controladores

## Qué es
Ver y guardar los valores de configuración del sistema (clave - valor).

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** el cliente pide la configuración → se devuelve la lista (200).
- **Guardar:** el cliente envía los valores → se guardan (si la clave ya existe, se actualiza) → 200.

## Errores
- Guardar sin enviar nada → "No se enviaron configuraciones para actualizar."
- Sin permiso de edición → "No tienes permisos para realizar esta acción."

---
*Verificado: guardar y leer configuración en las suites E2E.*

==========================================================================================
==========================================================================================
D26_Controlador_Dashboard
==========================================================================================
# D26 · CONTROLADOR DASHBOARD (1 ruta)

**Tipo:** Controladores

## Qué es
El panel de resumen (dashboard) con los números principales del negocio.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide el resumen.
2. El servidor revisa el permiso (`dashboard.view`).
3. Calcula: totales de productos, stock bajo, valor del inventario y las gráficas mensuales de entradas y salidas.
4. Devuelve todo (200).

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: el panel se carga correctamente para cada empresa en las pruebas.*

==========================================================================================
==========================================================================================
D27_Controlador_Reporte
==========================================================================================
# D27 · CONTROLADOR REPORTE (5 rutas)

**Tipo:** Controladores

## Qué es
Los reportes del sistema: inventario, movimientos, stock, auditorías e incidencias.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide uno de los 5 reportes (`/reportes/inventario`, `/movimientos`, `/stock`, `/auditorias`, `/incidencias`).
2. El servidor revisa el permiso (`reportes.view`).
3. Junta y ordena los datos (los agrupa).
4. Devuelve el reporte (200) para verlo o imprimirlo.

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: pantalla de Reporte y Análisis cargada sin errores en las pruebas.*

==========================================================================================
==========================================================================================
D28_Ciclo_Completo_Ida_Vuelta
==========================================================================================
# D28 · CICLO COMPLETO IDA Y VUELTA

**Tipo:** Ciclo y Respuesta

## Qué es
El viaje de una petición de principio a fin: la ida por el servidor (MID) y la vuelta directa al cliente.

## Flujo CLIENTE → MID → CLIENTE
**Ida:**
1. El cliente (Angular) pide por su servicio con el código de seguridad (JWT).
2. Pasa por: límite de solicitudes → revisión de datos → sesión → permiso.
3. El controlador procesa con la base de datos.

**Vuelta:**
4. La respuesta va **directa al cliente**: no vuelve a pasar por la revisión del servidor.
5. El cliente muestra los datos o el error.

## Errores
Cualquiera de los códigos del catálogo (400, 401, 403, 404, 409, 429, 500) con su mensaje en español.

---
*Verificado: todo el ciclo ida + vuelta se probó en las suites E2E.*

==========================================================================================
==========================================================================================
D29_Retorno_Sin_MID
==========================================================================================
# D29 · RETORNO SIN MID / FORMATO DE RESPUESTA

**Tipo:** Ciclo y Respuesta

## Qué es
Cómo responde el servidor siempre, para que el cliente lo entienda igual en todas las pantallas.

## Flujo CLIENTE → MID → CLIENTE
**Éxito:** el servidor responde con `{success: true, message: "...", data: {...}}`.
- La respuesta **no vuelve a pasar por el servidor**; va de una vez al cliente.
- El cliente toma la parte `data` y la muestra.

**Error:** el servidor responde con `{success: false, message: "..."}`.
- Si el error es de sesión (401), el cliente cierra la sesión y va a la pantalla de entrar.
- Cualquier otro error: el cliente muestra el mensaje en pantalla.

## Errores
- Sin sesión → mensajes de 401 y salida a la pantalla de entrar.
- Otros errores → mensajes de 400 a 500 ya definidos.

---
*Verificado: respuestas y toasts correctos en las suites E2E.*

==========================================================================================
==========================================================================================
D30_Rutas_Publicas_Sin_MID
==========================================================================================
# D30 · RUTAS PÚBLICAS SIN SESIÓN

**Tipo:** Servidor y Acceso

## Qué es
Las pocas pantallas que no necesitan estar dentro del sistema:
- Entrar: `POST /auth/login`
- Recuperar contraseña: `POST /auth/recuperar`, `POST /auth/recuperar/validar`, `POST /auth/recuperar/restablecer`
- Estado del servidor: `GET /health`

## Flujo CLIENTE → MID → CLIENTE
1. El cliente envía los datos **sin código de seguridad**.
2. El servidor solo revisa los datos y los límites de intentos (no la sesión ni el permiso).
3. Responde con éxito o con el error.

## Errores
- Muchos intentos al entrar → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Muchas solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- Código de recuperación mal o vencido → "El código ingresado no es válido o ha expirado."

---
*Verificado: entrada, recuperación por mensaje y salud del servidor funcionando.*

==========================================================================================
==========================================================================================
D31_Pipeline_App
==========================================================================================
# D31 · PIPELINE DEL SERVIDOR (`app.ts`)

**Tipo:** Servidor y Acceso

## Qué es
El orden en que el servidor arranca, prepara todo y atiende cada petición.

## Flujo CLIENTE → MID → CLIENTE
Toda petición entra por este orden:
1. Seguridad de cabeceras (helmet).
2. Permisos de origen (CORS, solo el sitio de la página).
3. Lectura del JSON enviado (máximo 2 MB).
4. Límite global de solicitudes (500 cada 15 minutos).
5. Documentación disponible en `/api/docs`.
6. Montaje de las rutas de `/api`.
7. Error 404 para rutas que no existen.
8. Controlador general de errores (al final).

Cualquier respuesta sale al final, directo al cliente.

## Errores
- Ruta inexistente → 404 con mensaje "Ruta no encontrada."
- Cualquier error atrapado → mensaje según el catálogo (400 a 500).

---
*Verificado: el orden coincide con el código y las peticiones responden conforme.*

==========================================================================================
==========================================================================================
D32_Rutas_Frontend_Protegidas
==========================================================================================
# D32 · RUTAS FRONTEND PROTEGIDAS

**Tipo:** Frontend

## Qué es
Las pantallas de la página que exigen permiso para poder entrar (25 rutas protegidas).

## Flujo CLIENTE → MID → CLIENTE
1. El usuario navega a una pantalla.
2. La página revisa el permiso que el servidor le dio al entrar.
3. Si no lo tiene → lo manda a una pantalla de "sin acceso" o a la pantalla de entrar.
4. Si lo tiene → muestra la pantalla y pide los datos al servidor.

## Ejemplos de pantallas
- Panel (necesita `dashboard.view`)
- Empresas, Configuración
- Gestión / Inventario (productos, bodegas, categorías)
- Recepción, Historial Logístico
- Auditorías, Roles y Usuarios, Reportes
- Programación, Incidencias

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."
- Sin sesión → va a la pantalla de entrar.

---
*Verificado: cada rol llegó a su pantalla permitida en las pruebas de landings.*

==========================================================================================
==========================================================================================
D33_Mapa_Paginas_Endpoints
==========================================================================================
# D33 · MAPA PÁGINAS ↔ ENDPOINTS

**Tipo:** Frontend

## Qué es
Qué botón del menú manda a qué ruta del servidor.

## Secciones del menú lateral
- **PANEL:** Panel, Empresas, Configuración.
- **GESTIÓN:** Inventario, Recepción, Historial Logístico, Auditorías, Roles y Usuarios, Reportes.
- **MANTENIMIENTO:** Programación, Incidencias.
- **DOCUMENTACIÓN:** Diagramas.

## Flujo CLIENTE → MID → CLIENTE
1. Al entrar, el servidor le da al cliente la lista de permisos del usuario.
2. El menú solo muestra las opciones permitidas (en cada sección que corresponda).
3. Al hacer clic (por ejemplo "Inventario"), la página pide al servidor los datos de esa opción: `GET /productos`, `GET /bodegas`, `GET /categorias`.
4. El servidor vuelve a verificar el permiso y responde.

## Ejemplos de relación
- Empresas → `GET/POST/PUT/DELETE /empresas`
- Roles y Usuarios → `/roles` y `/usuarios`
- Recepción → `POST/GET /recepciones`
- Reportes → `/reportes/*`
- Incidencias → `/incidencias`
- Diagramas → `/diagramas` (pendiente de decisión sobre su permanencia)

## Errores
- Sin permiso → las opciones no se ven y si se accede por dirección, aparece el 403.

---
*Verificado: el menú cambió según el rol en los 5 usuarios de prueba.*

==========================================================================================
==========================================================================================
D34_Errores_Cliente
==========================================================================================
# D34 · ERRORES DEL CLIENTE

**Tipo:** Frontend

## Qué es
Cómo muestra la página los errores cuando algo falla.

## Flujo CLIENTE → MID → CLIENTE (manejo de errores)
1. La respuesta llega con error.
2. La página decide qué hacer según el tipo:

**Errores de sesión (401):**
- Cierra la sesión y lleva al usuario a la pantalla de entrar.

**Errores de datos, permiso, no-existe, repetido o límites (400, 403, 404, 409, 429):**
- Muestra el mensaje del servidor en pantalla (aviso tipo toast).

**Errores del formulario (antes de enviar):**
- Se marca el campo en rojo con su mensaje, por ejemplo:
  - "Las contraseñas no coinciden."
  - "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo."
  - "El teléfono no es válido."
  - "Este campo es obligatorio."

**Servidor apagado o sin red:**
- "No se pudo completar la solicitud."

## Verificación
En la revisión de las 21 pantallas (computador y celular) **no apareció ningún error de consola**.

---
*Verificado: manejo de 401 en sesiones expiradas y mensajes de validación en las suites E2E.*
