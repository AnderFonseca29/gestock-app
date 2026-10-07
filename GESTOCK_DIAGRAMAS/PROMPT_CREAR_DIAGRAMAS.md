PROMPT PARA CREAR TODOS LOS DIAGRAMAS DE GESTOCK (COPIA ESTO COMPLETO)

================================================================================
INSTRUCCIONES GENERALES (LEELAS TODAS ANTES DE DIBUJAR):

Eres un dibujante experto de diagramas de arquitectura. Vas a crear 34 diagramas en estilo
"Paint": SOLO figuras basicas 2D (rectangulos, rombos y lineas) con borde NEGRO de 3px, rellenos
planos, sin 3D, sin sombras, sin degradados. Cada diagrama es su propio archivo SVG (lienzo:
1600px ANCHO x 1200px ALTO, siempre APAIZADO).

REGLAS TECNICAS OBLIGATORIAS:
R1. Lienzo/fondo #FFFDFA. Margen: nada toca ni sale del borde; linea perimetral negra 3px
    (50,50)-(1550,1150).
R2. Cabecera negra #181818 rectangulo (52,52)-(1548,142): TITULO blanco bold 34px, SUBTITULO gris
    claro 22px. Sin tildes en NINGUN texto.
R3. Paleta exacta:
    NEGRO #181818 · BLANCO #FFFDFA · GRIS M.CLARO #E8E8E6 · GRIS CLARO #D0D0D0 · GRIS MEDIO #A0A0A0 ·
    ROJO #B22222 · ROJO SUAVE #F0E4E4 · VERDE #4A784A · VERDE SUAVE #DEEAE2 · AZUL SUAVE #DEE6EE ·
    texto en cabecera negra #FAF6EE.
R4. FIGURAS:
    CAJA: rectangulo redondeado radio 6, borde negro 3, franja de TITULO negra 34px, cuerpo
    centrado 13-15px (baja la letra si no cabe, NO agrandes la caja).
    FLECHA: linea negra 5px con punta triangular; sale del borde der. de una caja y entra al borde
    izq. de la siguiente. Las flechas de error bajan con quiebres a 90 grados.
    DIAMANTE: rombo de decision (¿condicion?) borde negro 13px.
    FLECHA DE ERROR: sale por la derecha o abajo del paso, va hacia el DIAMANTE; del diamante una
    rama "NO/falla" desciende a la CAJA DE ERROR individual (naranja/roja suave) y otra "SI/ok"
    continua el flujo.
    ETIQUETA sobre flecha: caja blanca min 26px, borde negro 2, texto 13px.
    TABLA: cabecera gris medio + filas #FFFFFF/#F8F6F2 bordes negros 2.

LA NORMA MAS IMPORTANTE - CADA ERROR ES UNA RAMA PROPIA E INDEPENDIENTE:
  - NO agrupes errores en una sola caja de lista.
  - CADA error tiene: su DIAMANTE de decision (con la pregunta exacta), su FLECHA de rama "FALLA",
    su CAJA DE ERROR con RElleno #F8ECEC, borde ROJO, titulo "400 BAD_REQUEST" (etc.), el MENSAJE
    EXACTO dentro en 12px, y una flecha que lo conecta al final "errorHandler -> JSON
    {success:false, message, code}".
  - Los diamantes se dibujan EN EL ORDEN en que puede fallar el paso: rateLimit -> validate ->
    authenticate -> authorize -> reglas de negocio -> repo (PG) -> errorHandler.
  - Cada diamante tiene etiqueta "SI/ok" (sigue de frente) y "FALLA/NO" (baja a su error).
  - Si un paso puede fallar de varias formas (ej. authenticate: sin token | token invalido |
    sesion cerrada | usuario inactivo), dibuja UN DIAMANTE por cada caso, UNO DEBAJO DE OTRO.

