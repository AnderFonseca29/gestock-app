# GESTOCK · LOS 34 DIAGRAMAS EN TEXTO SENCILLO (CLIENTE → MID → CLIENTE)

*Aquí están los 34 diagramas del sistema (confirmados en la base de datos). Cada uno se explica con palabras simples, mostrando la ida, el trabajo del servidor (MID) y la vuelta, con todos los mensajes de error que el cliente puede ver.*
*Validado en ejecución: revisión automática 311/311 correcta, pruebas de pantalla ~115 comprobaciones, recuperación por mensaje, persistencia en base de datos y revisión visual de 21 pantallas sin errores.*

---

## CÓMO SE LEEN
- **CLIENTE:** la página web (Angular) que pide algo.
- **MID:** el servidor (Express), que revisa los datos, valida la sesión y los permisos, procesa y responde.
- La respuesta **no vuelve a pasar por el servidor**; va directo al cliente.
- Cuando hay error, el cliente **muestra el mensaje en pantalla**. Si es un problema de sesión (401), además lo lleva a la pantalla de entrar.
- Mensajes generales: datos malos → "Los datos enviados no son válidos." · sin permiso → "No tienes permisos para realizar esta acción." · fallo raro del servidor → "Ocurrió un error inesperado en el servidor."

---

## D1 · PORTADA
- **Qué es:** la hoja de presentación que lista los 34 diagramas del proyecto GESTOCK.
- **Flujo:** no interviene el servidor; es solo información del sistema.

## D2 · ARQUITECTURA GENERAL
- **Qué es:** la vista de las 3 capas: página web (Angular), servidor (Node/Express) y base de datos (PostgreSQL).
- **CLIENTE → MID → CLIENTE:** la página pide con un código de seguridad (JWT) → el servidor atiende y consulta la base de datos → la página recibe los datos en formato JSON.
- **Errores:** los generales; si el servidor está apagado, la página avisa "No se pudo completar la solicitud."

## D3 · MID DETALLE
- **Qué es:** la capa intermedia y lo que atraviesa cada petición.
- **CLIENTE → MID → CLIENTE:** la petición pasa por: límite de solicitudes (500 cada 15 minutos) → revisión de los datos (Zod) → revisión del código de sesión (JWT) → revisión del permiso → controlador → base de datos → respuesta directa al cliente.
- **Errores:** si pasa el límite de solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."

## D4 · AUTENTICACIÓN Y SESIÓN
- **Qué es:** entrar al sistema, crear el código de seguridad (dura 8 horas) y controlar las sesiones abiertas.
- **CLIENTE → MID → CLIENTE:** el cliente envía correo y contraseña → el servidor los compara, exige que la cuenta y el rol estén activos, crea el código y abre la sesión → el cliente recibe el código, su usuario y sus permisos.
- **Errores:**
  - Datos mal puestos → "Los datos enviados no son válidos."
  - Muchos intentos seguidos (máximo 5) → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
  - Correo o contraseña mal → "Las credenciales ingresadas no son válidas."
  - Usuario de otra empresa → "El usuario no pertenece a esa empresa."
  - Cuenta desactivada → "Tu cuenta está inactiva. Contacta al administrador."
  - Rol desactivado → "El rol asignado a tu cuenta está inactivo. Contacta al administrador."

## D5 · RBAC — ROLES Y PERMISOS
- **Qué es:** el mapa de roles (Administrador, Supervisor, Operario, Técnico, Auditor) y los permisos que protegen cada pantalla.
- **CLIENTE → MID → CLIENTE:** el cliente entra y el servidor le entrega solo los permisos de su rol → en cada pantalla el servidor vuelve a revisar "¿este usuario puede entrar aquí?" → si no puede, responde el error.
- **Errores:** sin permiso → "No tienes permisos para realizar esta acción." (además, los botones y páginas sin permiso ni se muestran).

## D6 · PATRÓN CRUD
- **Qué es:** la secuencia base de crear, ver, editar y eliminar, que usan casi todos los módulos.
- **CLIENTE → MID → CLIENTE:**
  - Crear (POST): los datos van → el servidor los guarda y registra el cambio → responde "creado con éxito".
  - Ver (GET): el cliente pide la lista o uno → el servidor responde los datos.
  - Editar (PUT): los cambios van → el servidor los guarda y registra → respuesta con éxito.
  - Eliminar (DELETE): el cliente pide borrar → el servidor borra y registra → "borrado".
