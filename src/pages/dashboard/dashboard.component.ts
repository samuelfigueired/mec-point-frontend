import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="subtitle">Visão geral da interface no estilo da referência visual, sem backend e sem dados fictícios.</p>
      </div>
      <button class="app-btn">Novo agendamento</button>
    </div>

    <div class="hero-search">
      <input class="input" type="text" placeholder="Pesquisar..." />
      <span>⌕</span>
    </div>

    <div class="grid">
      <div class="stat" *ngFor="let item of overview">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </div>
    </div>

    <div class="app-panel panel section" style="margin-top:24px">
      <h3>Últimos agendamentos</h3>
      <div class="empty-state">
        <strong>Nenhum agendamento encontrado.</strong>
        <p>Quando houver registros, eles aparecerão aqui.</p>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .subtitle { margin: 8px 0 0; max-width: 820px; color: #ececec; line-height: 1.6; font-size: 14px; }
    .hero-search {
      position: relative;
      max-width: 460px;
      margin: 20px auto 24px;
    }
    .hero-search input { padding-right: 50px; background: #ececec; }
    .hero-search span { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: #111; font-size: 22px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .stat {
      background: linear-gradient(180deg, #595959 0%, #4d4d4d 100%);
      padding: 22px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border-top: 4px solid var(--accent);
      min-height: 150px;
    }
    .stat span { display: block; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
    .stat strong { display: block; font-size: 28px; margin-top: 10px; color: #fff; }
    .stat small { display: block; margin-top: 8px; color: var(--text-muted); line-height: 1.5; }
    .section h3 { margin-top: 0; color: var(--accent); text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .empty-state { border: 1px dashed rgba(255,255,255,.12); border-radius: var(--radius-sm); padding: 24px; color: #fff; background: rgba(255,255,255,.03); }
    .empty-state strong { display: block; color: #fff; margin-bottom: 8px; }
    .empty-state p { margin: 0; color: var(--text-muted); }
    @media (max-width: 900px) { .hero { flex-direction: column; } .hero .app-btn { width: 100%; } }
  `],
})
export class DashboardComponent {
  overview = [
    { label: 'Usuários', value: 'Sem dados', note: 'Nenhum usuário cadastrado.' },
    { label: 'Veículos', value: 'Sem dados', note: 'Nenhum veículo cadastrado.' },
    { label: 'Serviços', value: 'Sem dados', note: 'Nenhum serviço disponível.' },
    { label: 'Agendamentos', value: 'Sem dados', note: 'Nenhum agendamento encontrado.' },
    { label: 'Eventos', value: 'Sem dados', note: 'Nenhuma linha de tempo cadastrada.' },
  ];
}
