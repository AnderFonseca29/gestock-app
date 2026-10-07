import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService, Empresa, EmpresaBackend } from '../../../services/estadisticas.service';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

interface EmpresaItem {
  id: string;
  nombre: string;
  email: string;
  moneda: string;
  formatoFecha: string;
  estado: 'Activa' | 'Inactiva';
}

interface LoginEmpresaResultado {
  token: string;
  sesionId: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rolId: number;
    rol: string;
    empresaId: number | null;
    permisos: string[];
  };
}

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa.html',
  styleUrls: ['./empresa.css']
})
export class EmpresasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private estadisticasService = inject(EstadisticasService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  empresasLista: EmpresaItem[] = [];
  mostrarModalCrear: boolean = false;
  nuevaEmpresaForm!: FormGroup;

  mostrarModalIngreso: boolean = false;
  empresaIngreso: EmpresaItem | null = null;
  ingresoForm!: FormGroup;
  ingresando: boolean = false;

  get empresasActivas(): number {
    return this.empresasLista.filter((e) => e.estado === 'Activa').length;
  }

  get empresasInactivas(): number {
    return this.empresasLista.filter((e) => e.estado !== 'Activa').length;
  }

  ngOnInit() {
    this.inicializarFormulario();
    this.inicializarIngresoForm();
    this.cargarDatosIniciales();
    void this.estadisticasService.cargarDatos();
  }

  inicializarFormulario() {
    this.nuevaEmpresaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      moneda: ['USD - Dólar', Validators.required],
      formatoFecha: ['DD/MM/YYYY', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  inicializarIngresoForm() {
    this.ingresoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  cargarDatosIniciales() {
    this.apiService
      .get<EmpresaBackend[]>('/empresas')
      .then((empresas) => {
        this.empresasLista = (empresas ?? []).map((empresa) => this.mapearEmpresaItem(empresa));
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.empresasLista = [];
        this.cdr.detectChanges();
        this.toastService.mostrar('No se pudieron cargar las empresas.', 'error', 'Empresas');
      });
  }

  private mapearEmpresaItem(empresa: EmpresaBackend): EmpresaItem {
    return {
      id: String(empresa.id),
      nombre: empresa.nombre,
      email: empresa.correo,
      moneda: empresa.moneda,
      formatoFecha: empresa.formato_fecha,
      estado: empresa.estado === 'Activa' ? 'Activa' : 'Inactiva'
    };
  }

  abrirModalCrear() {
    this.inicializarFormulario();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  crearNuevaEmpresa() {
    if (this.nuevaEmpresaForm.invalid) return;

    const valores = this.nuevaEmpresaForm.value;

    this.apiService
      .post<EmpresaBackend>('/empresas', {
        nombre: valores.nombre.trim(),
        nit: `NIT-${Date.now()}`,
        correo: valores.email.trim(),
        moneda: valores.moneda,
        formatoFecha: valores.formatoFecha,
        adminEmail: valores.adminEmail.trim(),
        adminPassword: valores.adminPassword,
        adminNombre: 'Administrador'
      })
      .then((creada) => {
        this.empresasLista.unshift(this.mapearEmpresaItem(creada));
        this.cerrarModalCrear();
        this.toastService.mostrar('La empresa fue creada correctamente.', 'success', 'Empresa creada');
        this.ingresarConCredenciales(String(creada.id), valores.adminEmail.trim(), valores.adminPassword);
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.toastService.mostrar('No se pudo crear la empresa. Verifica los datos e inténtalo de nuevo.', 'error', 'Empresa creada');
      });
  }

  seleccionarEmpresa(id: string) {
    const emp = this.empresasLista.find((e) => e.id === id);
    if (!emp) return;
    if (emp.estado !== 'Activa') {
      this.toastService.mostrar('Solo puedes ingresar a empresas activas.', 'error', 'Empresa inactiva');
      return;
    }
    this.empresaIngreso = emp;
    this.inicializarIngresoForm();
    this.mostrarModalIngreso = true;
    this.cdr.detectChanges();
  }

  cerrarModalIngreso() {
    this.mostrarModalIngreso = false;
    this.empresaIngreso = null;
    this.ingresando = false;
  }

  ingresarEmpresa() {
    if (!this.empresaIngreso || this.ingresoForm.invalid) return;
    this.ingresando = true;

    const email = this.ingresoForm.value.email.trim();
    const password = this.ingresoForm.value.password;

    this.apiService
      .post<LoginEmpresaResultado>('/empresas/seleccionar', {
        empresaId: Number(this.empresaIngreso.id),
        email,
        password
      })
      .then((data) => {
        this.ingresando = false;
        const emp = this.empresaIngreso!;
        this.authService.guardarEstadoSesion(data.token, { ...data.usuario, empresaId: data.usuario.empresaId ?? undefined });

        const empresaParaServicio: Empresa = {
          id: emp.id,
          nombre: emp.nombre,
          email: emp.email,
          moneda: emp.moneda,
          formatoFecha: emp.formatoFecha,
          bodegasActivas: 0,
          totalPrecios: 0,
          valorInventario: 0,
          alertasStock: 0
        };

        localStorage.setItem('empresaIdSeleccionada', String(data.usuario.empresaId ?? emp.id));
        localStorage.setItem('empresa_activa', JSON.stringify(emp));
        localStorage.setItem('gestock_empresa_activa', JSON.stringify(emp));

        this.estadisticasService.cambiarEmpresaActiva(empresaParaServicio);
        void this.estadisticasService.cargarDatos();

        this.mostrarModalIngreso = false;
        this.empresaIngreso = null;

        this.toastService.mostrar(`Ingresaste a ${emp.nombre}.`, 'success', 'Empresa seleccionada');
        this.router.navigate(['/app/panel']).catch(() => {
          window.location.hash = '/app/panel';
        });
        this.cdr.detectChanges();
      })
      .catch((err: any) => {
        this.ingresando = false;
        this.cdr.detectChanges();
        const mensaje = err?.error?.message || 'No se pudo ingresar a la empresa. Verifica tus credenciales.';
        this.toastService.mostrar(mensaje, 'error', 'Empresa seleccionada');
      });
  }

  private ingresarConCredenciales(empresaId: string, email: string, password: string) {
    this.apiService
      .post<LoginEmpresaResultado>('/empresas/seleccionar', { empresaId: Number(empresaId), email, password })
      .then((data) => {
        const emp = this.empresasLista.find((e) => e.id === empresaId);
        this.authService.guardarEstadoSesion(data.token, { ...data.usuario, empresaId: data.usuario.empresaId ?? undefined });

        const empresaParaServicio: Empresa = {
          id: empresaId,
          nombre: emp?.nombre ?? 'Empresa',
          email: emp?.email ?? email,
          moneda: emp?.moneda ?? 'COP - Peso Colombiano',
          formatoFecha: emp?.formatoFecha ?? 'DD/MM/YYYY',
          bodegasActivas: 0,
          totalPrecios: 0,
          valorInventario: 0,
          alertasStock: 0
        };

        if (emp) {
          localStorage.setItem('empresaIdSeleccionada', String(data.usuario.empresaId ?? empresaId));
          localStorage.setItem('empresa_activa', JSON.stringify(emp));
          localStorage.setItem('gestock_empresa_activa', JSON.stringify(emp));
        }

        this.estadisticasService.cambiarEmpresaActiva(empresaParaServicio);
        void this.estadisticasService.cargarDatos();

        this.router.navigate(['/app/panel']).catch(() => {
          window.location.hash = '/app/panel';
        });
      })
      .catch(() => {
        this.toastService.mostrar('La empresa se creó, pero usa tus credenciales para ingresar desde Empresas.', 'info', 'Empresa creada');
        this.router.navigate(['/app/empresas']).catch(() => {
          window.location.hash = '/app/empresas';
        });
      });
  }

  eliminarEmpresa(event: Event, id: string) {
    event.stopPropagation();

    this.apiService
      .delete(`/empresas/${id}`)
      .then(() => {
        this.empresasLista = this.empresasLista.filter((e) => e.id !== id);
        this.toastService.mostrar('La empresa fue eliminada correctamente.', 'success', 'Empresa eliminada');
        void this.estadisticasService.cargarDatos();
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.toastService.mostrar('No se pudo eliminar la empresa.', 'error', 'Empresa eliminada');
      });
  }
}