- **Errores generales del patrón:** datos malos → 400 · sin sesión → 401 · sin permiso → 403 · **no existe → "El ... no existe." (404)** · **repetido → "Ya existe un ..." (409)** · el registro está siendo usado → "No se puede eliminar porque está en uso." (409).

## D7 · ERRORES DEL BACKEND
- **Qué es:** cómo el servidor clasifica todos los errores para dar mensajes claros.
- **CLIENTE → MID → CLIENTE:** cuando algo falla, el servidor atrapa el error, le pone un código y un mensaje en español → el cliente lo muestra. Los 7 tipos: 400 datos malos · 401 sin sesión · 403 sin permiso · 404 no existe · 409 repetido o en uso · 429 demasiadas solicitudes · 500 error interno.
- **Ejemplos de mensajes internos de la base de datos:** campo obligatorio vacío → "Los datos enviados no son válidos." · valor repetido → "Ya existe un registro con esos datos." · tipo de dato incorrecto → "Los datos enviados no son válidos."

## D8 · BASE DE DATOS
- **Qué es:** las 18 tablas de `Gestock_db` (empresas, usuarios, roles, permisos, productos, categorías, bodegas, movimientos, recepciones, incidencias, mantenimientos, auditorías, sesiones, notificaciones, configuración, restablecimientos y más).
- **CLIENTE → MID → CLIENTE:** el cliente nunca toca la base; siempre pide al servidor, y el servidor guarda o lee para responder.
- **Reglas:** el **stock nunca queda negativo** ni la bodega pasa de su capacidad (el sistema lo recorta solo). Los datos **se guardan en el disco**: se probó que siguen ahí aunque se apague el servidor.

## D9 · MATRIZ DE TRAZABILIDAD
- **Qué es:** la comprobación de que cada diagrama coincide con el código real.
- **Flujo:** un verificador automático compara: número de rutas del código = número del diagrama, cada error guardado existe con su código correcto y cada tabla consultada está en el esquema.
- **Resultado:** 311 de 311 comprobaciones correctas, 0 fallos.

---

## D10 · CONTROLADOR AUTH (7 rutas)
- **Qué es:** entrar, ver perfil, salir, cambiar clave y recuperar contraseña. Rutas públicas (sin sesión): entrar (`login`) y recuperar (`recuperar`, `validar`, `restablecer`).
- **CLIENTE → MID → CLIENTE (entrar):** correo + contraseña → se compara y se crea el código (8 h) y la sesión → el cliente obtiene `{token, usuario, permisos}`.
- **CLIENTE → MID → CLIENTE (perfil):** envía su código → se revisa que siga sirviendo → recibe sus datos.
- **CLIENTE → MID → CLIENTE (salir):** envía su código → el servidor cierra la sesión → éxito.
- **CLIENTE → MID → CLIENTE (cambiar clave):** clave actual + nueva → se compara y reemplaza → éxito.
- **Mensajes:**
  - Entrar mal o muchas veces → "Las credenciales ingresadas no son válidas." / "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
  - Sin código o vencido → "No se proporcionó un token de acceso." / "Tu sesión ha expirado. Inicia sesión nuevamente."
  - Sesión cerrada o usuario borrado → "Tu sesión fue cerrada. Inicia sesión nuevamente." / "El usuario ya no existe en el sistema."
  - Clave actual mal → "La contraseña actual no es correcta."
  - Código de recuperación mal o vencido → "El código ingresado no es válido o ha expirado."

## D11 · CONTROLADOR USUARIO (8 rutas)
- **Qué es:** administrar usuarios (ver, crear, editar, estado, rol, clave y borrar).
- **CLIENTE → MID → CLIENTE:** lista o detalle → datos · crear → guarda con la clave encriptada → 201 · editar/estado/rol → guarda → 200 · cambiar clave → guarda y **cierra las sesiones de ese usuario** → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "El usuario no existe."
  - Correo repetido → "Ya existe un usuario con ese correo electrónico."
  - Rol inexistente → "El rol seleccionado no existe."
  - Cambiar su propia clave desde aquí → "Para cambiar tu propia contraseña usa la opción de tu perfil."
  - Borrarse a sí mismo → "No puedes eliminar tu propio usuario."

