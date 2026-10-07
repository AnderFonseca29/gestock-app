import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RolesUsuariosService } from './services/services';
import type { UsuarioApi, RolBasico, RolConPermisos, Permiso } from './services/services';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

interface UsuarioVista {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  rolId: number;
  activo: boolean;
  estadoTexto: string;
  estado: string;
  horasTrabajadas: number;
}

interface RolFormValores {
  nombreRol: string;
  descripcion: string;
}

interface NuevoUsuarioValores {
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  horasTrabajadas: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-yusuarios.html',
  styleUrls: ['./roles-yusuarios.css']
})
export class RolesUsuariosComponent implements OnInit {
  private service = inject(RolesUsuariosService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  get usuarioActualId(): number | undefined {
    return this.authService.usuarioActual()?.id;
  }

  // Lista de usuarios cargada desde la API
  listaUsuarios: UsuarioVista[] = [];

  // Roles y permisos cargados desde la API
  rolesBasicos: RolBasico[] = [];
  rolesConPermisos: RolConPermisos[] = [];
  permisoCatalogo: Permiso[] = [];
  listaPermisosDisponibles: string[] = [];

  usuarioSeleccionado: UsuarioVista | null = null;
  modoCrear: boolean = false;
  enviando: boolean = false;

  usuarioPassword: UsuarioVista | null = null;
  passwordForm!: FormGroup;
  enviandoPassword: boolean = false;

  nuevoUsuarioForm!: FormGroup;
  rolForm!: FormGroup;

  mensajeAlerta: string = '';
  tipoAlerta: string = 'success';

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatosIniciales();
  }

  // ==================== CARGA DE DATOS ====================

  private cargarDatosIniciales(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarRolesConPermisos();
    this.cargarPermisos();
  }

  private cargarUsuarios(): void {
    this.service.obtenerUsuarios().then(
      (lista) => {
        this.listaUsuarios = lista.map((usuario) => this.aVista(usuario));
        this.cdr.detectChanges();
      },
      () => {
        this.listaUsuarios = [];
        this.cdr.detectChanges();
      }
    );
  }

  private cargarRoles(): void {
    this.service.obtenerRoles().then(
      (lista) => {
        this.rolesBasicos = lista;
        this.cdr.detectChanges();
      },
      () => {
        this.rolesBasicos = [];
        this.cdr.detectChanges();
      }
    );
  }

  private cargarRolesConPermisos(): void {
    this.service.obtenerRolesConPermisos().then(
      (lista) => {
        this.rolesConPermisos = lista;
        this.cdr.detectChanges();
      },
      () => {
        this.rolesConPermisos = [];
        this.cdr.detectChanges();
      }
    );
  }

  private cargarPermisos(): void {
    this.service.obtenerPermisos().then(
      (respuesta) => {
        const permisos = respuesta?.permisos ?? [];
        this.permisoCatalogo = permisos;
        this.listaPermisosDisponibles = permisos.map((p) => p.nombre);
        this.reconstruirPermisos([]);
        this.cdr.detectChanges();
      },
      () => {
        this.permisoCatalogo = [];
        this.listaPermisosDisponibles = [];
        this.cdr.detectChanges();
      }
    );
  }

