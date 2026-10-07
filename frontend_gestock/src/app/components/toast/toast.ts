import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.tipo }}" (click)="toastService.cerrar(toast.id)">
          <span class="toast-icon">
            @if (toast.tipo === 'success') { ✓ }
            @else if (toast.tipo === 'error') { ✕ }
            @else { ⓘ }
          </span>
          <span class="toast-body">
            @if (toast.titulo) {
              <strong>{{ toast.titulo }}</strong>
            }
            <span>{{ toast.mensaje }}</span>
          </span>
          <span class="toast-progress"></span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      color: #fff;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
      animation: toast-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
    }
    .toast:hover {
      transform: translateX(-4px) scale(1.02);
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
    }
    .toast-success { background: linear-gradient(135deg, #10b981, #059669); }
    .toast-error   { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .toast-info    { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
    }
    .toast-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .toast strong { font-size: 13px; font-weight: 700; }
    .toast-progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.7);
      width: 100%;
      border-radius: 0 99px 99px 0;
      animation: toast-progress 4.5s linear forwards;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(60px) scale(0.9); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toast-progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
    @media (max-width: 640px) {
      .toast-container {
        top: 12px;
        right: 12px;
        left: 12px;
        max-width: none;
      }
      .toast {
        animation-name: toast-in-mobile;
      }
    }
    @keyframes toast-in-mobile {
      from { opacity: 0; transform: translateY(-30px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}