## D12 · CONTROLADOR ROL (8 rutas)
- **Qué es:** administrar roles y el permiso de cada uno.
- **CLIENTE → MID → CLIENTE:** ver roles (lista y básicos) → datos · crear → guarda → 201 · editar/estado/permisos → guarda → 200 · borrar → 200.
- **Mensajes:**
  - Nombre repetido → "Ya existe un rol con ese nombre."
  - No existe → "El rol no existe."
  - Rol con usuarios → "No se puede eliminar un rol que tiene usuarios asignados."

## D13 · CONTROLADOR PERMISO (2 rutas)
- **Qué es:** ver el catálogo de permisos para poder asignarlos a los roles.
- **CLIENTE → MID → CLIENTE:** pide la lista (o la de un módulo) → el servidor revisa permiso → devuelve el catálogo.
- **Mensajes:** sin permiso → "No tienes permisos para realizar esta acción." · sin sesión → aviso de 401.

## D14 · CONTROLADOR EMPRESA (6 rutas)
- **Qué es:** administrar empresas, cambiar de empresa y crearlas con su administrador.
- **CLIENTE → MID → CLIENTE:** ver lista/detalle → datos · cambiar de empresa (correo + contraseña) → se mueve la sesión → 200 · crear empresa con su admin (todo junto) → 201 · editar → 200 · borrar → 200.
- **Mensajes:**
  - Sesión no reconocida → "No se pudo identificar la sesión actual."
  - No existe → "La empresa no existe."
  - Empresa inactiva → "La empresa está inactiva. No puedes seleccionarla."
  - NIT repetido → "Ya existe una empresa con ese NIT."

## D15 · CONTROLADOR CATEGORÍA (5 rutas)
- **Qué es:** administrar las categorías de productos (ver, crear, editar, borrar).
- **CLIENTE → MID → CLIENTE:** lista/detalle → datos · crear → 201 · editar → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "La categoría no existe."
  - Nombre repetido → "Ya existe una categoría con ese nombre."
  - Categoría con productos → "No se puede eliminar porque está siendo utilizada." (409).

## D16 · CONTROLADOR BODEGA (5 rutas)
- **Qué es:** administrar las bodegas (lugares donde se guarda el inventario).
- **CLIENTE → MID → CLIENTE:** lista/detalle → datos · crear → 201 · editar → 200 · borrar → 200. Al recibir o sacar mercancía, el servidor recalcula el espacio ocupado **sin pasarse de la capacidad**.
- **Mensajes:**
  - No existe → "La bodega no existe."
  - Código repetido → "Ya existe una bodega con ese código."

## D17 · CONTROLADOR PRODUCTO (7 rutas)
- **Qué es:** administrar productos, incluida la lista de stock bajo.
- **CLIENTE → MID → CLIENTE:** lista/detalle/stock-bajo → datos · crear → 201 · editar/estado → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "El producto no existe."
  - Código repetido → "Ya existe un producto con ese código."
  - Producto con movimientos → "No se puede eliminar porque está siendo utilizado." (409).

## D18 · CONTROLADOR MOVIMIENTO (4 rutas)
- **Qué es:** registrar entradas, salidas y transferencias del inventario.
- **CLIENTE → MID → CLIENTE:** lista con filtros (tipo, fechas, estado) → datos con totales · registrar movimiento → el servidor guarda y ajusta el stock de la bodega y del producto → 201 · borrar → 200 (no devuelve el stock).
- **Mensajes:**
  - No existe → "El movimiento no existe."
  - Producto o bodega inexistente → "El producto seleccionado no existe." / "La bodega seleccionada no existe."
  - El stock nunca queda negativo: si la cantidad pide más de lo que hay, el sistema lo deja en cero (no es error).

