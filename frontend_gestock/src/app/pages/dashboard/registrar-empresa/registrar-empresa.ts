import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService, Empresa, EmpresaBackend } from '../../../services/estadisticas.service';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

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
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-empresa.html',
  styleUrls: ['./registrar-empresa.css']
})
export class RegistrarEmpresaComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private estadisticasService = inject(EstadisticasService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Propiedad añadida para solucionar el error de plantilla al reutilizar el modal
  mostrarModalCrear: boolean = true;

  nuevaEmpresaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    moneda: ['COP - Peso Colombiano', Validators.required],
    formatoFecha: ['DD/MM/YYYY', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.router.navigate(['/app/panel']).catch(() => {
      window.location.hash = '/app/panel';
    });
  }

  crearNuevaEmpresa(): void {
    this.errorMessage.set('');

    if (this.nuevaEmpresaForm.invalid) {
      this.nuevaEmpresaForm.markAllAsTouched();
      this.errorMessage.set('Error: Por favor, complete correctamente los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);

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
        this.registrarYEntrar(
          String(creada.id),
          creada,
          valores.adminEmail.trim(),
          valores.adminPassword
        );
      })
      .catch(() => {
        this.isLoading.set(false);
        this.errorMessage.set('Error: Ocurrió un error al guardar la empresa.');
        this.toastService.mostrar('No se pudo registrar la empresa en este momento.', 'error', 'Empresa registrada');
      });
  }

  private registrarYEntrar(
    empresaId: string,
    creada: EmpresaBackend,
    adminEmail: string,
    adminPassword: string
  ): void {
    this.apiService
      .post<LoginEmpresaResultado>('/empresas/seleccionar', {
        empresaId: Number(empresaId),
        email: adminEmail,
        password: adminPassword
      })
      .then((data) => {
        const nuevaEmpresa: Empresa = {
          id: empresaId,
          nombre: creada.nombre,
          email: creada.correo,
          moneda: creada.moneda,
          formatoFecha: creada.formato_fecha,
          bodegasActivas: 0,
          totalPrecios: 0,
          valorInventario: 0,
          alertasStock: 0
        };

        const empresaItem = {
          id: nuevaEmpresa.id,
          nombre: nuevaEmpresa.nombre,
          email: nuevaEmpresa.email,
          moneda: nuevaEmpresa.moneda,
          formatoFecha: nuevaEmpresa.formatoFecha,
          estado: 'Activa'
        };

        this.authService.guardarEstadoSesion(data.token, { ...data.usuario, empresaId: data.usuario.empresaId ?? undefined });
        localStorage.setItem('empresa_activa', JSON.stringify(empresaItem));
        localStorage.setItem('gestock_empresa_activa', JSON.stringify(empresaItem));
        localStorage.setItem('empresaIdSeleccionada', String(data.usuario.empresaId ?? empresaId));

        this.estadisticasService.cambiarEmpresaActiva(nuevaEmpresa);
        void this.estadisticasService.cargarDatos();

        this.isLoading.set(false);
        this.toastService.mostrar('La empresa fue registrada correctamente.', 'success', 'Empresa registrada');
        this.router.navigate(['/app/panel']).catch(() => {
          window.location.hash = '/app/panel';
        });
      })
      .catch(() => {
        this.isLoading.set(false);
        this.errorMessage.set('Error: La empresa se creó, pero no fue posible ingresar con las credenciales. Inténtalo desde Empresas.');
        this.toastService.mostrar('La empresa se creó. Ingresa con tus credenciales desde la sección Empresas.', 'info', 'Empresa registrada');
        this.router.navigate(['/app/empresas']).catch(() => {
          window.location.hash = '/app/empresas';
        });
      });
  }
}