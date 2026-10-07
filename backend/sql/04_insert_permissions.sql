-- ============================================
-- GESTOCK - 04_insert_permissions.sql
-- Catálogo de permisos por módulo.
-- ============================================

INSERT INTO permisos (nombre, codigo, descripcion, modulo) VALUES
  -- Dashboard
  ('Ver dashboard',                               'dashboard.view',           'Ver el panel de indicadores.', 'Dashboard'),
  -- Empresas
  ('Ver empresas',                                'empresas.view',            'Consultar las empresas.', 'Empresas'),
  ('Crear empresas',                              'empresas.create',          'Registrar nuevas empresas.', 'Empresas'),
  ('Editar empresas',                             'empresas.edit',            'Actualizar datos de empresas.', 'Empresas'),
  ('Eliminar empresas',                           'empresas.delete',          'Eliminar empresas.', 'Empresas'),
  -- Usuarios
  ('Ver usuarios',                                'usuarios.view',            'Consultar el listado de usuarios.', 'Usuarios'),
  ('Crear usuarios',                              'usuarios.create',          'Registrar usuarios.', 'Usuarios'),
  ('Editar usuarios',                             'usuarios.edit',            'Actualizar usuarios y roles.', 'Usuarios'),
  ('Desactivar usuarios',                         'usuarios.desactivar',      'Activar o desactivar cuentas.', 'Usuarios'),
  ('Cambiar contraseñas de usuarios',             'usuarios.password',        'Cambiar la contraseña de otros usuarios.', 'Usuarios'),
  ('Eliminar usuarios',                           'usuarios.delete',          'Eliminar usuarios.', 'Usuarios'),
  -- Roles
  ('Ver roles',                                   'roles.view',               'Consultar roles.', 'Roles'),
  ('Crear roles',                                 'roles.create',             'Crear roles nuevos.', 'Roles'),
  ('Editar roles',                                'roles.edit',               'Actualizar roles.', 'Roles'),
  ('Eliminar roles',                              'roles.delete',             'Eliminar roles.', 'Roles'),
  ('Asignar permisos a roles',                    'roles.asignar_permisos',   'Asignar permisos a los roles.', 'Roles'),
  ('Ver permisos',                                'permisos.view',            'Consultar el catálogo de permisos.', 'Roles'),
  -- Categorías
  ('Ver categorías',                              'categorias.view',          'Consultar categorías.', 'Categorías'),
  ('Crear categorías',                            'categorias.create',        'Registrar categorías.', 'Categorías'),
  ('Editar categorías',                           'categorias.edit',          'Actualizar categorías.', 'Categorías'),
  ('Eliminar categorías',                         'categorias.delete',        'Eliminar categorías.', 'Categorías'),
  -- Bodegas
  ('Ver bodegas',                                 'bodegas.view',             'Consultar bodegas.', 'Bodegas'),
  ('Crear bodegas',                               'bodegas.create',           'Registrar bodegas.', 'Bodegas'),
  ('Editar bodegas',                              'bodegas.edit',             'Actualizar bodegas.', 'Bodegas'),
  ('Eliminar bodegas',                            'bodegas.delete',           'Eliminar bodegas.', 'Bodegas'),
  -- Productos
  ('Ver productos',                               'productos.view',           'Consultar productos.', 'Productos'),
  ('Crear productos',                             'productos.create',         'Registrar productos.', 'Productos'),
  ('Editar productos',                            'productos.edit',           'Actualizar productos.', 'Productos'),
  ('Eliminar productos',                          'productos.delete',         'Eliminar productos.', 'Productos'),
  -- Inventario
  ('Ver inventario',                              'inventario.view',          'Consultar inventario y alertas.', 'Inventario'),
  ('Registrar inventario',                        'inventario.registrar',     'Registrar ajustes de inventario.', 'Inventario'),
  ('Ver movimientos',                             'movimientos.view',         'Consultar movimientos de inventario.', 'Inventario'),
  -- Recepción
  ('Ver recepciones',                             'recepcion.view',           'Consultar recepciones de mercancía.', 'Recepción'),
  ('Crear recepciones',                           'recepcion.create',         'Registrar recepciones de mercancía.', 'Recepción'),
  ('Editar recepciones',                          'recepcion.edit',           'Actualizar recepciones.', 'Recepción'),
  ('Eliminar recepciones',                        'recepcion.delete',         'Eliminar recepciones.', 'Recepción'),
  -- Historial
  ('Ver historial logístico',                     'historial.view',           'Consultar historial logístico.', 'Historial'),
  -- Auditoría
  ('Ver auditoría',                               'auditoria.view',           'Consultar registros de auditoría.', 'Auditoría'),
  -- Reportes
  ('Ver reportes',                                'reportes.view',            'Consultar reportes.', 'Reportes'),
  ('Exportar reportes',                           'reportes.exportar',        'Exportar reportes.', 'Reportes'),
  -- Mantenimiento
  ('Ver mantenimientos',                          'mantenimiento.view',       'Consultar mantenimientos.', 'Mantenimiento'),
  ('Crear mantenimientos',                        'mantenimiento.create',     'Programar mantenimientos.', 'Mantenimiento'),
  ('Editar mantenimientos',                       'mantenimiento.edit',       'Actualizar mantenimientos.', 'Mantenimiento'),
  ('Eliminar mantenimientos',                     'mantenimiento.delete',     'Eliminar mantenimientos.', 'Mantenimiento'),
  -- Incidencias
  ('Ver incidencias',                             'incidencias.view',         'Consultar incidencias.', 'Incidencias'),
  ('Crear incidencias',                           'incidencias.create',       'Reportar incidencias.', 'Incidencias'),
  ('Editar incidencias',                          'incidencias.edit',         'Actualizar incidencias.', 'Incidencias'),
  ('Resolver incidencias',                        'incidencias.resolver',     'Resolver incidencias.', 'Incidencias'),
  ('Eliminar incidencias',                        'incidencias.delete',       'Eliminar incidencias.', 'Incidencias'),
  -- Sesiones
  ('Ver sesiones',                                'sesiones.view',            'Consultar sesiones activas.', 'Sesiones'),
  ('Cerrar sesiones',                             'sesiones.delete',          'Cerrar sesiones de usuarios.', 'Sesiones'),
  -- Notificaciones
  ('Ver notificaciones',                          'notificaciones.view',      'Consultar notificaciones.', 'Notificaciones'),
  -- Configuración
  ('Ver configuración',                           'configuracion.view',       'Consultar configuración del sistema.', 'Configuración'),
  ('Editar configuración',                        'configuracion.edit',       'Actualizar configuración del sistema.', 'Configuración')
ON CONFLICT (codigo) DO NOTHING;