R5. FLUJO BASE para diagramas de controlador (10-27): 4 etapas de IDA:
    CLIENTE (#DEE6EE): "Angular 18 / frontend_gestock / componente -> servicio / api.service.ts /
    Interceptor (Bearer + 401) / Guards: permission-role-home".
    Flecha -> etiqueta "Authorization: Bearer <JWT>".
    MID (#F0E4E4 borde ROJO): "Capas que validan: [cliente] Interceptor + Guards / [API] rateLimit
    -> validate (Zod) -> authenticate (JWT+sesion) -> authorize (permisos)".
    Flecha -> etiqueta "HTTP / JSON".
    API (#DEE6EE): "Express 5 + TS / routes + controller + service".
    Flecha -> etiqueta "SQL parametrizado".
    BASE DE DATOS (#DEE6EE, SIEMPRE en 10-27): "PostgreSQL · Gestock_db / tablas REALES que usa
    ese controlador (ej. usuarios · roles · empresas) / multitenant: empresa_id". Es la 4ta etapa:
    muestra contra que tablas corre exactamente la consulta que sale del API.
    Despues de la fila de columnas, dibuja la VUELTA: flecha VERDE que baja del API, corre por
    debajo de las columnas y sube hasta CLIENTE, etiquetada
    "RESPUESTA ok/created/noContent -> CLIENTE (no atraviesa el MID)".
    En la zona de la columna central o bajo el flujo, dibuja los DIAMANTES de error del flujo (ver
    cuerpo de cada controlador), cada uno con su rama FALLA individual.

R6. Si el diagrama se llena: usa mas altura de la pagina (hasta y=1140 es valido) antes de reducir
    la letra. Si aun asi falta espacio, usa dos niveles: flujo principal en la mitad superior y las
    ramas de error individuales apiladas en la mitad inferior con flechas desde los diamantes.

R7. Archivos: 01_Portada.svg ... 34_Errores_Cliente.svg.

================================================================================
CUERPO DIBUJABLE DE CADA DIAGRAMA (34) - CADA ERROR ES UNA RAMA PROPIA:
================================================================================

--------------------------------------------------------------------------------
01_Portada.svg
--------------------------------------------------------------------------------
P1. Rectangulo negro (80,120)-(1520,400): texto "GESTOCK" blanco bold 110px centrado.
P2. Bajo el, texto naranja #F6AA3C bold 40px centrado: "ARQUITECTURA · CLIENTE <-> MID <-> API · POSTGRESQL".
P3. 5 cajas grises apiladas (x 180..1420, alto 48, desde y=480 paso 60):
    "CLIENTE - Angular 18 · interceptor + guards (Bearer, 401, permisos)"
    "MID - rateLimit -> validate (Zod) -> authenticate (JWT+sesion) -> authorize"
    "API - Express 5 · 18 controladores · ApiError + errorHandler"
    "DATOS - PostgreSQL Gestock_db · 18 tablas · multitenant empresa_id"
    "ERRORES - 400/401/403/404/409/429/500 segun funcionalidad (cada uno su rama)"
P4. Caja roja suave (180, 800, 1240, 64): "El MID integra AMBOS lados: valida la peticion que
    ENTRA; la respuesta SALE directo del API al cliente."
P5. Pie italico gris (centro 800, y=1120): "Diagramas generados desde el codigo fuente real".

--------------------------------------------------------------------------------
02_Arquitectura_General.svg
--------------------------------------------------------------------------------
A1. 4 cajas en fila y=190 alto 160 (x 80..1520), flechas horizontales:
    CLIENTE (#DEE6EE) -> MID (2 frentes) (#F0E4E4 borde ROJO) -> API (#DEE6EE) -> POSTGRESQL.
A2. Etiqueta sobre flecha CLIENTE-MID: "HTTPS / JSON / Bearer".
A3. Seccion "DETALLE DEL MID (no ficticio)" y=420: dos cajas y=480 alto 150:
    izq "EN EL CLIENTE": api.service.ts devuelve res.data; api.interceptor agrega Authorization
    Bearer <jwt>; maneja 401 (-> login) y otros errores (toast); guards permission/role/home.
    der "EN EL API": apiRateLimiter (500/15min); validate (Zod); authenticate (JWT + sesion);
    authorize (permisos rol); errorHandler normaliza ApiError y PG.
A4. Seccion "18 CONTROLADORES REALES" y=700: rejilla 6x3 y=760 alto 46: auth, usuario, rol,
    permiso, empresa, categoria, bodega, producto, movimiento, recepcion, auditoria, incidencia,
    mantenimiento, sesion, notificacion, configuracion, dashboard, reporte.

--------------------------------------------------------------------------------
03_MID_Detalle.svg
--------------------------------------------------------------------------------
M1. Titulo seccion "FLUJO DE UNA PETICION AUTENTICADA". Fila de 6 cajas y=190 alto 160 (flechas):
    1 Angular (#DEE6EE) | 2 Interceptor (#F0E4E4) "Bearer <jwt> / gestock_token en localStorage" |
    3 Ruta backend "app.use('/api', apiRateLimiter) / apiRoutes" | 4 Middleware (#F0E4E4)
    "rateLimit -> validate -> authenticate -> authorize" | 5 Controller "usuario.controller.ts" |
    6 Datos (#DEE6EE) "Service/Repo SQL -> PostgreSQL".
M2. Rama de "MID" (debajo de la caja 4), 4 DIAMANTES uno bajo otro (cada uno su rama FALLA,
    con su caja de error individual y mensaje):
     D1 "¿Supero apiRateLimiter (500)?":  FALLA -> caja 429 RATE_LIMITED "Demasiadas solicitudes.
        Espera unos minutos e intenta de nuevo." -> errorHandler.
     D2 "¿Body/Params/Query validos?":    FALLA -> caja 400 BAD_REQUEST "Los datos enviados no son
        validos (Zod)" -> errorHandler.
     D3 "¿Token valido + sesion activa?": FALLA -> caja 401 UNAUTHORIZED "Tu sesion ha expirado.
        Inicia sesion nuevamente." -> errorHandler. (rama adicional FALLA "El usuario ya no existe
        en el sistema." -> 401 propio).
     D4 "¿Permiso 'modulo.accion'?":      FALLA -> caja 403 FORBIDDEN "No tienes permisos para
        realizar esta accion." -> errorHandler.
M3. Tabla "ARCHIVOS REALES DE LA CAPA MID" (Archivo | Responsabilidad):
    interceptors/api.interceptor.ts | agrega Bearer; 401!=login -> limpiar + toast "Tu sesion ha
    expirado" + /auth/login; otros -> toast.
    guards/permission-guard.ts | refrescarSesion -> estaAutenticado -> data.permission/
    anyPermission -> toast "Acceso denegado".
    guards/home-guard.ts · role-guard.ts | redirige por rol a la ruta inicial.
    middleware/validate.ts | schema Zod: 400 BAD_REQUEST.
    middleware/authenticate.ts | JWT + sesion activa: 401 UNAUTHORIZED.
    middleware/authorize.ts | permiso del rol: 403 FORBIDDEN.
    middleware/rateLimit.ts | apiRateLimiter(500), loginEmailLimiter(5), loginIpLimiter(60),
    recuperacionLimiter.

--------------------------------------------------------------------------------
04_Autenticacion_Sesion.svg
--------------------------------------------------------------------------------
AU1. Seccion "POST /auth/login". Fila de 7 cajas y=190 alto 150 (flechas):
    Angular login() -> "POST /api/auth/login (validateBody loginSchema)" -> "rate limits
    (loginEmailLimiter 5 / loginIpLimiter 60)" (#F0E4E4) -> "auth.controller login() /
    bcrypt.compare + usuario Activo + rol" -> "Genera JWT (exp 8h, id+rol)" -> "Inserta sesion
    (Activa, IP + userAgent)" -> "Responde ok(200) {token,usuario,permisos}" (#DEEAE2).
AU2. RAMAS DE ERROR INDIVIDUALES de login (debajo del paso que corresponde, cada una su diamante):
     tras validateBody: D "¿Formato email/password valido?" FALLA -> 400 BAD_REQUEST "Los datos
        enviados no son validos." -> errorHandler.
     tras rate limits: D "¿Email supero 5 fallos/15min?" FALLA -> 429 RATE_LIMITED "Has superado el
        maximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo." -> errorHandler.
        D "¿IP supero 60 intentos?" FALLA -> 429 RATE_LIMITED "Demasiadas solicitudes. Espera unos
        minutos e intenta de nuevo." -> errorHandler.
     tras bcrypt: D "¿Credenciales correctas?" FALLA -> 401 UNAUTHORIZED "Las credenciales
        ingresadas no son validas." -> errorHandler.
        D "¿Usuario pertenece a la empresa?" FALLA -> 401 UNAUTHORIZED "El usuario no pertenece a
        esa empresa." -> errorHandler.
        D "¿Cuenta activa?" FALLA -> 403 FORBIDDEN "Tu cuenta esta inactiva. Contacta al
        administrador." -> errorHandler.
        D "¿Rol activo?" FALLA -> 403 FORBIDDEN "El rol asignado a tu cuenta esta inactivo.
        Contacta al administrador." -> errorHandler.
     tras permisos: D "¿Se cargaron permisos?" FALLA -> 500 INTERNAL_ERROR "No se pudieron cargar
        los permisos del usuario." -> errorHandler.
AU3. Tabla "RUTAS PROTEGIDAS CON MIDDLEWARE":
    GET /auth/perfil | authenticateToken
    POST /auth/logout | authenticateToken -> cierra sesion
    PUT /auth/contrasena | authenticateToken + validateBody(cambiarContrasenaSchema)
    POST /auth/recuperar | recuperacionLimiter + validateBody(solicitarRecuperacionSchema)
    POST /auth/recuperar/validar | validateBody(validarCodigoRecuperacionSchema)
    POST /auth/recuperar/restablecer | validateBody(restablecerPasswordSchema)
    Rama de PUT /auth/contrasena: D "¿Contrasena actual correcta?" FALLA -> 409 CONFLICT "La
        contrasena actual no es correcta." -> errorHandler.
    Rama de recuperar/validar y restablecer: D "¿Codigo valido y no expirado?" FALLA -> 400
        BAD_REQUEST "El codigo ingresado no es valido o ha expirado." -> errorHandler.
    Rama de GET /auth/perfil (calculate DEL authenticateToken): 4 diamantes:
        D "¿Tiene header 'Bearer <token>'?" FALLA -> 401 "No se proporciono un token de acceso."
        D "¿Token valido?" FALLA -> 401 "El token de acceso no es valido."
        D "¿Sesion activa?" FALLA -> 401 "Tu sesion fue cerrada. Inicia sesion nuevamente."
        D "¿Usuario existe y activo?" FALLA -> 401 "El usuario ya no existe en el sistema." o 403
        "El usuario esta inactivo." (diamantes separados).
AU4. Caja "FUNCIONAMIENTO EN FRONTEND": localStorage gestock_token + gestock_usuario_sesion;
    interceptor agrega Bearer; en 401 limpia y redirige a /auth/login con toast.

--------------------------------------------------------------------------------
05_RBAC_Roles_Permisos.svg
--------------------------------------------------------------------------------
RB1. 3 cajas en fila y=190 alto 150:
    ROL (Administrador, Supervisor, Tecnico de Mantenimiento, Auditor, Operario) ->
    ROL_PERMISO (#F0E4E4): "relacion N:M / usuarios.rol_id -> roles.id / rol_permiso.rol_id /
    rol_permiso.permiso_id -> permisos.id" -> PERMISO (#DEE6EE): "modulo.accion: usuarios.create,
    roles.asignar_permisos, productos.view, reportes.view".
RB2. DIAMANTES de asignacion de permisos (rama propia, debajo de ROL_PERMISO):
    D "¿Tiene el permiso 'modulo.accion'?"  FALLA -> 403 FORBIDDEN "No tienes permisos para
        realizar esta accion." -> errorHandler.
    D "¿El rol esta activo?"                FALLA -> 403 FORBIDDEN "El rol asignado esta inactivo."
    D "¿Rol existe?"                        FALLA -> 404 NOT_FOUND "El rol no existe."
RB3. Tabla "PERMISOS REALES POR OBSERVABLE (modulo | permisos)":
    Dashboard | dashboard.view
    Empresas | empresas.view · create · edit · delete
    Usuarios | usuarios.view · create · edit · desactivar · password · delete
    Roles / Permisos | roles.view · create · edit · delete · asignar_permisos · permisos.view
    Categorias / Bodegas | categorias.view/create/edit/delete · bodegas.view/create/edit/delete
    Productos / Inventario | productos.view/create/edit/delete · inventario.view
    Movimientos / Recepcion | movimientos.view · recepcion.view/create/edit/delete · historial.view
    Auditoria / Incidencias / Mantenimiento | auditoria.view · incidencias.* · mantenimiento.*
    Sesiones / Notif. / Config / Reportes | sesiones.view/delete · notificaciones.view ·
    configuracion.view/edit · reportes.view
RB4. Caja inferior: "COMO SE APLICA": authorizePermission('modulo.accion') y
    authorizeAnyPermission('a','b'); frontend usa permisos del login + guards con data.permission.

--------------------------------------------------------------------------------
06_Patron_CRUD.svg
--------------------------------------------------------------------------------
CR1. Fila de 6 cajas y=190 alto 170 (flechas), alternando #E8E8E6 y #F0E4E4:
    "LISTAR / GET /:ruta / authorize('x.view') / listar() -> repo.listar"
    "CREAR / POST /:ruta / authorize('x.create') / validateBody -> crear()"
    "DETALLE / GET /:ruta/:id / authorize('x.view') / validateParams -> detalle()"
    "EDITAR / PUT /:ruta/:id / authorize('x.edit') / validateBody -> actualizar()"
    "ESTADO / PATCH /:ruta/:id / authorize('x.edit') / cambiarEstado()"
    "ELIMINAR / DELETE /:ruta/:id / authorize('x.delete') / eliminar()"
CR2. RAMAS DE ERROR INDIVIDUALES del patron (diamantes debajo):
    CREAR:  D "¿DTO valido?" FALLA -> 400 BAD_REQUEST. D "¿Duplicado?" FALLA -> 409 CONFLICT.
        D "¿Tiene permiso 'x.create'?" FALLA -> 403 FORBIDDEN.
    DETALLE/EDITAR/ELIMINAR: D "¿Existe id?" FALLA -> 404 NOT_FOUND.
    ELIMINAR: D "¿Usado por otro registro (FK)?" FALLA -> 409 FOREIGN_KEY_VIOLATION.
    ESTADO:  D "¿Estado permitido?" FALLA -> 400 BAD_REQUEST.
    TODOS:   D "¿Token valido?" FALLA -> 401 UNAUTHORIZED; D "¿Permiso?" FALLA -> 403;
             fallo repo -> 500 INTERNAL_ERROR. Cada rama con su caja de error y su flecha al
             errorHandler.
CR3. Seccion "CODIGO TIPO EN UN CONTROLLER" con caja monospace:
    async listar(req,res,next){ try { const lista = await usuarioService.listar(req.usuarioId);
    ok(res,lista); } catch(e){ next(e); } }
    async crear(req,res,next){ try { const nuevo = await usuarioService.crear(req.body);
    created(res,nuevo); } catch(e){ next(e); } }
    Nota: "catch(e){ next(e); }" es el punto donde TODOS los errores se mandan al errorHandler.
CR4. Caja "AUDITORIA Y RESPUESTAS": cada operacion registra en auditorias; respuestas ok(200)/
    created(201)/noContent(200).

--------------------------------------------------------------------------------
07_Errores_Backend.svg
--------------------------------------------------------------------------------
ER1. Seccion "MAPA DE ERRORES POR PASO". 7 filas horizontales; CADA error es su propia fila:
    PASO 1 rateLimit:        D "¿Limite superado?" FALLA -> caja 429 RATE_LIMITED "Demasiadas
        solicitudes. Espera unos minutos e intenta de nuevo."
    PASO 2 validate:         D "¿Datos validos?" FALLA -> caja 400 BAD_REQUEST "Los datos enviados
        no son validos." (detalle por campo) · D BAD_JSON "El cuerpo de la solicitud contiene JSON
        invalido." · D 22P02 "Uno de los parametros enviados no es valido."
    PASO 3 authenticate:     D "¿Token presente?" FALLA -> 401 "No se proporciono un token de
        acceso." · D "¿Token valido?" FALLA -> 401 "El token de acceso no es valido." · D "¿Sesion
        activa?" FALLA -> 401 "Tu sesion fue cerrada." · D "¿Usuario existe?" FALLA -> 401 "El
        usuario ya no existe en el sistema." · D "¿Usuario activo?" FALLA -> 403 "El usuario esta
        inactivo."
    PASO 4 authorize:        D "¿Tiene permiso?" FALLA -> 403 "No tienes permisos para realizar
        esta accion."
    PASO 5 reglas de negocio:D "¿Existe?" FALLA -> 404 NOT_FOUND "Recurso no encontrado." ·
                             D "¿Duplicado?" FALLA -> 409 CONFLICT · D "¿Inactivo?" FALLA -> 403.
    PASO 6 repo (PG):        D "¿23505?" FALLA -> 409 DUPLICATE_KEY "Ya existe un registro con ese
        valor unico." · D "¿23503?" FALLA -> 409 FOREIGN_KEY_VIOLATION "El registro esta siendo
        utilizado por otra entidad." · D "¿23502?" FALLA -> 400 NOT_NULL_VIOLATION.
    PASO 7 errorHandler:     cuallquier otro -> 500 INTERNAL_ERROR "Error interno del servidor."
ER2. Cada rama FALLA baja a su caja de error individual y de ahi una flecha al "JSON
    {success:false, message, code}".

--------------------------------------------------------------------------------
08_Base_Datos.svg
--------------------------------------------------------------------------------
BD1. 5 columnas de tablitas (titulo negro + grupo de tablas):
    NUCLEO/IDENTIDAD: empresas, roles, permisos, rol_permiso, usuarios, sesiones, restablecimientos_contrasena
    CATALOGOS: categorias, bodegas
    INVENTARIO: productos, movimientos_inventario
    OPERACIONES: recepciones, recepcion_detalle, incidencias, mantenimientos
    SEGURIDAD/CONFIG: auditorias, notificaciones, configuracion_sistema
BD2. Tabla "RELACIONES PRINCIPALES (FK)" - sin errores (solo datos):
    usuarios.rol_id -> roles.id · usuarios.empresa_id -> empresas.id
    rol_permiso.rol_id -> roles.id · rol_permiso.permiso_id -> permisos.id
    productos.categoria_id -> categorias.id · productos.bodega_id -> bodegas.id
    movimientos_inventario.producto_id -> productos.id · movimientos.bodega_id -> bodegas.id
    recepcion_detalle.recepcion_id -> recepciones.id · recepcion_detalle.producto_id -> productos.id
    incidencias/mantenimientos.usuario_id -> usuarios.id · auditorias.usuario_id -> usuarios.id

--------------------------------------------------------------------------------
09_Matriz_Trazabilidad.svg
--------------------------------------------------------------------------------
MT1. Tabla de 3 columnas (Controlador | Modulo | Permisos que protegen sus rutas) - 18 filas:
    1 auth | auth | (internas: authenticateToken y limiters)
    2 usuario | usuarios | usuarios.view · create · edit · desactivar · password · delete
    3 rol | roles | roles.view · create · edit · delete · asignar_permisos
    4 permiso | permisos | permisos.view
    5 empresa | empresas | empresas.view · create · edit · delete
    6 categoria | categorias | categorias.view · create · edit · delete
    7 bodega | bodegas | bodegas.view · create · edit · delete
    8 producto | productos | productos.view · create · edit · delete · inventario.view
    9 movimiento | movimientos | movimientos.view · recepcion.create · recepcion.delete
    10 recepcion | recepciones | recepcion.view · create · edit · delete · historial.view
    11 auditoria | auditorias | auditoria.view
    12 incidencia | incidencias | incidencias.view · create · edit · delete
    13 mantenimiento | mantenimientos | mantenimiento.view · create · edit · delete
    14 sesion | sesiones | sesiones.view · delete
    15 notificacion | notificaciones | notificaciones.view
    16 configuracion | configuracion_sistema | configuracion.view · edit
    17 dashboard | dashboard | dashboard.view
    18 reporte | reportes | reportes.view

--------------------------------------------------------------------------------
10_Controlador_Auth.svg  HASTA  27_Controlador_Reporte.svg
--------------------------------------------------------------------------------
FORMATO UNICO DE LAS 18 PAGINAS DE CONTROLADOR (leer antes de dibujar cualquiera):
E1. COLUMNAS base R5: 4 cajas en fila CLIENTE -> MID -> API -> BASE DE DATOS; flechas con
    etiquetas "Bearer <jwt>" (CLIENTE-MID), "HTTP / JSON" (MID-API), "SQL" (API-BASE DE
    DATOS). En la columna BASE DE DATOS escribe: "PostgreSQL / Gestock_db / <tablas reales
    del controlador, listadas abajo> / multitenant: empresa_id". Vuelta VERDE que baja del
    API, corre por debajo de las columnas y sube hasta CLIENTE, etiquetada
    "RESPUESTA ok/created/noContent -> CLIENTE (sin MID)".
E2. RAMAS MID-COMUN - dibuja estas 6 en TODAS las paginas 10-27 (EXCEPTO auth/10 que usa
    sus 11 propias). Cada una con SU diamante (pregunta exacta), SU flecha "FALLA" y SU caja
    con MENSAJE EXACTO:
     D "¿apiRateLimiter superado (500/15min)?"   FALLA -> 429 RATE_LIMITED "Demasiadas
        solicitudes. Espera unos minutos e intenta de nuevo."
     D "¿Body/Params/Query cumplen el schema Zod?" FALLA -> 400 BAD_REQUEST "Los datos
        enviados no son validos."
     D "¿Se envio 'Authorization: Bearer <token>'?" FALLA -> 401 UNAUTHORIZED "No se
        proporciono un token de acceso."
     D "¿El token JWT es valido y sin expirar?"  FALLA -> 401 UNAUTHORIZED "El token de
        acceso no es valido."
     D "¿La sesion sigue activa en BD?"           FALLA -> 401 UNAUTHORIZED "Tu sesion fue
        cerrada o expiro. Inicia sesion nuevamente."
     D "¿El rol tiene el permiso '<permiso>'?"    FALLA -> 403 FORBIDDEN "No tienes permisos
        para realizar esta accion."
     (<permiso> = el primero que aparece en la tabla de rutas de ese controlador)
E3. CADA controlador anade dsde sus RAMAS ESPECIFICAS (abajo por pagina); la mayoria se
    cierra con D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error
    interno del servidor." (si su bloque especifico ya trae un 500, no dupliques). TODA caja
    de error termina con flecha -> "errorHandler -> JSON {success:false, message, code}".
    Con los controladores largos usa 3-4 columnas de tarjetas, UNA tarjeta por error (nunca
    agrupar dentro de una sola caja).

--------------------------------------------------------------------------------
10_Controlador_Auth.svg
--------------------------------------------------------------------------------
AUTH1. TABLA (7 rutas exactas):
    POST /auth/login | validateBody(loginSchema) + loginEmailLimiter + loginIpLimiter
    GET /auth/perfil | authenticateToken
    POST /auth/logout | authenticateToken
    PUT /auth/contrasena | authenticateToken + validateBody(cambiarContrasenaSchema)
    POST /auth/recuperar | recuperacionLimiter + validateBody(solicitarRecuperacionSchema)
    POST /auth/recuperar/validar | validateBody(validarCodigoRecuperacionSchema)
    POST /auth/recuperar/restablecer | validateBody(restablecerPasswordSchema)
AUTH2. RAMAS ESPECIFICAS (11) - ESTE controlador NO dibuja las 6 MID-COMUN:
    1. D "¿Email supero 5 intentos/15min?"  FALLA -> 429 RATE_LIMITED "Has superado el
        maximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
    2. D "¿IP supero 60 peticiones/15min?"  FALLA -> 429 RATE_LIMITED "Demasiadas
        solicitudes. Espera unos minutos e intenta de nuevo."
    3. D "¿loginSchema valida email+password?" FALLA -> 400 BAD_REQUEST "Los datos enviados
        no son validos."
    4. D "¿Email+password correctos (bcrypt)?" FALLA -> 401 UNAUTHORIZED "Las credenciales
        ingresadas no son validas."
    5. D "¿Usuario pertenece a la empresa?"  FALLA -> 401 UNAUTHORIZED "El usuario no
        pertenece a esa empresa."
    6. D "¿Contrasena actual correcta (PUT /contrasena)?" FALLA -> 401 UNAUTHORIZED "La
        contrasena actual no es correcta."
    7. D "¿Codigo de recuperacion valido?"   FALLA -> 401 UNAUTHORIZED "El codigo ingresado
        no es valido o ha expirado."
    8. D "¿Cuenta activa (login/perfil)?"    FALLA -> 403 FORBIDDEN "Tu cuenta esta
        inactiva. Contacta al administrador."
    9. D "¿Rol asignado activo?"             FALLA -> 403 FORBIDDEN "El rol asignado a tu
        cuenta esta inactivo. Contacta al administrador."
   10. D "¿Existe el usuario (perfil/password)?" FALLA -> 404 NOT_FOUND "El usuario no
        existe."
   11. D "¿Se cargaron los permisos al iniciar?" FALLA -> 500 INTERNAL_ERROR "No se pudieron
        cargar los permisos del usuario."
AUTH3. BASE DE DATOS: usuarios · sesiones · restablecimientos_contrasena.
AUTH4. Capa de datos: auth.routes.ts -> auth.controller.ts -> auth.service.ts.

--------------------------------------------------------------------------------
11_Controlador_Usuario.svg
--------------------------------------------------------------------------------
CU1. COLUMNAS base R5 (ver E1).
CU2. TABLA (8 rutas):
    GET /usuarios | authorizePermission('usuarios.view')
    GET /usuarios/:id | authorizePermission('usuarios.view') + validateParams
    POST /usuarios | authorizePermission('usuarios.create') + validateBody
    PUT /usuarios/:id | authorizePermission('usuarios.edit') + validateBody + validateParams
    PATCH /usuarios/:id/estado | authorizePermission('usuarios.desactivar')
    PATCH /usuarios/:id/rol | authorizePermission('usuarios.edit') + validateBody
    PUT /usuarios/:id/password | authorizePermission('usuarios.password') + validateBody
    DELETE /usuarios/:id | authorizePermission('usuarios.delete') + validateParams
CU3. RAMAS (MID-COMUN 6 con <permiso>=usuarios.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Email duplicado (POST/PUT)?" FALLA -> 409 CONFLICT "Ya existe un usuario con ese
        correo electronico."
     D "¿Existe el rol seleccionado (POST/PUT/rol)?" FALLA -> 404 NOT_FOUND "El rol
        seleccionado no existe."
     D "¿Existe el usuario solicitado (GET/:id, PUT, password, DELETE)?" FALLA -> 404
        NOT_FOUND "El usuario no existe."
     D "¿Cambias tu propia contrasena (PUT /:id/password)?" FALLA -> 400 BAD_REQUEST "Para
        cambiar tu propia contrasena usa la opcion de tu perfil."
     D "¿Eliminas tu propio usuario (DELETE)?" FALLA -> 403 FORBIDDEN "No puedes eliminar tu
        propio usuario."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
CU4. BASE DE DATOS: usuarios · roles · empresas.
CU5. Capa de datos: usuario.routes.ts -> usuario.controller.ts -> usuario.repo.ts.

--------------------------------------------------------------------------------
12_Controlador_Rol.svg
--------------------------------------------------------------------------------
RL1. COLUMNAS base R5 (ver E1).
RL2. TABLA (8 rutas):
    GET /roles/basicos | authorizePermission('roles.view')
    GET /roles | authorizePermission('roles.view')
    GET /roles/:id | authorizePermission('roles.view') + validateParams
    POST /roles | authorizePermission('roles.create') + validateBody
    PUT /roles/:id | authorizePermission('roles.edit') + validateBody
    PATCH /roles/:id/estado | authorizePermission('roles.edit') + validateBody
    PUT /roles/:id/permisos | authorizePermission('roles.asignar_permisos') + validateBody
    DELETE /roles/:id | authorizePermission('roles.delete') + validateParams
RL3. RAMAS (MID-COMUN 6 con <permiso>=roles.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Ya existe un rol con ese nombre?" FALLA -> 409 CONFLICT "Ya existe un rol con ese
        nombre."
     D "¿Existe el rol solicitado?" FALLA -> 404 NOT_FOUND "El rol no existe."
     D "¿El rol tiene usuarios asignados (DELETE)?" FALLA -> 409 CONFLICT "No se puede
        eliminar un rol que tiene usuarios asignados."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
RL4. BASE DE DATOS: roles · rol_permiso · permisos · usuarios.
RL5. Capa de datos: rol.routes.ts -> rol.controller.ts -> rol.repo.ts.

--------------------------------------------------------------------------------
13_Controlador_Permiso.svg
--------------------------------------------------------------------------------
PM1. COLUMNAS base R5 (ver E1).
PM2. TABLA (2 rutas):
    GET /permisos | authorizePermission('permisos.view')
    GET /permisos/modulo/:modulo | authorizePermission('permisos.view')
PM3. RAMAS (MID-COMUN 6 con <permiso>=permisos.view) + cierre:
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
     Solo catalogo: NO hay diamantes 404 ni 409.
PM4. BASE DE DATOS: permisos.
PM5. Capa de datos: permiso.routes.ts -> permiso.controller.ts -> permiso.repo.ts.

--------------------------------------------------------------------------------
14_Controlador_Empresa.svg
--------------------------------------------------------------------------------
EM1. COLUMNAS base R5 (ver E1).
EM2. TABLA (6 rutas):
    POST /empresas/seleccionar | authorizePermission('empresas.view') + validateBody
    GET /empresas | authorizePermission('empresas.view')
    GET /empresas/:id | authorizePermission('empresas.view') + validateParams
    POST /empresas | authorizePermission('empresas.create') + validateBody
    PUT /empresas/:id | authorizePermission('empresas.edit') + validateBody
    DELETE /empresas/:id | authorizePermission('empresas.delete') + validateParams
EM3. RAMAS (MID-COMUN 6 con <permiso>=empresas.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe la sesion actual (seleccionar)?" FALLA -> 401 UNAUTHORIZED "No se pudo
        identificar la sesion actual."
     D "¿Existe la empresa solicitada?" FALLA -> 404 NOT_FOUND "La empresa no existe."
     D "¿La empresa esta activa (seleccionar)?" FALLA -> 403 FORBIDDEN "La empresa esta
        inactiva. No puedes seleccionarla."
     D "¿Ya existe una empresa con ese NIT?" FALLA -> 409 CONFLICT "Ya existe una empresa con
        ese NIT."
     D "¿Existe el rol Administrador al crear?" FALLA -> 500 INTERNAL_ERROR "No existe el rol
        Administrador en el sistema."
     (el 500 INTERNAL_ERROR de la lista MID-COMUN queda cubierto por esta rama final)
EM4. BASE DE DATOS: empresas.
EM5. Capa de datos: empresa.routes.ts -> empresa.controller.ts -> empresa.repo.ts.

--------------------------------------------------------------------------------
15_Controlador_Categoria.svg
--------------------------------------------------------------------------------
CT1. COLUMNAS base R5 (ver E1).
CT2. TABLA (5 rutas):
    GET /categorias | authorizePermission('categorias.view')
    GET /categorias/:id | authorizePermission('categorias.view') + validateParams
    POST /categorias | authorizePermission('categorias.create') + validateBody
    PUT /categorias/:id | authorizePermission('categorias.edit') + validateBody
    DELETE /categorias/:id | authorizePermission('categorias.delete') + validateParams
CT3. RAMAS (MID-COMUN 6 con <permiso>=categorias.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Ya existe una categoria con ese nombre?" FALLA -> 409 CONFLICT "Ya existe una
        categoria con ese nombre."
     D "¿Existe la categoria solicitada?" FALLA -> 404 NOT_FOUND "La categoria no existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
CT4. BASE DE DATOS: categorias.
CT5. Capa de datos: categoria.routes.ts -> categoria.controller.ts -> categoria.repo.ts.

--------------------------------------------------------------------------------
16_Controlador_Bodega.svg
--------------------------------------------------------------------------------
BG1. COLUMNAS base R5 (ver E1).
BG2. TABLA (5 rutas):
    GET /bodegas | authorizePermission('bodegas.view')
    GET /bodegas/:id | authorizePermission('bodegas.view') + validateParams
    POST /bodegas | authorizePermission('bodegas.create') + validateBody
    PUT /bodegas/:id | authorizePermission('bodegas.edit') + validateBody
    DELETE /bodegas/:id | authorizePermission('bodegas.delete') + validateParams
BG3. RAMAS (MID-COMUN 6 con <permiso>=bodegas.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Ya existe una bodega con ese codigo?" FALLA -> 409 CONFLICT "Ya existe una bodega
        con ese codigo."
     D "¿Existe la bodega solicitada?" FALLA -> 404 NOT_FOUND "La bodega no existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
BG4. BASE DE DATOS: bodegas.
BG5. Capa de datos: bodega.routes.ts -> bodega.controller.ts -> bodega.repo.ts.

--------------------------------------------------------------------------------
17_Controlador_Producto.svg
--------------------------------------------------------------------------------
PR1. COLUMNAS base R5 (ver E1).
PR2. TABLA (7 rutas):
    GET /productos | authorizePermission('productos.view')
    GET /productos/stock-bajo | authorizePermission('inventario.view')
    GET /productos/:id | authorizePermission('productos.view') + validateParams
    POST /productos | authorizePermission('productos.create') + validateBody
    PUT /productos/:id | authorizePermission('productos.edit') + validateBody
    PATCH /productos/:id/estado | authorizePermission('productos.edit') + validateBody
    DELETE /productos/:id | authorizePermission('productos.delete') + validateParams
PR3. RAMAS (MID-COMUN 6 con <permiso>=productos.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Ya existe un producto con ese codigo?" FALLA -> 409 CONFLICT "Ya existe un producto
        con ese codigo."
     D "¿Existe el producto solicitado?" FALLA -> 404 NOT_FOUND "El producto no existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
PR4. BASE DE DATOS: productos · categorias · bodegas.
PR5. Capa de datos: producto.routes.ts -> producto.controller.ts -> producto.repo.ts.

--------------------------------------------------------------------------------
18_Controlador_Movimiento.svg
--------------------------------------------------------------------------------
MV1. COLUMNAS base R5 (ver E1).
MV2. TABLA (4 rutas):
    GET /movimientos | authorizePermission('movimientos.view') + validateQuery
    GET /movimientos/:id | authorizePermission('movimientos.view') + validateParams
    POST /movimientos | authorizePermission('recepcion.create') + validateBody
    DELETE /movimientos/:id | authorizePermission('recepcion.delete') + validateParams
MV3. RAMAS (MID-COMUN 6 con <permiso>=movimientos.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe el movimiento solicitado?" FALLA -> 404 NOT_FOUND "El movimiento no existe."
     D "¿FK producto/bodega valida al crear?" FALLA -> 409 CONFLICT "La referencia a producto
        o bodega no existe (FK)."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
MV4. NOTA DE NEGOCIO en caja VERDE (NO es rama de error): "Al crear ENTRADA: stock += cantidad,
    ocupado += cantidad; al crear SALIDA: stock = GREATEST(0, stock - cantidad), ocupado = LEAST(
    capacidad, GREATEST(0, ocupado - cantidad)). Nunca negativos ni rebasa capacidad. DELETE no
    revierte stock." - Deja esta nota SEPARADA de las ramas de error.
MV5. BASE DE DATOS: movimientos_inventario · productos · bodegas.
MV6. Capa de datos: movimiento.routes.ts -> movimiento.controller.ts -> movimiento.repo.ts.

--------------------------------------------------------------------------------
19_Controlador_Recepcion.svg
--------------------------------------------------------------------------------
RC1. COLUMNAS base R5 (ver E1).
RC2. TABLA (5 rutas):
    GET /recepciones | authorizeAnyPermission('recepcion.view','historial.view')
    GET /recepciones/:id | authorizeAnyPermission('recepcion.view','historial.view') + validateParams
    POST /recepciones | authorizePermission('recepcion.create') + validateBody
    PUT /recepciones/:id | authorizePermission('recepcion.edit') + validateBody
    DELETE /recepciones/:id | authorizePermission('recepcion.delete') + validateParams
RC3. RAMAS (MID-COMUN 6 con <permiso>=recepcion.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe la recepcion solicitada?" FALLA -> 404 NOT_FOUND "La recepcion no existe."
     D "¿Ya existe ese numero de documento?" FALLA -> 409 CONFLICT "Ya existe una recepcion
        con ese documento."
     D "¿FK de producto en el detalle?" FALLA -> 409 CONFLICT "Uno de los productos del
        detalle no existe (FK)."
     D "¿Fallo al insertar cabecera+detalle?" FALLA -> 500 INTERNAL_ERROR "Transaccion
        revertida (ROLLBACK)."
     (el 500 INTERNAL_ERROR de la lista MID-COMUN queda cubierto por esta rama final)
RC4. NOTA: POST inserta cabecera + detalle en TRANSACCION (rollback si falla el detalle).
RC5. BASE DE DATOS: recepciones · recepcion_detalle · productos · usuarios · bodegas.
RC6. Capa de datos: recepcion.routes.ts -> recepcion.controller.ts -> recepcion.repo.ts.

--------------------------------------------------------------------------------
20_Controlador_Auditoria.svg
--------------------------------------------------------------------------------
AU1. COLUMNAS base R5 (ver E1).
AU2. TABLA (2 rutas):
    GET /auditorias | authorizePermission('auditoria.view')
    GET /auditorias/:id | authorizePermission('auditoria.view') + validateParams
AU3. RAMAS (MID-COMUN 6 con <permiso>=auditoria.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe el registro de auditoria?" FALLA -> 404 NOT_FOUND "El registro de auditoria
        no existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
AU4. BASE DE DATOS: auditorias · usuarios.
AU5. Capa de datos: auditoria.routes.ts -> auditoria.controller.ts -> auditoria.repo.ts.

--------------------------------------------------------------------------------
21_Controlador_Incidencia.svg
--------------------------------------------------------------------------------
IN1. COLUMNAS base R5 (ver E1).
IN2. TABLA (5 rutas):
    GET /incidencias | authorizePermission('incidencias.view')
    GET /incidencias/:id | authorizePermission('incidencias.view') + validateParams
    POST /incidencias | authorizePermission('incidencias.create') + validateBody
    PUT /incidencias/:id | authorizePermission('incidencias.edit') + validateBody
    DELETE /incidencias/:id | authorizePermission('incidencias.delete') + validateParams
IN3. RAMAS (MID-COMUN 6 con <permiso>=incidencias.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe la incidencia solicitada?" FALLA -> 404 NOT_FOUND "La incidencia no existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
IN4. BASE DE DATOS: incidencias · usuarios.
IN5. Capa de datos: incidencia.routes.ts -> incidencia.controller.ts -> incidencia.repo.ts.

--------------------------------------------------------------------------------
22_Controlador_Mantenimiento.svg
--------------------------------------------------------------------------------
MT1. COLUMNAS base R5 (ver E1).
MT2. TABLA (5 rutas):
    GET /mantenimientos | authorizePermission('mantenimiento.view')
    GET /mantenimientos/:id | authorizePermission('mantenimiento.view') + validateParams
    POST /mantenimientos | authorizePermission('mantenimiento.create') + validateBody
    PUT /mantenimientos/:id | authorizePermission('mantenimiento.edit') + validateBody
    DELETE /mantenimientos/:id | authorizePermission('mantenimiento.delete') + validateParams
MT3. RAMAS (MID-COMUN 6 con <permiso>=mantenimiento.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Existe el mantenimiento solicitado?" FALLA -> 404 NOT_FOUND "El mantenimiento no
        existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
MT4. BASE DE DATOS: mantenimientos · usuarios.
MT5. Capa de datos: mantenimiento.routes.ts -> mantenimiento.controller.ts -> mantenimiento.repo.ts.

--------------------------------------------------------------------------------
23_Controlador_Sesion.svg
--------------------------------------------------------------------------------
SE1. COLUMNAS base R5 (ver E1).
SE2. TABLA (3 rutas):
    GET /sesiones | authorizePermission('sesiones.view')
    POST /sesiones/cerrar-otras | authorizePermission('sesiones.delete')
    DELETE /sesiones/:id | authorizePermission('sesiones.delete') + validateParams
SE3. RAMAS (MID-COMUN 6 con <permiso>=sesiones.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Hay sesion actual (sesionId en req.user)?" FALLA -> 401 UNAUTHORIZED "No se pudo
        identificar la sesion actual."
     D "¿Existe la sesion solicitada?" FALLA -> 404 NOT_FOUND "La sesion no existe."
     D "¿Intentas cerrar TU sesion actual?" FALLA -> 403 FORBIDDEN "No puedes cerrar la
        sesion actual desde aqui."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
SE4. BASE DE DATOS: sesiones · usuarios.
SE5. Capa de datos: sesion.routes.ts -> sesion.controller.ts -> sesion.repo.ts.

--------------------------------------------------------------------------------
24_Controlador_Notificacion.svg
--------------------------------------------------------------------------------
NO1. COLUMNAS base R5 (ver E1).
NO2. TABLA (3 rutas):
    GET /notificaciones | authorizePermission('notificaciones.view')
    PATCH /notificaciones/:id/leida | authorizePermission('notificaciones.view') + validateBody
    POST /notificaciones/leidas | authorizePermission('notificaciones.view')
NO3. RAMAS (MID-COMUN 6 con <permiso>=notificaciones.view) + ESPECIFICAS, una tarjeta cada una:
     D "¿Usuario autenticado en la peticion (req.user)?" FALLA -> 401 UNAUTHORIZED "No
        autenticado."
     D "¿Existe la notificacion solicitada?" FALLA -> 404 NOT_FOUND "La notificacion no
        existe."
     D "¿Fallo inesperado en service/SQL?" FALLA -> 500 INTERNAL_ERROR "Error interno del
        servidor."
NO4. BASE DE DATOS: notificaciones.
NO5. Capa de datos: notificacion.routes.ts -> notificacion.controller.ts -> notificacion.repo.ts.

--------------------------------------------------------------------------------
25_Controlador_Configuracion.svg
--------------------------------------------------------------------------------
CF1. COLUMNAS base R5.
CF2. TABLA: GET /configuracion | 'configuracion.view' · PUT /configuracion |
    'configuracion.edit'+validateBody.
CF3. RAMAS INDIVIDUALES:
    PUT /configuracion: D "¿Body vacio?" FALLA -> 400 BAD_REQUEST "No se enviaron configuraciones
        para actualizar."
    comunes: 401/403/500 individuales -> errorHandler.

--------------------------------------------------------------------------------
26_Controlador_Dashboard.svg
--------------------------------------------------------------------------------
DB1. COLUMNAS base R5.
DB2. TABLA: GET /dashboard/resumen | authorizePermission('dashboard.view').
DB3. RAMAS: comunes 401/403/500 individuales (no tiene 404/409: es agregacion de datos).

--------------------------------------------------------------------------------
27_Controlador_Reporte.svg
--------------------------------------------------------------------------------
RP1. COLUMNAS base R5.
RP2. TABLA: GET /reportes/inventario · /reportes/movimientos · /reportes/stock ·
    /reportes/auditorias · /reportes/incidencias (todas con 'reportes.view').
RP3. RAMAS: comunes 401/403/400/500 · D "¿Hay datos?" FALLA -> 404 NOT_FOUND "Sin datos."
    (por cada reporte su diamante).

--------------------------------------------------------------------------------
28_Ciclo_Completo_Ida_Vuelta.svg
--------------------------------------------------------------------------------
CCV1. Seccion "1) IDA (SOLICITUD) - EL MID INTEGRA AMBOS LADOS". Fila de 6 cajas:
    Pagina Angular (#DEE6EE) -> "Interceptor (MID CLIENTE)" (#F0E4E4 borde ROJO): "agrega
    Authorization: Bearer <jwt>" -> "express app: app.use('/api', apiRateLimiter) / app.use('/api',
    apiRoutes)" -> "Middleware (MID API)" (#F0E4E4 borde ROJO): "validate(Zod) -> authenticate
    (JWT+sesion) -> authorize" -> "Controller: controlador + service" -> "Repository / SQL:
    pg -> PostgreSQL".
CCV2. RAMAS DE ERROR INDIVIDUALES de la IDA (debajo de la caja de Middleware):
    D "¿Limite superado?" FALLA -> 429. D "¿DTO valido?" FALLA -> 400. D "¿Token?" FALLA -> 401.
    D "¿Sesion activa?" FALLA -> 401. D "¿Permiso?" FALLA -> 403. D "¿Regla de negocio?" FALLA ->
    404/409. Cada una con su caja individual y flecha -> errorHandler.
CCV3. Franja ROJA: "El MID NO revalida nada en la vuelta: la respuesta no vuelve a pasar por
    authenticate/authorize/validate."
CCV4. Seccion "2) VUELTA (RESPUESTA) - CRUD -> CLIENTE SIN VOLVER POR EL MID". Fila de 6 cajas:
    PostgreSQL -> "Repo / Service: devuelve filas" -> "response.ts: ok()/created()/noContent()" ->
    "HTTP 200/201: JSON {success,message,data}" -> "Interceptor (solo reacciona)" (#DEEAE2)"200 pasa
    directo; error -> toast / 401 login" -> "Componente: renderiza segun res.data".
CCV5. Nota: en la vuelta NO hay diamantes de MID; solo la "reaccion" del interceptor se explica
    como caja, no como rama de error del sistema.

--------------------------------------------------------------------------------
29_Retorno_Sin_MID.svg
--------------------------------------------------------------------------------
RS1. Seccion "RESPUESTAS DE EXITO (2xx)" 3 cajas VERDE SUAVE:
    ok() 200 {success:true,message,data} · created() 201 · noContent() 200 {data:null}.
    Franja verde: "Estas respuestas NO pasan por ninguna validacion del MID: llegan tal cual al
    componente."
RS2. Seccion "RESPUESTAS DE ERROR - CADA UNA SU RAMA EN EL INTERCEPTOR" (diamantes + cajas
    individuales, NO tabla):
    D "¿Status 401 y ruta != /auth/login?" FALLA -> caja roja "limpia localStorage, toast 'Tu sesion
    ha expirado', redirige a /auth/login".
    D "¿Status 400/403/404/409/429/500?" FALLA -> caja roja "toast con el message del backend".
    D "¿Status 2xx?" SI -> caja verde "se devuelve res.data directamente al componente".
    Cada rama parte del "Response del interceptor (ApiResponse)".

--------------------------------------------------------------------------------
30_Publicos_Sin_MID.svg
--------------------------------------------------------------------------------
PS1. Seccion "RUTAS PUBLICAS (sin authenticate/authorize)" tabla (Ruta | Validacion):
    GET / | info de la app
    GET /api/docs | Swagger UI
    GET /api/health | estado del servicio
    POST /api/auth/login | validateBody(loginSchema) + loginEmailLimiter(5) + loginIpLimiter(60)
    POST /api/auth/recuperar | recuperacionLimiter + validateBody(solicitar...)
    POST /api/auth/recuperar/validar | validateBody(validar...)
    POST /api/auth/recuperar/restablecer | validateBody(restablecer...)
PS2. Seccion "FLUJO LOGIN SIN MID" 6 cajas en fila: Login.ts -> POST /api/auth/login -> validateBody
    -> rate limits -> auth.controller (bcrypt.compare) -> Genera JWT (exp 8h + sesion Activa) ->
    ok(200){token,usuario,permisos}.
PS3. RAMAS INDIVIDUALES del login publico (sin MID):
    D "¿DTO valido?" FALLA -> 400. D "¿Email bloqueado?" FALLA -> 429 email. D "¿IP bloqueada?"
    FALLA -> 429 IP. D "¿Credenciales?" FALLA -> 401 "Las credenciales ingresadas no son validas."
    D "¿Cuenta activa?" FALLA -> 403. D "¿Rol activo?" FALLA -> 403. D "¿Permisos?" FALLA -> 500.
    Cada rama con su caja individual -> errorHandler.

--------------------------------------------------------------------------------
31_Pipeline_app_ts.svg
--------------------------------------------------------------------------------
PA1. Fila de 8 cajas: helmet() -> cors() -> express.json/urlencoded (2mb) -> /api/docs (swagger) ->
    GET / (info) -> "/api (apiRoutes): apiRateLimiter(500) + 18 routers" (#F0E4E4) -> "404: ruta no
    existe, NOT_FOUND" -> "errorHandler: normaliza errores" (#F0E4E4).
PA2. RAMAS DE ERROR del pipeline (diamantes individuales debajo de /api y de errorHandler):
    tras /api: D "¿Todo pase el rate limit?" FALLA -> 429: "Demasiadas solicitudes. Espera unos
        minutos e intenta de nuevo." -> JSON.
    404: D "¿La ruta existe?" FALLA -> caja 404 NOT_FOUND "La ruta solicitada no existe." -> JSON.
    errorHandler: D "¿ApiError?" FALLA -> JSON con su code. D "¿PG 23505?" FALLA -> 409
        DUPLICATE_KEY. D "¿PG 23503?" FALLA -> 409 FOREIGN_KEY_VIOLATION. D "¿PG 23502?" FALLA ->
        400. D "¿PG 22P02?" FALLA -> 400. D "¿Otro?" FALLA -> 500 INTERNAL_ERROR.
PA3. Tabla "DETALLE app.use('/api', apiRateLimiter, apiRoutes)": apiRoutes | monta un router por
    controlador prefijo /api · apiRateLimiter | 500/15min/IP -> 429 · Routers | 18 listados.

--------------------------------------------------------------------------------
32_Rutas_Frontend_Protegidas.svg
--------------------------------------------------------------------------------
RF1. Tabla de 3 columnas (Ruta | Guard | Permiso requerido) - 20 filas (las mismas listadas abajo).
RF2. RAMAS DEL GUARD (permissionGuard, cada una individual):
    D "¿Hay sesion (token)?" FALLA -> "limpia localStorage y redirige a /auth/login".
    D "¿Permiso/anyPermission cumple?" FALLA -> caja "toast 'Acceso denegado' y redirige a la ruta
        inicial del rol".
    D "¿Rol permitido (roleGuard)?" FALLA -> caja "redirige a ruta inicial".
    Filas exactas:
    / (pagina) | sin guard | publica
    /auth/login | sin guard | publica
    /auth/recuperar-contrasena | sin guard | publica
    /auth/crear-usuario | permissionGuard | data.permission: usuarios.create
    /auth/sesiones-activas | permissionGuard | data.permission: sesiones.view
    /app/panel | permissionGuard | data.permission: dashboard.view
    /app/empresas | permissionGuard | data.permission: empresas.view
    /app/registrar-empresa | permissionGuard | data.permission: empresas.create
    /app/gestion/inventario/lista-productos | permissionGuard | data.permission: productos.view
    /app/gestion/inventario/registrar-productos | permissionGuard | data.permission: productos.create
    /app/gestion/inventario/bodegas | permissionGuard | data.permission: bodegas.view
    /app/gestion/inventario/categorias | permissionGuard | data.permission: categorias.view
    /app/recepcion/recepcion-mercancias | permissionGuard | data.anyPermission [recepcion.view, recepcion.create]
    /app/recepcion/historial-logistico | permissionGuard | data.permission: historial.view
    /app/gestion/auditorias | permissionGuard | data.permission: auditoria.view
    /app/gestion/roles-yusuarios | permissionGuard | data.anyPermission [usuarios.view, roles.view]
    /app/reportes | permissionGuard | data.permission: reportes.view
    /app/configuracion | permissionGuard | data.permission: configuracion.view
    /app/programacion | permissionGuard | data.anyPermission [mantenimiento.view, mantenimiento.create]
    /app/incidencias | permissionGuard | data.anyPermission [incidencias.view, incidencias.create]

--------------------------------------------------------------------------------
33_Mapa_Paginas_Endpoints.svg
--------------------------------------------------------------------------------
MP1. Tabla de 3 columnas (Pagina | Endpoints llamados | MID?):
    Login | POST /api/auth/login | publica (verde)
    Recuperacion | POST /auth/recuperar · /validar · /restablecer | publica (verde)
    Crear usuario | GET /roles/basicos · POST /usuarios | MID (rojo)
    Sesiones activas | GET /sesiones · POST /sesiones/cerrar-otras · DELETE /sesiones/:id | MID (rojo)
    Panel | GET /dashboard/resumen · GET /empresas | MID (rojo)
    Empresas | GET/POST /empresas · POST /empresas/seleccionar | MID (rojo)
    Registrar empresa | POST /empresas (+ seleccionar) | MID (rojo)
    Inventario | /productos CRUD · /productos/stock-bajo · /categorias · /bodegas | MID (rojo)
    Recepcion | /productos · /bodegas · /movimientos · /recepciones | MID (rojo)
    Historial logistico | GET /movimientos · GET /recepciones | MID (rojo)
    Auditorias | GET /auditorias | MID (rojo)
    Roles y usuarios | /usuarios · /roles · /roles/basicos · /permisos · PUT /roles/:id/permisos | MID (rojo)
    Configuracion | GET/PUT /configuracion · GET /sesiones | MID (rojo)
    Mantenimiento | /mantenimientos CRUD | MID (rojo)
    Incidencias | /incidencias CRUD | MID (rojo)
    Reportes | GET /reportes/inventario · /movimientos · /stock · /auditorias · /incidencias | MID (rojo)
    Header | GET /notificaciones · POST /notificaciones/leidas | MID (rojo)
MP2. Pie: "Todas las llamadas pasan por apiInterceptor (Bearer + manejo de errores). Las rutas
    publicas (login, recuperacion) no tienen token: el interceptor no adjunta Authorization."

--------------------------------------------------------------------------------
34_Errores_Cliente.svg
--------------------------------------------------------------------------------
EC1. Seccion "MANEJO DE ERRORES EN EL CLIENTE (CADA UNO SU RAMA)".
    Desde la caja central "Respuesta del API (ApiResponse)" dibuja, CADA uno con su DIAMANTE y su
    caja individual de color:
    D "¿Status 200/201?" SI -> caja verde "se devuelve res.data; el componente usa data para pintar".
    D "¿Status 400?" FALLA -> caja roja "toast con error.message (validacion)". 
    D "¿Status 401 y ruta != /auth/login?" FALLA -> caja roja "limpia localStorage, toast 'Tu sesion
        ha expirado', redirige a /auth/login".
    D "¿Status 403?" FALLA -> caja roja "toast 'No tienes permiso para realizar esta accion'".
    D "¿Status 404?" FALLA -> caja roja "toast con message; listados vacios".
    D "¿Status 409?" FALLA -> caja roja "toast con message (duplicado/FK)".
    D "¿Status 429?" FALLA -> caja roja "toast 'Demasiados intentos, intente mas tarde'".
    D "¿Status 500?" FALLA -> caja roja "toast generico; se logea en consola".
    D "¿Sin conexion/network?" FALLA -> caja roja "toast de error de red; timeouts de api.service".
EC2. Seccion "FLUJO DEL INTERCEPTOR (api.interceptor.ts)":
    request -> D "¿Existe token?" SI -> "agrega Authorization: Bearer <jwt>"; NO -> "no agrega nada".
    response -> 200/201 -> "devuelve res.data" (verde); 401 != login -> "expira sesion y redirige";
    otro -> "toast con message" (cada uno como rama individual, no agrupado).

================================================================================
LISTA DE VERIFICACION FINAL (repasa para CADA uno de los 34):
[ ] 1600x1200 apaisado, marco negro, margen 50, nada sale del lienzo.
[ ] Cabecera negra con TITULO + SUBTITULO SIN tildes.
[ ] Estilo Paint: solo rectangulos, rombos, lineas y flechas, 2D planas.
[ ] CADA error tiene SU propio diamante, SU flecha FALLA y SU caja con mensaje EXACTO.
[ ] NINGUN error esta agrupado en listas: todos son ramas independientes que bajan al errorHandler.
[ ] Los diamantes respetan el orden: rateLimit -> validate -> authenticate -> authorize -> reglas
    de negocio -> repo(PG) -> errorHandler.
[ ] Flujo CLIENTE -> MID -> API -> BASE DE DATOS visible; la VUELTA verde no atraviesa el MID.
[ ] Rutas y permisos EXACTOS (sin inventar).
[ ] Diamantes especificos presentes: auth (7), usuario (email, rol, propio), rol (usuarios
    asignados), empresa (sesionId, activa, NIT), sesion (sesion actual), configuracion (body
    vacio), movimiento (nota verde NO es error).
================================================================================
FIN DEL PROMPT