import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Agendamento, User, Veiculo } from '../../models/models';
import { AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { USER_KEY } from '../../services/api.config';
import { UserService } from '../../services/user.service';
import { VeiculoService } from '../../services/veiculo.service';

type ProfileTab = 'garage' | 'history' | 'parts' | 'settings';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="profile-page">
      <a class="home-link" routerLink="/dashboard" aria-label="Voltar para o dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11l9-8 9 8"/>
          <path d="M5 10v10h14V10"/>
          <path d="M9 20v-6h6v6"/>
        </svg>
      </a>

      <section class="hero-panel">
        <div class="avatar">{{ initials }}</div>
        <h1>{{ userName }}</h1>
        <button type="button" class="edit-btn">EDITAR PERFIL</button>

        <div class="tabs">
          <button type="button" class="tab" [class.active]="selectedTab === 'garage'" (click)="selectedTab = 'garage'">GARAGEM</button>
          <button type="button" class="tab" [class.active]="selectedTab === 'history'" (click)="selectedTab = 'history'">HISTÓRICO DE SERVIÇOS</button>
          <button type="button" class="tab" [class.active]="selectedTab === 'parts'" (click)="selectedTab = 'parts'">PEÇAS</button>
          <button type="button" class="tab" [class.active]="selectedTab === 'settings'" (click)="selectedTab = 'settings'">CONFIGURAÇÕES</button>
        </div>
      </section>

      <section class="content-wrap">
        <ng-container [ngSwitch]="selectedTab">
          <section *ngSwitchCase="'history'">
            <div class="section-head">
              <h2>Histórico de Serviço</h2>
              <button type="button" class="search-btn" aria-label="Buscar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
              </button>
            </div>

            <div *ngIf="loading" class="empty-state">Carregando histórico...</div>
            <div *ngIf="!loading && historico.length === 0" class="empty-state">Nenhum serviço encontrado.</div>

            <article class="history-card" *ngFor="let item of historico">
              <div class="history-text">
                <div class="history-id">ID: {{ item.numeroAgd || item.id || '—' }}</div>
                <div class="history-line"><strong>MODELO:</strong> {{ item.veiculoModelo || '—' }}</div>
                <div class="history-line"><strong>DESCRIÇÃO:</strong> {{ item.descricao || item.servico || '—' }}</div>
                <div class="history-line"><strong>VALOR:</strong> {{ formatCurrency(item.servicoValor) }}</div>
                <div class="history-line"><strong>STATUS:</strong> {{ formatStatus(item.status) }}</div>
              </div>
              <div class="vehicle-plate">
                <div class="vehicle-chip">
                  <span>{{ item.veiculoPlaca || '—' }}</span>
                </div>
              </div>
            </article>
          </section>

          <section *ngSwitchCase="'garage'">
            <div class="section-head left">
              <h2>Garagem</h2>
            </div>
            <div *ngIf="loading" class="empty-state">Carregando veículos...</div>
            <div *ngIf="!loading && garagem.length === 0" class="empty-state">Nenhum veículo cadastrado.</div>

            <div class="garage-grid">
              <article class="garage-card" *ngFor="let v of garagem">
                <div class="garage-name">{{ v.modelo || 'Veículo' }}</div>
                <div class="garage-image">{{ vehicleAbbr(v.modelo) }}</div>
                <div class="garage-info">PLACA: {{ v.placa || '—' }}</div>
                <div class="garage-info">ANO: {{ v.ano || '—' }}</div>
                <div class="garage-info">MARCA: {{ v.marca || '—' }}</div>
              </article>

              <a class="garage-card add-card" routerLink="/veiculos">
                <div class="add-icon">+</div>
                <div class="add-label">ADICIONAR</div>
              </a>
            </div>
          </section>

          <section *ngSwitchCase="'parts'">
            <div class="section-head left">
              <h2>Peças</h2>
            </div>
            <div class="empty-state">A tela de peças ainda está em desenvolvimento.</div>
          </section>

          <section *ngSwitchCase="'settings'">
            <div class="section-head left">
              <h2>Configurações</h2>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <label class="setting-field">
                  <span>Nome</span>
                  <input type="text" [(ngModel)]="settingsForm.nome" placeholder="Seu nome" />
                </label>
                <label class="setting-field">
                  <span>E-mail</span>
                  <input type="email" [(ngModel)]="settingsForm.email" placeholder="Seu e-mail" />
                </label>
                <label class="setting-field full">
                  <span>Nova senha</span>
                  <input type="password" [(ngModel)]="settingsForm.senha" placeholder="Deixe em branco para manter a atual" />
                </label>
              </div>

              <div class="settings-actions">
                <button type="button" class="settings-save" [disabled]="savingSettings" (click)="saveSettings()">
                  {{ savingSettings ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES' }}
                </button>
              </div>

              <div class="settings-feedback success" *ngIf="settingsSuccess">{{ settingsSuccess }}</div>
              <div class="settings-feedback error" *ngIf="settingsError">{{ settingsError }}</div>
            </div>
          </section>
        </ng-container>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .profile-page {
      min-height: 100%;
      padding: 20px 0 32px;
      color: #fff;
    }
    .home-link {
      position: absolute;
      top: 22px;
      left: 18px;
      color: #111;
    }
    .hero-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 18px;
      padding: 38px 16px 28px;
    }
    .avatar {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: #dedede;
      color: #111;
      display: grid;
      place-items: center;
      font-size: 66px;
      font-weight: 900;
      letter-spacing: -4px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 4.5vw, 50px);
      line-height: 1.05;
      text-transform: uppercase;
      font-weight: 900;
      color: #fff;
      max-width: 920px;
    }
    .edit-btn {
      border: 3px solid var(--accent);
      color: #d2d2d2;
      background: transparent;
      border-radius: 999px;
      min-width: 380px;
      padding: 13px 18px;
      font-weight: 800;
      letter-spacing: .4px;
    }
    .tabs {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      width: min(1080px, 100%);
      margin-top: 8px;
    }
    .tab {
      border: none;
      border-radius: 999px;
      background: #dedede;
      color: #111;
      font-weight: 900;
      text-transform: uppercase;
      padding: 11px 14px;
      letter-spacing: .3px;
      transition: transform .15s ease, background .15s ease, color .15s ease;
    }
    .tab.active {
      background: var(--accent);
      color: #111;
    }
    .tab:hover { transform: translateY(-1px); }
    .content-wrap {
      width: min(1120px, calc(100% - 24px));
      margin: 24px auto 0;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-head.left { justify-content: flex-start; }
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      color: #fff;
    }
    .search-btn {
      width: 86px;
      height: 48px;
      border-radius: 999px;
      background: #dedede;
      border: none;
      color: #111;
      display: grid;
      place-items: center;
    }
    .empty-state {
      margin-top: 18px;
      padding: 24px;
      border-radius: 24px;
      background: rgba(255,255,255,.08);
      color: rgba(255,255,255,.82);
      text-align: center;
      font-weight: 700;
    }
    .history-card {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 18px;
      align-items: center;
      background: #d6d6d6;
      color: #111;
      border-radius: 20px;
      padding: 22px 24px;
      margin-top: 14px;
      min-height: 150px;
    }
    .history-text { font-size: 15px; font-weight: 900; text-transform: uppercase; }
    .history-id { margin-bottom: 6px; }
    .history-line { margin-top: 6px; line-height: 1.35; }
    .history-line strong { margin-right: 4px; }
    .vehicle-plate {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 110px;
    }
    .vehicle-chip {
      width: min(100%, 320px);
      min-height: 92px;
      border-radius: 16px;
      background: #1f1f1f;
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 22px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .garage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .garage-card {
      min-height: 280px;
      border-radius: 26px;
      background: #dedede;
      color: #111;
      padding: 18px 18px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
    }
    .garage-name {
      font-size: 22px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .garage-image {
      width: 100%;
      flex: 1;
      display: grid;
      place-items: center;
      font-size: 56px;
      font-weight: 900;
      color: var(--accent);
    }
    .garage-info {
      width: 100%;
      text-align: center;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 12px;
      line-height: 1.5;
    }
    .add-card {
      justify-content: center;
      gap: 12px;
      cursor: pointer;
    }
    .add-icon {
      width: 118px;
      height: 118px;
      border-radius: 50%;
      background: var(--accent);
      color: #111;
      display: grid;
      place-items: center;
      font-size: 84px;
      font-weight: 300;
      line-height: 1;
    }
    .add-label {
      font-size: 22px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .settings-card {
      background: #1f1f1f;
      border-radius: 28px;
      padding: 28px;
      border: 1px solid rgba(255,255,255,.06);
      box-shadow: 0 18px 50px rgba(0,0,0,.22);
    }
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    .setting-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: rgba(255,255,255,.88);
    }
    .setting-field span {
      padding-left: 4px;
    }
    .setting-field input {
      width: 100%;
      border: 1.5px solid rgba(255,106,0,.28);
      background: #dedede;
      color: #111;
      border-radius: 18px;
      padding: 14px 16px;
      font: inherit;
      outline: none;
    }
    .setting-field.full { grid-column: 1 / -1; }
    .settings-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .settings-save {
      border: none;
      background: var(--accent);
      color: #111;
      font-weight: 900;
      text-transform: uppercase;
      border-radius: 999px;
      padding: 14px 20px;
      min-width: 220px;
    }
    .settings-save:disabled {
      opacity: .7;
      cursor: not-allowed;
    }
    .settings-feedback {
      margin-top: 14px;
      border-radius: 18px;
      padding: 12px 14px;
      font-weight: 700;
    }
    .settings-feedback.success {
      background: rgba(76,175,80,.12);
      color: #b8f3bf;
    }
    .settings-feedback.error {
      background: rgba(255,80,80,.12);
      color: #ffb2b2;
    }
    @media (max-width: 960px) {
      .tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .history-card { grid-template-columns: 1fr; }
      .edit-btn { min-width: 0; width: 100%; max-width: 420px; }
      .settings-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .profile-page { padding-top: 12px; }
      .avatar { width: 140px; height: 140px; font-size: 54px; }
      .tabs { grid-template-columns: 1fr; }
      .content-wrap { width: calc(100% - 16px); }
      .history-card { padding: 18px; }
    }
  `],
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private agendamentoService = inject(AgendamentoService);
  private userService = inject(UserService);
  private veiculoService = inject(VeiculoService);

  selectedTab: ProfileTab = 'history';
  loading = true;
  savingSettings = false;
  historico: Agendamento[] = [];
  garagem: Veiculo[] = [];
  settingsSuccess = '';
  settingsError = '';
  settingsForm = { nome: '', email: '', senha: '' };

  get currentUser(): User | null {
    return this.authService.currentUser;
  }

  get userName(): string {
    return this.currentUser?.nome || 'Meu Perfil';
  }

  get initials(): string {
    const parts = this.userName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || 'MP';
  }

  ngOnInit(): void {
    const user = this.currentUser;
    this.settingsForm = {
      nome: user?.nome || '',
      email: user?.email || '',
      senha: '',
    };
    this.loadData();
  }

  loadData(): void {
    const user = this.currentUser;
    if (!user?.id) {
      this.loading = false;
      return;
    }

    const role = this.authService.role;
    const agendamentos$ = role === 'ADMIN'
      ? this.agendamentoService.list()
      : role === 'MECANICO'
        ? this.agendamentoService.byMecanico(user.id)
        : this.agendamentoService.meus();

    const veiculos$ = role === 'CLIENTE'
      ? this.veiculoService.meus()
      : role === 'ADMIN'
        ? this.veiculoService.list()
        : this.veiculoService.list();

    forkJoin({ agendamentos: agendamentos$, veiculos: veiculos$ }).subscribe({
      next: ({ agendamentos, veiculos }) => {
        this.historico = agendamentos
          .slice()
          .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
        this.garagem = veiculos.slice().sort((a, b) => (a.modelo || '').localeCompare(b.modelo || ''));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.loading = false;
      }
    });
  }

  formatStatus(status?: string): string {
    if (!status) return '—';
    const map: Record<string, string> = {
      PENDENTE: 'Pendente',
      AGENDADO: 'Agendado',
      CONFIRMADO: 'Confirmado',
      EM_ANDAMENTO: 'Em andamento',
      QUASE_FINALIZADO: 'Quase finalizado',
      FINALIZADO: 'Finalizado',
      CANCELADO: 'Cancelado',
    };
    return map[status] || status;
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  vehicleAbbr(modelo?: string): string {
    if (!modelo) return 'CAR';
    return modelo.split(/\s+/).slice(0, 1).join('').substring(0, 6).toUpperCase();
  }

  saveSettings(): void {
    const currentUser = this.currentUser;
    if (!currentUser?.id) {
      this.settingsError = 'Não foi possível identificar o usuário logado.';
      return;
    }

    this.settingsError = '';
    this.settingsSuccess = '';

    const payload: User = {
      nome: this.settingsForm.nome.trim(),
      email: this.settingsForm.email.trim(),
      role: currentUser.role,
      ...(this.settingsForm.senha.trim() ? { senha: this.settingsForm.senha.trim() } : {}),
    };

    if (!payload.nome || !payload.email) {
      this.settingsError = 'Nome e e-mail são obrigatórios.';
      return;
    }

    this.savingSettings = true;
    this.userService.update(currentUser.id, payload).subscribe({
      next: (updatedUser) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
        this.settingsForm.senha = '';
        this.settingsSuccess = 'Configurações atualizadas com sucesso.';
        this.savingSettings = false;
      },
      error: (err) => {
        console.error('Erro ao salvar configurações do perfil:', err);
        this.settingsError = err.error?.message || 'Não foi possível salvar as configurações.';
        this.savingSettings = false;
      }
    });
  }
}