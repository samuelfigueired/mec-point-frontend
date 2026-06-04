import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth">
      <div class="auth-panel">
        <div class="brand-mark" aria-hidden="true"></div>
        <h1 class="brand">MEC <span>POINT</span></h1>
        <h2>Entrar</h2>
        <form (ngSubmit)="submit()" class="auth-form">
          <label>Email</label>
          <input class="input" type="email" name="email" [(ngModel)]="email" required placeholder="email" />
          <label>Senha</label>
          <div class="password-wrapper">
            <input class="input password-input" [type]="showPassword ? 'text' : 'password'" name="senha" [(ngModel)]="senha" required placeholder="senha" />
            <button type="button" class="toggle-password-btn" (click)="showPassword = !showPassword" aria-label="Visualizar senha">
              <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <button class="app-btn submit-btn" type="submit">Entrar</button>
        </form>
        <p class="hint">Não tem conta? <a routerLink="/register">Cadastre-se</a></p>
        <p class="err" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .auth {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,.05), transparent 26%),
        radial-gradient(circle at bottom right, rgba(255,106,0,.12), transparent 22%),
        linear-gradient(180deg, #4f4f4f 0%, #414141 100%);
    }
    .auth-panel {
      width: min(100%, 360px);
      background: #ececec;
      color: var(--text);
      padding: 32px 28px 24px;
      border-radius: 22px;
      box-shadow: 0 28px 80px rgba(0,0,0,.35);
      text-align: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,.04);
    }
    .auth-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 10%, rgba(255,255,255,.3), transparent 20%);
      pointer-events: none;
    }
    .brand-mark {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      margin: 2px auto 14px;
      background: var(--accent);
      box-shadow: 0 12px 24px rgba(255,106,0,.25);
    }
    .brand { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; color: var(--text); }
    .brand span { color: var(--accent); }
    h2 { text-align: center; color: #666; margin: 10px 0 22px; text-transform: uppercase; font-size: 12px; letter-spacing: 2.4px; font-weight: 800; }
    .auth-form { display: grid; gap: 12px; }
    label {
      display: block;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #666;
      margin-bottom: 2px;
      letter-spacing: 0.6px;
    }
    .input {
      width: 100%;
      padding: 11px 14px;
      border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1);
      background: #fff;
      color: var(--text);
      outline: none;
      font-size: 13px;
      font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .input:focus {
      border-color: rgba(255,106,0,.5);
      box-shadow: 0 0 0 3px rgba(255,106,0,.12);
    }
    .submit-btn { width: 100%; margin-top: 10px; }
    .hint { text-align: center; margin-top: 18px; font-size: 12px; color: #555; }
    .hint a { color: var(--accent); font-weight: 800; }
    .err { color: var(--danger); text-align: center; margin-top: 12px; font-size: 12px; font-weight: 600; }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-input {
      padding-right: 48px !important;
      width: 100%;
    }
    .toggle-password-btn {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      padding: 0;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      transition: color 0.15s ease;
    }
    .toggle-password-btn:hover {
      color: var(--accent);
    }
    @media (max-width: 480px) { .auth-panel { width: 100%; padding: 24px 20px 20px; } }
  `],
  host: { ngSkipHydration: '' },
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  message = '';
  showPassword = false;

  submit() {
    this.message = '';
    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Erro ao realizar login. Verifique suas credenciais.';
      }
    });
  }
}
