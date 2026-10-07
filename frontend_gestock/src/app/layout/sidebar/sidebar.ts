import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  section: 'PANEL' | 'GESTIÓN' | 'MANTENIMIENTO' | 'DOCUMENTACIÓN';
  permisos: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  usuarioActual: Usuario | null = null;

  menuItems: MenuItem[] = [
    // PANEL
    {
      label: 'Panel',
      icon: 'fas fa-chart-line',
      route: '/app/panel',
      section: 'PANEL',
      permisos: ['dashboard.view']
    },
    {
      label: 'Empresas',
      icon: 'fas fa-building',
      route: '/app/empresas',
      section: 'PANEL',
      permisos: ['empresas.view']
    },
    {
      label: 'Configuración',
      icon: 'fas fa-gear',
      route: '/app/configuracion',
      section: 'PANEL',
      permisos: ['configuracion.view']
    },

    // GESTIÓN
    {
      label: 'Inventario',
      icon: 'fas fa-boxes-stacked',
      route: '/app/gestion/inventario',
      section: 'GESTIÓN',
      permisos: ['inventario.view', 'productos.view', 'bodegas.view', 'categorias.view']
    },
    {
      label: 'Recepción',
      icon: 'fas fa-inbox',
      route: '/app/recepcion/recepcion-mercancias',
      section: 'GESTIÓN',
      permisos: ['recepcion.view', 'recepcion.create']
    },
    {
      label: 'Historial Logístico',
      icon: 'fas fa-clipboard-list',
      route: '/app/recepcion/historial-logistico',
      section: 'GESTIÓN',
      permisos: ['historial.view']
    },
    {
      label: 'Auditorías',
      icon: 'fas fa-file-lines',
      route: '/app/gestion/auditorias',
      section: 'GESTIÓN',
      permisos: ['auditoria.view']
    },
    {
      label: 'Roles y Usuarios',
      icon: 'fas fa-user',
      route: '/app/gestion/roles-yusuarios',
      section: 'GESTIÓN',
      permisos: ['usuarios.view', 'roles.view']
    },
    {
      label: 'Reportes',
      icon: 'fas fa-chart-line',
      route: '/app/reportes',
      section: 'GESTIÓN',
      permisos: ['reportes.view']
    },

    // MANTENIMIENTO
    {
      label: 'Programación',
      icon: 'fas fa-screwdriver-wrench',
      route: '/app/programacion',
      section: 'MANTENIMIENTO',
      permisos: ['mantenimiento.view', 'mantenimiento.create']
    },
    {
      label: 'Incidencias',
      icon: 'fas fa-triangle-exclamation',
      route: '/app/incidencias',
      section: 'MANTENIMIENTO',
      permisos: ['incidencias.view', 'incidencias.create']
    },

    // DOCUMENTACIÓN
    {
      label: 'Diagramas',
      icon: 'fas fa-diagram-project',
      route: '/app/diagramas',
      section: 'DOCUMENTACIÓN',
      permisos: ['diagramas.view']
    }
  ];

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  esPermitido(permisos: string[]): boolean {
    return permisos.some((codigo) => this.authService.tienePermiso(codigo));
  }

  tieneItemsVisibles(section: string): boolean {
    return this.menuItems.some(item => item.section === section && this.esPermitido(item.permisos));
  }
}