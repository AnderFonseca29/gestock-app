export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'GESTOCK API',
    version: '1.0.0',
    description:
      'API REST del sistema de gestión de inventario GESTOCK. Autenticación JWT + RBAC por permisos. Para probar los endpoints usa el token que devuelve POST /api/auth/login.',
  },
  servers: [{ url: '/api', description: 'Servidor local' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Inicia sesión y devuelve token JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@gestock.com' },
                  password: { type: 'string', example: 'Admin2026!' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Inicio de sesión exitoso' }, 401: { description: 'Credenciales inválidas' } },
      },
    },
    '/auth/perfil': {
      get: {
        tags: ['Autenticación'],
        summary: 'Obtiene el perfil del usuario autenticado',
        responses: { 200: { description: 'Perfil del usuario' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Autenticación'],
        summary: 'Cierra la sesión actual',
        responses: { 200: { description: 'Sesión cerrada' } },
      },
    },
    '/auth/contrasena': {
      put: {
        tags: ['Autenticación'],
        summary: 'Cambia la contraseña del usuario autenticado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['passwordActual', 'nuevaPassword'],
                properties: {
                  passwordActual: { type: 'string' },
                  nuevaPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Contraseña actualizada' } },
      },
    },
    '/dashboard/resumen': {
      get: {
        tags: ['Dashboard'],
        summary: 'Resumen de indicadores para el panel principal',
        responses: { 200: { description: 'Indicadores del panel' } },
      },
    },
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Lista los usuarios del sistema',
        parameters: [
          { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          { name: 'filtroRol', in: 'query', schema: { type: 'string' } },
          { name: 'estado', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Lista de usuarios' } },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crea un nuevo usuario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'apellido', 'email', 'password', 'rolId'],
                properties: {
                  nombre: { type: 'string' },
                  apellido: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  rolId: { type: 'number' },
                  empresaId: { type: 'number', nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Usuario creado' }, 409: { description: 'Correo duplicado' } },
      },
    },
    '/usuarios/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Usuarios'],
        summary: 'Detalle de un usuario',
        responses: { 200: { description: 'Detalle del usuario' }, 404: { description: 'No encontrado' } },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualiza los datos de un usuario',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { nombre: { type: 'string' }, apellido: { type: 'string' }, rolId: { type: 'number' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Usuario actualizado' } },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Elimina un usuario',
        responses: { 200: { description: 'Usuario eliminado' } },
      },
    },
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Lista los roles con sus permisos',
        responses: { 200: { description: 'Lista de roles' } },
      },
      post: {
        tags: ['Roles'],
        summary: 'Crea un rol con permisos',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string' },
                  descripcion: { type: 'string' },
                  permisoIds: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Rol creado' } },
      },
    },
    '/roles/{id}/permisos': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      put: {
        tags: ['Roles'],
        summary: 'Asigna permisos a un rol',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permisoIds'],
                properties: { permisoIds: { type: 'array', items: { type: 'integer' } } },
              },
            },
          },
        },
        responses: { 200: { description: 'Permisos asignados' } },
      },
    },
    '/permisos': {
      get: {
        tags: ['Permisos'],
        summary: 'Lista permisos por módulo',
        responses: { 200: { description: 'Permisos' } },
      },
    },
    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Lista los productos',
        parameters: [
          { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          { name: 'categoriaId', in: 'query', schema: { type: 'integer' } },
          { name: 'bodegaId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Lista de productos' } },
      },
      post: {
        tags: ['Productos'],
        summary: 'Registra un producto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codigo', 'nombre', 'precio', 'stock'],
                properties: {
                  codigo: { type: 'string' },
                  nombre: { type: 'string' },
                  categoriaId: { type: 'integer', nullable: true },
                  bodegaId: { type: 'integer', nullable: true },
                  precio: { type: 'number' },
                  costo: { type: 'number' },
                  stock: { type: 'integer' },
                  stockMin: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Producto creado' } },
      },
    },
    '/movimientos': {
      get: {
        tags: ['Inventario'],
        summary: 'Lista los movimientos de inventario con totales',
        parameters: [
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA'] } },
          { name: 'estado', in: 'query', schema: { type: 'string' } },
          { name: 'desde', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Movimientos y totales' } },
      },
      post: {
        tags: ['Inventario'],
        summary: 'Registra un movimiento ENTRADA/SALIDA/TRANSFERENCIA',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tipo', 'cantidad', 'motivo', 'responsable'],
                properties: {
                  productoId: { type: 'integer', nullable: true },
                  bodegaId: { type: 'integer', nullable: true },
                  tipo: { type: 'string', enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA'] },
                  cantidad: { type: 'integer' },
                  motivo: { type: 'string' },
                  responsable: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Movimiento creado' } },
      },
    },
    '/categorias': {
      get: { tags: ['Categorías'], summary: 'Lista las categorías', responses: { 200: { description: 'Categorías' } } },
      post: {
        tags: ['Categorías'],
        summary: 'Crea una categoría',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string' }, descripcion: { type: 'string' } } },
            },
          },
        },
        responses: { 201: { description: 'Categoría creada' } },
      },
    },
    '/bodegas': {
      get: { tags: ['Bodegas'], summary: 'Lista las bodegas', responses: { 200: { description: 'Bodegas' } } },
      post: {
        tags: ['Bodegas'],
        summary: 'Crea una bodega',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'codigo'],
                properties: {
                  nombre: { type: 'string' },
                  codigo: { type: 'string' },
                  ciudad: { type: 'string' },
                  capacidad: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Bodega creada' } },
      },
    },
    '/recepciones': {
      get: { tags: ['Recepción'], summary: 'Lista las recepciones de mercancía', responses: { 200: { description: 'Recepciones' } } },
      post: {
        tags: ['Recepción'],
        summary: 'Registra una recepción de mercancía',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['numero_documento', 'proveedor'],
                properties: {
                  numero_documento: { type: 'string' },
                  proveedor: { type: 'string' },
                  bodega_id: { type: 'integer', nullable: true },
                  estado: { type: 'string', enum: ['En Proceso', 'Validado', 'Discrepancia'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Recepción creada' } },
      },
    },
    '/incidencias': {
      get: { tags: ['Incidencias'], summary: 'Lista las incidencias', responses: { 200: { description: 'Incidencias' } } },
      post: {
        tags: ['Incidencias'],
        summary: 'Reporta una incidencia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'descripcion', 'prioridad'],
                properties: {
                  titulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  prioridad: { type: 'string', enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Incidencia creada' } },
      },
    },
    '/mantenimientos': {
      get: { tags: ['Mantenimiento'], summary: 'Lista los mantenimientos programados', responses: { 200: { description: 'Mantenimientos' } } },
      post: {
        tags: ['Mantenimiento'],
        summary: 'Programa un mantenimiento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['equipo', 'tipo', 'fecha_programada'],
                properties: {
                  equipo: { type: 'string' },
                  tipo: { type: 'string', enum: ['Preventivo', 'Correctivo', 'Predictivo'] },
                  fecha_programada: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Mantenimiento creado' } },
      },
    },
    '/auditorias': {
      get: {
        tags: ['Auditoría'],
        summary: 'Lista el historial de auditoría',
        responses: { 200: { description: 'Registros de auditoría' } },
      },
    },
    '/sesiones': {
      get: {
        tags: ['Sesiones'],
        summary: 'Lista las sesiones activas',
        parameters: [{ name: 'mias', in: 'query', schema: { type: 'boolean' } }],
        responses: { 200: { description: 'Sesiones' } },
      },
    },
    '/notificaciones': {
      get: { tags: ['Notificaciones'], summary: 'Lista las notificaciones del usuario', responses: { 200: { description: 'Notificaciones' } } },
    },
    '/configuracion': {
      get: { tags: ['Configuración'], summary: 'Obtiene la configuración del sistema', responses: { 200: { description: 'Configuración' } } },
      put: {
        tags: ['Configuración'],
        summary: 'Actualiza la configuración del sistema',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notificacionesEmail: { type: 'boolean' },
                  seguridadActiva: { type: 'boolean' },
                  dosFactores: { type: 'boolean' },
                  tiempoSesion: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Configuración actualizada' } },
      },
    },
    '/empresas': {
      get: { tags: ['Empresas'], summary: 'Lista las empresas', responses: { 200: { description: 'Empresas' } } },
      post: {
        tags: ['Empresas'],
        summary: 'Registra una empresa',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'nit', 'correo'],
                properties: { nombre: { type: 'string' }, nit: { type: 'string' }, correo: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Empresa creada' } },
      },
    },
    '/reportes/inventario': {
      get: { tags: ['Reportes'], summary: 'Reporte de inventario por categoría', responses: { 200: { description: 'Datos del reporte' } } },
    },
    '/reportes/movimientos': {
      get: { tags: ['Reportes'], summary: 'Reporte de movimientos por fecha', responses: { 200: { description: 'Datos del reporte' } } },
    },
    '/reportes/stock': {
      get: { tags: ['Reportes'], summary: 'Reporte de stock por producto', responses: { 200: { description: 'Datos del reporte' } } },
    },
    '/reportes/auditorias': {
      get: { tags: ['Reportes'], summary: 'Reporte de auditorías', responses: { 200: { description: 'Datos del reporte' } } },
    },
    '/reportes/incidencias': {
      get: { tags: ['Reportes'], summary: 'Reporte de incidencias', responses: { 200: { description: 'Datos del reporte' } } },
    },
  },
};