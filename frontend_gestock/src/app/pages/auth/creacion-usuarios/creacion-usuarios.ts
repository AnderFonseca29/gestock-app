import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-creacion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creacion-usuarios.html',
  styleUrl: './creacion-usuarios.css'
})
export class CreacionUsuariosComponent {
  private usuarioService = inject(UsuarioService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  pasoActual: number = 1;
  enviando: boolean = false;
  errorMessage: string = '';
  roles: any[] = [];

  volver(): void {
    if (history.length > 1) {
      this.router.navigateByUrl('/app/gestion/roles-yusuarios').then((navegado) => {
        if (!navegado) {
          window.history.back();
        }
      });
    } else {
      this.router.navigate(['/app/panel']);
    }
  }

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
    rolId: null as number | null
  };

  ngOnInit() {
    this.usuarioService.obtenerRolesBasicos().then(
      (roles) => {
        this.roles = roles;
        this.cdr.detectChanges();
      },
      () => {
        this.roles = [];
        this.cdr.detectChanges();
      }
    );
  }

  solicitarRegistro(): void {
    this.errorMessage = '';

    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password || !this.nuevoUsuario.rolId) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }
    if (!this.emailValido(this.nuevoUsuario.email)) {
      this.errorMessage = 'Ingresa un correo electrónico válido.';
      return;
    }
    if (this.nuevoUsuario.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.nuevoUsuario.password !== this.nuevoUsuario.confirmar) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const telefonoValido = (t: string): boolean => !t || t.replace(/\D/g, '').length >= 7;
    if (!telefonoValido(this.nuevoUsuario.telefono)) {
      this.errorMessage = 'Ingresa un número de teléfono válido (mínimo 7 dígitos).';
      return;
    }

    this.pasoActual = 2;
  }

  confirmarCodigo(): void {
    if (this.enviando) {
      return;
    }
    this.errorMessage = '';
    this.enviando = true;

    this.usuarioService.crearUsuario({
      nombre: this.nuevoUsuario.nombre.trim(),
      apellido: this.nuevoUsuario.apellido.trim() || undefined,
      email: this.nuevoUsuario.email.trim().toLowerCase(),
      telefono: this.nuevoUsuario.telefono.trim() || undefined,
      password: this.nuevoUsuario.password,
      rolId: Number(this.nuevoUsuario.rolId)
    }).then(
      () => {
        this.enviando = false;
        this.toastService.mostrar('Usuario creado correctamente. Ya puede iniciar sesión.', 'success', 'Registro exitoso');
        this.router.navigate(['/auth/login']);
        this.cdr.detectChanges();
      },
      (err: any) => {
        this.enviando = false;
        this.pasoActual = 1;
        this.errorMessage = err?.error?.message || 'No fue posible registrar el usuario.';
        this.cdr.detectChanges();
      }
    );
  }

  private emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}