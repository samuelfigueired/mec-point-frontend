import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth">
      <div class="auth-panel">
        <div class="brand-mark" aria-hidden="true"></div>
        <h1 class="brand">MEC <span>POINT</span></h1>
        <h2>Criar conta</h2>
        <form (ngSubmit)="submit()" class="auth-form">
          <label>Nome</label>
          <input class="input" name="nome" [(ngModel)]="nome" required placeholder="nome" />
          <label>Email</label>
          <input class="input" name="email" type="email" [(ngModel)]="email" required placeholder="email" />
          <label>Senha</label>
          <input class="input" name="senha" type="password" [(ngModel)]="senha" required placeholder="senha" />
          <label>Confirmar senha</label>
          <input class="input" name="confirm" type="password" [(ngModel)]="confirm" required placeholder="confirmar senha" />
          <button class="app-btn submit-btn" type="submit">Cadastrar</button>
        </form>
        <p class="hint">Já tem conta? <a routerLink="/login">Entrar</a></p>
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
        radial-gradient(circle at top left, rgba(255,255,255,.12), transparent 26%),
        radial-gradient(circle at bottom right, rgba(255,106,0,.18), transparent 22%),
        linear-gradient(180deg, #4f4f4f 0%, #414141 100%);
    }
    .auth-panel {
      width: min(100%, 380px);
      background: #222;
      color: #fff;
      padding: 28px 28px 22px;
      border-radius: 24px;
      box-shadow: 0 28px 70px rgba(0,0,0,.4);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .auth-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 10%, rgba(255,255,255,.06), transparent 20%);
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
    .brand { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; }
    .brand span { color: var(--accent); }
    h2 { text-align: center; color: #ececec; margin: 10px 0 22px; text-transform: uppercase; font-size: 12px; letter-spacing: 2.4px; }
    .auth-form { display: grid; gap: 8px; }
    label { display: none; }
    .input { background: #efefef; border: none; box-shadow: inset 0 1px 0 rgba(255,255,255,.8); }
    .submit-btn { width: 100%; margin-top: 10px; }
    .hint { text-align: center; margin-top: 16px; font-size: 12px; color: #d2d2d2; }
    .hint a { color: var(--accent); font-weight: 800; }
    .err { color: #ffb4ad; text-align: center; margin-top: 12px; font-size: 12px; }
    @media (max-width: 480px) { .auth-panel { width: 100%; padding: 22px 18px 18px; } }
  `],
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  confirm = '';
  message = '';

  submit() {
    if (this.senha !== this.confirm) {
      this.message = 'As senhas não conferem.';
      return;
    }

    this.message = 'Cadastro ainda não está disponível nesta etapa.';
  }
}
