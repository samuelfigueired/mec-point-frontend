import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo">MEC <span>POINT</span></div>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/usuarios" routerLinkActive="active">Usuários</a>
        <a routerLink="/veiculos" routerLinkActive="active">Veículos</a>
        <a routerLink="/servicos" routerLinkActive="active">Serviços</a>
        <a routerLink="/agendamentos" routerLinkActive="active">Agendamentos</a>
      </nav>
      <div class="status">Modo de visualização</div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      background: linear-gradient(180deg, #2c2c2c 0%, #232323 100%);
      padding: 26px 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-height: 100vh;
      box-shadow: 10px 0 28px rgba(0,0,0,.18);
      position: relative;
      z-index: 1;
    }
    .sidebar::before {
      content: '';
      position: absolute;
      inset: 14px;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,.03);
      pointer-events: none;
    }
    .logo {
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 1px;
      color: #fff;
      padding-left: 10px;
    }
    .logo span { color: var(--accent); }
    nav { display: flex; flex-direction: column; gap: 6px; flex: 1; padding: 2px 2px 2px 0; }
    nav a {
      position: relative;
      padding: 13px 14px 13px 18px;
      border-radius: 14px;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .7px;
      transition: background .15s ease, color .15s ease, transform .15s ease;
    }
    nav a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      bottom: 10px;
      width: 4px;
      border-radius: 999px;
      background: transparent;
      transition: background .15s ease;
    }
    nav a:hover { background: rgba(255,255,255,.05); color: #fff; transform: translateX(2px); }
    nav a.active { background: rgba(255,106,0,.14); color: #fff; }
    nav a.active::before { background: var(--accent); }
    .status {
      color: var(--text-muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 14px 14px 4px;
      border-top: 1px solid rgba(255,255,255,.08);
      margin-top: auto;
    }
    @media (max-width: 960px) { .sidebar { width: 100%; min-height: auto; } }
    @media (max-width: 768px) { .sidebar { padding: 16px; } nav { flex-direction: row; flex-wrap: wrap; } nav a { white-space: nowrap; } }
  `],
})
export class SidebarComponent {
}
