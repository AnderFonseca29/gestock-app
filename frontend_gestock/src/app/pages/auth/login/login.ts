import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loginForm!: FormGroup;
  errorMessage: string = '';
  enviando: boolean = false;
  mostrarPassword: boolean = false;
  shakeAnimacion: boolean = false;

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      recordar: [false]
    });

    const recordado = typeof localStorage !== 'undefined' ? localStorage.getItem('gestock_recordar_email') : null;
    if (recordado) {
      this.loginForm.patchValue({ email: recordado, recordar: true });
    }

    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.controls['email'];
    return control.invalid && control.touched;
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.controls['password'];
    return control.invalid && control.touched;
  }

  get mensajeEmailError(): string {
    const control = this.loginForm.controls['email'];
    if (control.hasError('required')) return 'El correo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    return '';
  }

  get mensajePasswordError(): string {
    const control = this.loginForm.controls['password'];
    if (control.hasError('required')) return 'La contraseña es obligatoria.';
    return '';
  }

  private animarError(): void {
    this.shakeAnimacion = true;
    setTimeout(() => (this.shakeAnimacion = false), 500);
  }

  irAlInicio(): void {
    this.router.navigate(['/']);
  }

  procesarLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email.trim().toLowerCase();
    const password = this.loginForm.value.password;
    const recordar = this.loginForm.value.recordar;

    this.enviando = true;
    this.errorMessage = '';

    this.authService.login(email, password).then((resultado) => {
      this.enviando = false;
      if (!resultado.ok) {
        this.loginForm.patchValue({ password: '' });
        this.errorMessage = resultado.mensaje || 'No se pudo iniciar sesión.';
        this.animarError();
        return;
      }

      if (typeof localStorage !== 'undefined') {
        if (recordar) {
          localStorage.setItem('gestock_recordar_email', email);
        } else {
          localStorage.removeItem('gestock_recordar_email');
        }
      }

      const rutaInicial = this.authService.obtenerRutaInicialPorRol();
      this.router.navigate([rutaInicial]);
      this.cdr.detectChanges();
    });
  }
}