## D19 · CONTROLADOR RECEPCIÓN (5 rutas)
- **Qué es:** registrar la llegada de mercancía con su detalle.
- **CLIENTE → MID → CLIENTE:** lista/detalle (con su detalle) → datos · crear cabecera + detalle juntos → 201 · editar → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "La recepción no existe."
  - Documento repetido → "Ya existe una recepción con ese número de documento."
  - Producto del detalle inexistente → "El producto seleccionado no existe."

## D20 · CONTROLADOR AUDITORÍA (2 rutas)
- **Qué es:** ver el historial de quién hizo qué (solo lectura).
- **CLIENTE → MID → CLIENTE:** pide la lista o un registro → el servidor revisa permiso (`auditoria.view`) → devuelve el historial.
- **Mensajes:**
  - No existe → "El registro de auditoría no existe."
  - Sin permiso → "No tienes permisos para realizar esta acción."

## D21 · CONTROLADOR INCIDENCIA (5 rutas)
- **Qué es:** reportar y administrar incidencias (prioridad: Baja, Media, Alta o Crítica).
- **CLIENTE → MID → CLIENTE:** lista/detalle → datos · crear → validando que la prioridad sea de las permitidas → 201 · editar → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "La incidencia no existe."
  - Prioridad inválida → "Los datos enviados no son válidos."

## D22 · CONTROLADOR MANTENIMIENTO (5 rutas)
- **Qué es:** administrar los mantenimientos programados.
- **CLIENTE → MID → CLIENTE:** lista/detalle → datos · crear → 201 · editar → 200 · borrar → 200.
- **Mensajes:**
  - No existe → "El mantenimiento no existe."
  - Datos malos → "Los datos enviados no son válidos."

## D23 · CONTROLADOR SESIÓN (3 rutas)
- **Qué es:** ver las sesiones abiertas de un usuario y cerrarlas.
- **CLIENTE → MID → CLIENTE:** lista de sesiones activas → datos · "cerrar otras" → cierra todas menos la actual → 200 · cerrar una → 200.
- **Mensajes:**
  - Su propia sesión no reconocida → "No se pudo identificar la sesión actual."
  - Cerrar la sesión en la que está → "No puedes cerrar la sesión actual desde aquí."
  - No existe → "La sesión no existe."

## D24 · CONTROLADOR NOTIFICACIÓN (3 rutas)
- **Qué es:** ver notificaciones y marcarlas como leídas.
- **CLIENTE → MID → CLIENTE:** lista → datos · marcar una o todas como leídas → 200.
- **Mensajes:**
  - No existe → "La notificación no existe."
  - Sin sesión reconocida → "No autenticado."

## D25 · CONTROLADOR CONFIGURACIÓN (2 rutas)
- **Qué es:** ver y guardar los valores de configuración del sistema.
- **CLIENTE → MID → CLIENTE:** ver → devuelve la lista clave-valor · guardar los valores → 200.
- **Mensajes:**
  - Guardar sin enviar nada → "No se enviaron configuraciones para actualizar."
  - Sin permiso de edición → "No tienes permisos para realizar esta acción."

## D26 · CONTROLADOR DASHBOARD (1 ruta)
- **Qué es:** el panel de resumen.
- **CLIENTE → MID → CLIENTE:** pide el resumen → el servidor calcula totales (productos, stock bajo, valor del inventario) y las gráficas del mes → devuelve los datos.
- **Mensajes:** sin permiso → "No tienes permisos para realizar esta acción."

## D27 · CONTROLADOR REPORTE (5 rutas)
- **Qué es:** los reportes de inventario, movimientos, stock, auditorías e incidencias.
- **CLIENTE → MID → CLIENTE:** pide un reporte → el servidor junta y ordena los datos → los devuelve para verlos o imprimirlos.
- **Mensajes:** sin permiso → "No tienes permisos para realizar esta acción."

---

## D28 · CICLO COMPLETO IDA Y VUELTA
- **Qué es:** el viaje de una petición de principio a fin.
- **CLIENTE → MID → CLIENTE:** pide → pasa por límite, validación, sesión y permiso → el controlador procesa con la base de datos → respuesta directa al cliente.
- **Clave:** la **respuesta no vuelve a pasar por el servidor**; va de una vez al cliente.

