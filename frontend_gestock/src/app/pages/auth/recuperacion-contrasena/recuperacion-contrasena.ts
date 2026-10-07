import { Component, ElementRef, ViewChild, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-recuperacion-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperacion-contrasena.html',
  styleUrl: './recuperacion-contrasena.css'
})
export class RecuperacionContrasenaComponent {
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLDivElement>;

  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  pasoActual: number = 1;
  isLoading: boolean = false;
  activeField: string | null = null;
  errorMessage: string = '';
  shakeAnimacion: boolean = false;
  telefonoDestino: string = 'tu número';
  codigoDemo: string = '';
  mostrarNuevaPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;

  datosRecuperacion = {
    telefono: '',
    codigo: '',
    nuevaPassword: '',
    confirmarPassword: ''
  };

  private animacionError(): void {
    this.shakeAnimacion = true;
    setTimeout(() => (this.shakeAnimacion = false), 500);
  }

  private mensajeError(error: any): string {
    return error?.error?.message || 'No se pudo completar la solicitud. Intenta de nuevo.';
  }

  // Efecto Tilt 3D e iluminación dinámica
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    card.style.setProperty('--rotate-x', `0deg`);
    card.style.setProperty('--rotate-y', `0deg`);
  }

  setFocus(field: string): void {
    this.activeField = field;
  }

  clearFocus(): void {
    this.activeField = null;
  }

  irAlInicio(): void {
    this.router.navigate(['/']);
  }

  // PASO 1: Solicitar recuperación (se envía el código por SMS al teléfono registrado)
  async solicitarRecuperacion(): Promise<void> {
    const telefono = this.datosRecuperacion.telefono.trim();
    if (!telefono || telefono.replace(/\D/g, '').length < 7) {
      this.errorMessage = 'Ingresa un número de teléfono válido.';
      this.animacionError();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const data = await this.apiService.post<any>('/auth/recuperar', { telefono });
      this.telefonoDestino = data?.enmascarado || telefono;
      this.codigoDemo = data?.codigoDemo || '';
      this.pasoActual = 2;
      this.datosRecuperacion.codigo = '';
      this.datosRecuperacion.nuevaPassword = '';
      this.datosRecuperacion.confirmarPassword = '';
      this.toastService.mostrar(
        'Si el número está registrado, recibirás el código de verificación por SMS.',
        'info',
        'Código enviado'
      );
    } catch (error) {
      this.errorMessage = this.mensajeError(error);
      this.animacionError();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // PASO 2: Verificar código y definir la nueva contraseña (verificación en dos pasos)
  async restablecerPassword(): Promise<void> {
    const telefono = this.datosRecuperacion.telefono.trim();
    const { codigo, nuevaPassword, confirmarPassword } = this.datosRecuperacion;

    if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
      this.errorMessage = 'Ingresa el código de verificación de 6 dígitos.';
      this.animacionError();
      return;
    }
    if (!nuevaPassword || !confirmarPassword) {
      this.errorMessage = 'Completa los campos de contraseña.';
      this.animacionError();
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.animacionError();
      return;
    }
    const fortaleza =
      nuevaPassword.length >= 8 &&
      /[A-Z]/.test(nuevaPassword) &&
      /[0-9]/.test(nuevaPassword) &&
      /[^A-Za-z0-9]/.test(nuevaPassword);
    if (!fortaleza) {
      this.errorMessage = 'Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.';
      this.animacionError();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.apiService.post('/auth/recuperar/restablecer', {
        telefono,
        codigo: codigo.trim(),
        nuevaPassword
      });
      this.toastService.mostrar(
        'Tu contraseña fue actualizada. Ya puedes iniciar sesión.',
        'success',
        'Contraseña restablecida'
      );
      this.datosRecuperacion = { telefono: '', codigo: '', nuevaPassword: '', confirmarPassword: '' };
      this.codigoDemo = '';
      this.telefonoDestino = 'tu número';
      this.pasoActual = 1;
      this.mostrarNuevaPassword = false;
      this.mostrarConfirmarPassword = false;
      setTimeout(() => this.router.navigate(['/auth/login']), 1200);
    } catch (error) {
      this.errorMessage = this.mensajeError(error);
      this.animacionError();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async reenviarCodigo(): Promise<void> {
    await this.solicitarRecuperacion();
  }
}