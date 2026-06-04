import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user.service';
import { VeiculoService } from '../../services/veiculo.service';
import { ServicoService } from '../../services/servico.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { Agendamento, User, Veiculo, Servico } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="subtitle">Visão geral do sistema MEC Point com dados em tempo real.</p>
      </div>
      <button class="app-btn" routerLink="/agendamentos">Novo agendamento</button>
    </div>

    <div class="grid">
      <div class="stat" *ngFor="let item of overview" [class.loading-card]="loading">
        <span>{{ item.label }}</span>
        <strong *ngIf="!loading">{{ item.value }}</strong>
        <strong *ngIf="loading" class="skeleton">...</strong>
        <small>{{ item.note }}</small>
      </div>
    </div>

    <div class="app-panel panel section" style="margin-top:24px">
      <h3>Últimos agendamentos</h3>

      <!-- Loading -->
      <div *ngIf="loading" class="empty-state">
        <strong>Carregando agendamentos...</strong>
        <p>Buscando dados do servidor.</p>
      </div>

      <!-- Erro -->
      <div *ngIf="!loading && errorMessage" class="empty-state error-state">
        <strong>{{ errorMessage }}</strong>
        <p>Tente recarregar a página.</p>
      </div>

      <!-- Tabela de últimos agendamentos -->
      <div *ngIf="!loading && !errorMessage && recentAgendamentos.length > 0" class="table-wrapper">
        <table class="dash-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Veículo</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of recentAgendamentos">
              <td>{{ a.numeroAgd || '#' + a.id }}</td>
              <td>{{ a.cliente || a.usuarioNome || '—' }}</td>
              <td>{{ a.servico || a.servicoNome || '—' }}</td>
              <td>{{ a.veiculoPlaca || '—' }}</td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + (a.status | lowercase)">
                  {{ formatStatus(a.status) }}
                </span>
              </td>
              <td>{{ formatDate(a.dataHora) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vazio -->
      <div *ngIf="!loading && !errorMessage && recentAgendamentos.length === 0" class="empty-state">
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
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .stat {
      background: linear-gradient(180deg, #595959 0%, #4d4d4d 100%);
      padding: 22px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border-top: 4px solid var(--accent);
      min-height: 150px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .stat span { display: block; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
    .stat strong { display: block; font-size: 28px; margin-top: 10px; color: #fff; }
    .stat small { display: block; margin-top: 8px; color: var(--text-muted); line-height: 1.5; }
    .skeleton {
      background: linear-gradient(90deg, #555 25%, #666 50%, #555 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      color: transparent !important;
      user-select: none;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .loading-card small { opacity: 0.4; }
    .section h3 { margin-top: 0; color: var(--accent); text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .empty-state { border: 1px dashed rgba(255,255,255,.12); border-radius: var(--radius-sm); padding: 24px; color: #fff; background: rgba(255,255,255,.03); }
    .empty-state strong { display: block; color: #fff; margin-bottom: 8px; }
    .empty-state p { margin: 0; color: var(--text-muted); }
    .error-state { border-color: rgba(255,80,80,.3); background: rgba(255,80,80,.05); }
    .error-state strong { color: #ff6b6b; }

    /* Table */
    .table-wrapper { overflow-x: auto; }
    .dash-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .dash-table thead th {
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .dash-table tbody td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #ddd;
    }
    .dash-table tbody tr:hover {
      background: rgba(255,255,255,0.03);
    }

    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pendente { background: rgba(255,193,7,0.15); color: #ffc107; }
    .status-agendado { background: rgba(33,150,243,0.15); color: #2196f3; }
    .status-confirmado { background: rgba(0,188,212,0.15); color: #00bcd4; }
    .status-em_andamento { background: rgba(255,152,0,0.15); color: #ff9800; }
    .status-quase_finalizado { background: rgba(156,39,176,0.15); color: #ce93d8; }
    .status-finalizado { background: rgba(76,175,80,0.15); color: #4caf50; }
    .status-cancelado { background: rgba(244,67,54,0.15); color: #f44336; }

    @media (max-width: 900px) { .hero { flex-direction: column; } .hero .app-btn { width: 100%; } }
  `],
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private veiculoService = inject(VeiculoService);
  private servicoService = inject(ServicoService);
  private agendamentoService = inject(AgendamentoService);
  private authService = inject(AuthService);

  loading = true;
  errorMessage = '';

  overview = [
    { label: 'Usuários', value: '—', note: 'Carregando...' },
    { label: 'Veículos', value: '—', note: 'Carregando...' },
    { label: 'Serviços', value: '—', note: 'Carregando...' },
    { label: 'Agendamentos', value: '—', note: 'Carregando...' },
    { label: 'Eventos', value: '—', note: 'Carregando...' },
  ];

  recentAgendamentos: Agendamento[] = [];

  get isAdminOrMecanico(): boolean {
    const r = this.authService.role;
    return r === 'ADMIN' || r === 'MECANICO';
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.userService.list(),
      veiculos: this.veiculoService.list(),
      servicos: this.servicoService.list(),
      agendamentos: this.agendamentoService.list(),
    }).subscribe({
      next: ({ users, veiculos, servicos, agendamentos }) => {
        // --- Users card ---
        this.overview[0] = {
          label: 'Usuários',
          value: String(users.length),
          note: `${users.length} cadastrado${users.length !== 1 ? 's' : ''} no sistema`,
        };

        // --- Vehicles card ---
        this.overview[1] = {
          label: 'Veículos',
          value: String(veiculos.length),
          note: `${veiculos.length} cadastrado${veiculos.length !== 1 ? 's' : ''} no sistema`,
        };

        // --- Services card ---
        const ativos = servicos.filter(s => s.ativo).length;
        this.overview[2] = {
          label: 'Serviços',
          value: String(servicos.length),
          note: `${ativos} ativo${ativos !== 1 ? 's' : ''} de ${servicos.length} total`,
        };

        // --- Appointments card ---
        const pendentes = agendamentos.filter(a => a.status === 'PENDENTE').length;
        const emAndamento = agendamentos.filter(a => a.status === 'EM_ANDAMENTO').length;
        const finalizados = agendamentos.filter(a => a.status === 'FINALIZADO').length;
        this.overview[3] = {
          label: 'Agendamentos',
          value: String(agendamentos.length),
          note: `${pendentes} pendente${pendentes !== 1 ? 's' : ''}, ${emAndamento} em andamento, ${finalizados} finalizado${finalizados !== 1 ? 's' : ''}`,
        };

        // --- Events card (count from agendamentos events) ---
        this.loadEventosCount(agendamentos);

        // --- Recent appointments table ---
        this.recentAgendamentos = agendamentos
          .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
          .slice(0, 5);

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
        this.errorMessage = 'Erro ao carregar dados do dashboard.';
        this.overview = [
          { label: 'Usuários', value: '!', note: 'Erro ao carregar' },
          { label: 'Veículos', value: '!', note: 'Erro ao carregar' },
          { label: 'Serviços', value: '!', note: 'Erro ao carregar' },
          { label: 'Agendamentos', value: '!', note: 'Erro ao carregar' },
          { label: 'Eventos', value: '!', note: 'Erro ao carregar' },
        ];
        this.loading = false;
      }
    });
  }

  loadEventosCount(agendamentos: Agendamento[]) {
    if (agendamentos.length === 0) {
      this.overview[4] = {
        label: 'Eventos',
        value: '0',
        note: 'Nenhum evento registrado',
      };
      return;
    }

    // Fetch events for each agendamento and sum them
    const eventRequests = agendamentos
      .filter(a => a.id != null)
      .map(a => this.agendamentoService.listEventos(a.id!));

    if (eventRequests.length === 0) {
      this.overview[4] = { label: 'Eventos', value: '0', note: 'Nenhum evento registrado' };
      return;
    }

    forkJoin(eventRequests).subscribe({
      next: (allEvents) => {
        const totalEventos = allEvents.reduce((sum, events) => sum + events.length, 0);
        this.overview[4] = {
          label: 'Eventos',
          value: String(totalEventos),
          note: `${totalEventos} evento${totalEventos !== 1 ? 's' : ''} na linha do tempo`,
        };
      },
      error: () => {
        this.overview[4] = {
          label: 'Eventos',
          value: '—',
          note: 'Não foi possível carregar eventos',
        };
      }
    });
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'PENDENTE': 'Pendente',
      'AGENDADO': 'Agendado',
      'CONFIRMADO': 'Confirmado',
      'EM_ANDAMENTO': 'Em Andamento',
      'QUASE_FINALIZADO': 'Quase Finalizado',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}