## D29 · RETORNO SIN MID / FORMATO DE RESPUESTA
- **Qué es:** cómo responde el servidor siempre, para que el cliente lo entienda igual en todas las pantallas.
- **Éxito:** `{success: true, message: "...", data: {...}}` → el cliente muestra los datos.
- **Error:** `{success: false, message: "..."}` → el cliente muestra el mensaje (si es 401, sale de la sesión y va a entrar).

## D30 · RUTAS PÚBLICAS SIN SESIÓN
- **Qué es:** las pocas pantallas que no necesitan estar dentro: entrar (`/auth/login`), recuperar contraseña (`/auth/recuperar`, `/validar`, `/restablecer`) y el estado de salud del servidor (`/health`).
- **CLIENTE → MID → CLIENTE:** van sin código de seguridad; solo pasan por revisión de datos y límites de intentos.
- **Mensajes:** muchos intentos al entrar o al recuperar → "Has superado el máximo de intentos..." / "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."

## D31 · PIPELINE DEL SERVIDOR (`app.ts`)
- **Qué es:** el orden en que el servidor arranca y prepara todo.
- **Pasos:** seguridad de cabeceras (helmet) → permisos de origen (CORS) → lectura del JSON → límite global de solicitudes → pantalla de documentación (`/api/docs`) → montaje de las rutas `/api` → error para rutas no encontradas → controlador de errores.
- **Flujo CLIENTE → MID → CLIENTE:** cualquier petición entra por este orden y sale por el final con su respuesta o su error.

## D32 · RUTAS FRONTEND PROTEGIDAS
- **Qué es:** las 25 pantallas del lado de la página que exigen permiso para entrar.
- **CLIENTE → MID → CLIENTE:** al navegar a una pantalla, la página consulta el permiso guardado del usuario → si no lo tiene, lo manda a una pantalla de "sin acceso" o a la de entrar.
- **Ejemplos:** Panel (Panel), Empresas, Configuración, Gestión/Inventario, Recepción, Auditorías, Roles y Usuarios, Reportes, Programación, Incidencias, entre otras.
- **Mensajes:** sin permiso → "No tienes permisos para realizar esta acción." · sin sesión → va a la pantalla de entrar.

## D33 · MAPA PÁGINAS ↔ ENDPOINTS
- **Qué es:** qué botón del menú manda a qué ruta del servidor.
- **Secciones del menú:** Panel (Panel, Empresas, Configuración) · Gestión (Inventario, Recepción, Historial Logístico, Auditorías, Roles y Usuarios, Reportes) · Mantenimiento (Programación, Incidencias) · Documentación (Diagramas).
- **CLIENTE → MID → CLIENTE:** el menú solo muestra las opciones que el usuario tiene permitido (según los permisos que el servidor dio al entrar), y en cada una el servidor vuelve a verificar.
- **Cada opción del menú → su endpoint:** por ejemplo Inventario → `GET /productos`, `GET /bodegas`, `GET /categorias`; Recepción → `POST/GET /recepciones`; Roles → `GET/PUT /roles`; etc.

## D34 · ERRORES DEL CLIENTE
- **Qué es:** cómo muestra la página los errores.
- **CLIENTE → MID → CLIENTE:** cuando la respuesta llega con error: si es 401 (sesión), la página **cierra sesión y va a la pantalla de entrar** · si es de datos, permisos, no-existe, repetido o límites, la página **muestra el mensaje en pantalla (toast)** · si es un error del formulario (por ejemplo claves distintas, teléfono malo, sin mayúscula/número/símbolo), se marca **el campo en rojo con su mensaje** · si el servidor está caído, muestra "No se pudo completar la solicitud."
- **Verificado:** en la revisión de las 21 pantallas (computador y celular) no apareció ningún error de consola.

---

## RESUMEN FINAL
- Los **34 diagramas** están aquí, cada uno con su tema y todos los mensajes de error en español.
- Todo el sistema funciona igual: **el cliente pide → el servidor revisa todo y responde → el cliente muestra los datos o el error**.
- Verificación hecha: diagramas **311/311 correctos** · pruebas de pantalla **~115 comprobaciones** · recuperación por mensaje **funcionando** · **datos persistidos** en la base (sobrevivieron a apagar y encender el servidor) · **21 pantallas sin errores** visuales.