import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';
import { permissionGuard } from './guards/permission-guard/permission-guard';
import { homeGuard } from './guards/home-guard/home-guard';
import { HomeRedirectComponent } from './components/home-redirect/home-redirect';

export const routes: Routes = [
  {
    path: '',
    title: 'GESTOCK - Inicio',
    loadComponent: () =>
      import('./pagina/pagina').then((m) => m.PaginaComponent),
  },
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent),
        title: 'Iniciar Sesión - Gestock'
      },
      {
        path: 'crear-usuario',
        loadComponent: () => import('./pages/auth/creacion-usuarios/creacion-usuarios').then(m => m.CreacionUsuariosComponent),
        title: 'Crear Usuario - Gestock',
        canActivate: [permissionGuard],
        data: { permission: 'usuarios.create' }
      },
      {
        path: 'recuperar-contrasena',
        loadComponent: () => import('./pages/auth/recuperacion-contrasena/recuperacion-contrasena').then(m => m.RecuperacionContrasenaComponent),
        title: 'Recuperar Contraseña - Gestock'
      },
      {
        path: 'sesiones-activas',
        loadComponent: () => import('./pages/auth/sesiones-activas/sesiones-activas').then(m => m.SesionesActivasComponent),
        title: 'Sesiones Activas - Gestock',
        canActivate: [permissionGuard],
        data: { permission: 'sesiones.view' }
      }
    ]
  },
  { path: 'dashboard', redirectTo: 'app/panel', pathMatch: 'full' },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [permissionGuard],
    children: [
      {
        path: '',
        component: HomeRedirectComponent,
        canActivate: [homeGuard]
      },
      {
        path: 'panel',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel',
        canActivate: [permissionGuard],
        data: { permission: 'dashboard.view' }
      },
      {
        path: 'panel/:id',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel',
        canActivate: [permissionGuard],
        data: { permission: 'dashboard.view' }
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/dashboard/empresa/empresa').then(m => m.EmpresasComponent),
        title: 'GESTOCK - Empresas',
        canActivate: [permissionGuard],
        data: { permission: 'empresas.view' }
      },
      {
        path: 'registrar-empresa',
        loadComponent: () => import('./pages/dashboard/registrar-empresa/registrar-empresa').then(m => m.RegistrarEmpresaComponent),
        title: 'Registrar Empresa - Gestock',
        canActivate: [permissionGuard],
        data: { permission: 'empresas.create' }
      },
      {
        path: 'gestion/inventario',
        loadComponent: () => import('./pages/gestion/inventario/inventario').then(m => m.InventarioComponent),
        canActivate: [permissionGuard],
        data: { permission: 'inventario.view' },
        children: [
          { path: '', redirectTo: 'lista-productos', pathMatch: 'full' },
          {
            path: 'lista-productos',
            loadComponent: () => import('./pages/gestion/inventario/lista-productos/lista-productos').then(m => m.ListaProductosComponent),
            canActivate: [permissionGuard],
            data: { permission: 'productos.view' }
          },
          {
            path: 'registrar-productos',
            loadComponent: () => import('./pages/gestion/inventario/registrar-productos/registrar-productos').then(m => m.RegistrarProductosComponent),
            canActivate: [permissionGuard],
            data: { permission: 'productos.create' }
          },
          {
            path: 'bodegas',
            loadComponent: () => import('./pages/gestion/inventario/bodegas/bodegas').then(m => m.BodegasComponent),
            canActivate: [permissionGuard],
            data: { permission: 'bodegas.view' }
          },
          {
            path: 'categorias',
            loadComponent: () => import('./pages/gestion/inventario/categorias/categorias').then(m => m.CategoriasComponent),
            canActivate: [permissionGuard],
            data: { permission: 'categorias.view' }
          }
        ]
      },
      {
        path: 'recepcion/recepcion-mercancias',
        title: 'GESTOCK - Recepción de Mercancías',
        loadComponent: () => import('./pages/recepcion/recepcion-mercancias/recepcion-mercancias').then(m => m.RecepcionMercanciasComponent),
        canActivate: [permissionGuard],
        data: { anyPermission: ['recepcion.view', 'recepcion.create'] }
      },
      {
        path: 'recepcion/historial-logistico',
        title: 'GESTOCK - Historial Logístico',
        loadComponent: () => import('./pages/recepcion/historial-logistico/historial-logistico').then(m => m.HistorialLogisticoComponent),
        canActivate: [permissionGuard],
        data: { permission: 'historial.view' }
      },
      {
        path: 'gestion/auditorias',
        loadComponent: () => import('./pages/gestion/auditorias/auditorias').then(m => m.AuditoriasComponent),
        canActivate: [permissionGuard],
        data: { permission: 'auditoria.view' }
      },
      {
        path: 'gestion/roles-yusuarios',
        loadComponent: () => import('./pages/gestion/roles-yusuarios/roles-yusuarios').then(m => m.RolesUsuariosComponent),
        canActivate: [permissionGuard],
        data: { anyPermission: ['usuarios.view', 'roles.view'] }
      },
      {
        path: 'reportes',
        title: 'GESTOCK - Reportes y Estadísticas',
        loadComponent: () => import('./pages/reportes/reportes').then((m) => m.ReportesComponent),
        canActivate: [permissionGuard],
        data: { permission: 'reportes.view' }
      },
      {
        path: 'configuracion',
        title: 'GESTOCK - Configuración del Sistema',
        loadComponent: () => import('./pages/configuracion/configuracion').then((m) => m.ConfiguracionComponent),
        canActivate: [permissionGuard],
        data: { permission: 'configuracion.view' }
      },
      {
        path: 'programacion',
        loadComponent: () => import('./pages/mantenimiento/programacion-mantenimiento/programacion-mantenimiento.component').then(m => m.ProgramacionMantenimientoComponent),
        title: 'Programación - Gestock',
        canActivate: [permissionGuard],
        data: { anyPermission: ['mantenimiento.view', 'mantenimiento.create'] }
      },
      {
        path: 'incidencias',
        loadComponent: () => import('./pages/mantenimiento/registro-incidencias/registro-incidencias.component').then(m => m.IncidenciasComponent),
        title: 'Incidencias - Gestock',
        canActivate: [permissionGuard],
        data: { anyPermission: ['incidencias.view', 'incidencias.create'] }
      },
      {
        path: 'diagramas',
        title: 'GESTOCK - Diagramas de Arquitectura',
        loadComponent: () => import('./pages/diagramas/diagramas').then(m => m.DiagramasComponent),
        canActivate: [permissionGuard],
        data: { permission: 'diagramas.view' }
      },
      { path: '**', redirectTo: '' }
    ],
  },
  { path: '**', redirectTo: '' }
];