  private aVista(usuario: UsuarioApi): UsuarioVista {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol_nombre ?? '',
      rolId: usuario.rol_id,
      activo: usuario.estado === 'Activo',
      estadoTexto: usuario.estado === 'Activo' ? 'En línea' : 'Desconectado',
      estado: usuario.estado,
      horasTrabajadas: 0
    };
  }

  // ==================== FORMULARIOS ====================

  private inicializarFormularios(): void {
    this.nuevoUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      rol: ['', Validators.required],
      horasTrabajadas: [0, [Validators.required, Validators.min(1)]]
    });

    this.rolForm = this.fb.group({
      nombreRol: ['', Validators.required],
      descripcion: [''],
      permisos: this.fb.array([])
    });

    this.passwordForm = this.fb.group({
      nuevaPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[^A-Za-z0-9]/)
        ]
      ],
      confirmarPassword: ['', Validators.required]
    });
  }

  get permisosArray(): FormArray {
    return this.rolForm.get('permisos') as FormArray;
  }

  private reconstruirPermisos(marcados: number[]): void {
    const array = this.permisosArray;
    array.clear();
    this.permisoCatalogo.forEach((permiso) => {
      array.push(this.fb.control(marcados.includes(permiso.id)));
    });
  }

  private permisosMarcados(): number[] {
    return this.permisoCatalogo
      .map((permiso, indice) => {
        const marcado = this.permisosArray.at(indice)?.value;
        return Boolean(marcado) ? permiso.id : null;
      })
      .filter((id): id is number => id !== null);
  }

  // ==================== ESTADÍSTICAS ====================

  contarActivos(): number {
    return this.listaUsuarios.filter((u) => u.activo).length;
  }

  totalHorasTrabajadas(): number {
    return this.listaUsuarios.reduce((total, u) => total + (u.horasTrabajadas || 0), 0);
  }

  // ==================== MODAL DE CREACIÓN ====================

  abrirModalCrear(): void {
    this.modoCrear = true;
    this.usuarioSeleccionado = null;
    this.nuevoUsuarioForm.reset({ horasTrabajadas: 40 });
  }

  volverALista(): void {
    this.modoCrear = false;
    this.usuarioSeleccionado = null;
  }

  guardarNuevoUsuario(): void {
    if (this.nuevoUsuarioForm.invalid || this.enviando) {
      return;
    }

    const valores = this.nuevoUsuarioForm.value as NuevoUsuarioValores;
    const rol = this.rolesBasicos.find((r) => r.nombre === valores.rol);
    if (!rol) {
      this.toastService.mostrar('Selecciona un rol válido para el usuario.', 'error', 'Rol no encontrado');
      return;
    }

    const nombreCompleto = valores.nombre.trim();
    const partes = nombreCompleto.split(/\s+/);
    const apellido = partes.length > 1 ? partes.slice(1).join(' ') : nombreCompleto;
    const passwordTemporal = this.generarPasswordTemporal();

    this.enviando = true;
    this.service.crearUsuario({
      nombre: nombreCompleto,
      apellido,
      email: valores.email.trim().toLowerCase(),
      telefono: valores.telefono?.trim() || undefined,
      password: passwordTemporal,
      rolId: rol.id
    }).then(
      () => {
        this.enviando = false;
        this.toastService.mostrar(
          `Usuario creado correctamente. Contraseña temporal: ${passwordTemporal}`,
          'success',
          'Usuario registrado'
        );
        this.cargarUsuarios();
        this.volverALista();
        this.cdr.detectChanges();
      },
      () => {
        this.enviando = false;
        this.cdr.detectChanges();
      }
    );
  }

  // ==================== CONFIGURACIÓN DE ROL Y PERMISOS ====================

  seleccionarUsuario(user: UsuarioVista): void {
    this.usuarioSeleccionado = user;
    this.modoCrear = false;

    const rol = this.rolesConPermisos.find((r) => r.id === user.rolId);
    const nombreRol = rol?.nombre ?? user.rol;
    const permisosAsignados = rol?.permiso_ids ?? [];

    this.rolForm.patchValue({
      nombreRol,
      descripcion: `Configuración de accesos para ${user.nombre}`
    });

    this.reconstruirPermisos(permisosAsignados);
  }

  onRolSelectChange(event: Event): void {
    const nombre = (event.target as HTMLSelectElement).value;
    const rol = this.rolesConPermisos.find((r) => r.nombre === nombre);
    this.reconstruirPermisos(rol?.permiso_ids ?? []);
  }

  guardarRol(): void {
    if (this.rolForm.invalid || this.enviando || !this.usuarioSeleccionado) {
      return;
    }

    const valores = this.rolForm.value as RolFormValores;
    const rol =
      this.rolesBasicos.find((r) => r.nombre === valores.nombreRol) ??
      this.rolesConPermisos.find((r) => r.nombre === valores.nombreRol);
    if (!rol) {
      this.toastService.mostrar('Selecciona un rol válido.', 'error', 'Rol no encontrado');
      return;
    }

    const permisoIds = this.permisosMarcados();
    const usuario = this.usuarioSeleccionado;

    this.enviando = true;
    Promise.all([
      this.service.cambiarRolUsuario(usuario.id, rol.id),
      this.service.asignarPermisosRol(rol.id, permisoIds)
    ]).then(
      () => {
        this.enviando = false;
        usuario.rol = rol.nombre;
        usuario.rolId = rol.id;
        this.toastService.mostrar(
          `Permisos y rol actualizados para ${usuario.nombre}.`,
          'success',
          'Configuración guardada'
        );
        this.cargarRolesConPermisos();
        this.cargarUsuarios();
        this.volverALista();
        this.cdr.detectChanges();
      },
      () => {
        this.enviando = false;
        this.cdr.detectChanges();
      }
    );
  }

  // ==================== CAMBIO DE CONTRASEÑA (ADMIN/SUPERVISOR) ====================

  abrirModalPassword(user: UsuarioVista): void {
    this.usuarioPassword = user;
    this.passwordForm.reset();
    this.enviandoPassword = false;
    this.cdr.detectChanges();
  }

  cerrarModalPassword(): void {
    this.usuarioPassword = null;
    this.passwordForm.reset();
    this.cdr.detectChanges();
  }

  get nuevaPasswordValue(): string {
    return this.passwordForm?.get('nuevaPassword')?.value ?? '';
  }

  get confirmarPasswordValue(): string {
    return this.passwordForm?.get('confirmarPassword')?.value ?? '';
  }

  passwordsCoinciden(): boolean {
    return !!this.nuevaPasswordValue && this.nuevaPasswordValue === this.confirmarPasswordValue;
  }

  guardarCambioPassword(): void {
    if (this.enviandoPassword || !this.usuarioPassword) {
      return;
    }
    if (this.passwordForm.invalid) {
      this.toastService.mostrar('La contraseña no cumple los requisitos de seguridad.', 'error', 'Contraseña inválida');
      return;
    }
    if (!this.passwordsCoinciden()) {
      this.toastService.mostrar('Las contraseñas no coinciden.', 'error', 'Validación');
      return;
    }

    const usuario = this.usuarioPassword;
    this.enviandoPassword = true;
    this.service
      .cambiarPasswordUsuario(usuario.id, {
        nuevaPassword: this.nuevaPasswordValue,
        confirmarPassword: this.confirmarPasswordValue
      })
      .then(
        () => {
          this.enviandoPassword = false;
          this.cerrarModalPassword();
          this.toastService.mostrar(
            `Contraseña actualizada para ${usuario.nombre}. El usuario deberá iniciar sesión nuevamente.`,
            'success',
            'Contraseña cambiada'
          );
        },
        () => {
          this.enviandoPassword = false;
          this.cdr.detectChanges();
        }
      );
  }

  // ==================== UTILIDADES ====================

  private generarPasswordTemporal(): string {
    const mayusculas = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numeros = '23456789';
    const especiales = '!@#$%&*+-_';
    const tomarDe = (fuente: string): string => fuente.charAt(Math.floor(Math.random() * fuente.length));
    return `Gestock${tomarDe(mayusculas)}${tomarDe(numeros)}${tomarDe(especiales)}22`;
  }
}