import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Agendamento, StatusAgendamento, User, Veiculo, Servico } from '../../models/models';
import { AgendamentoService } from '../../services/agendamento.service';
import { UserService } from '../../services/user.service';
import { VeiculoService } from '../../services/veiculo.service';
import { ServicoService } from '../../services/servico.service';

const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44" height="44" fill="none"
  stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Agendamentos</h1>
        <p class="subtitle">
          <ng-container *ngIf="loading">Carregando agendamentos...</ng-container>
          <ng-container *ngIf="!loading">
            {{ rows.length === 0 ? 'Nenhum agendamento encontrado no momento.' : rows.length + (rows.length === 1 ? ' agendamento cadastrado.' : ' agendamentos cadastrados.') }}
          </ng-container>
        </p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo agendamento</button>
    </div>

    <div class="filters">
      <input class="f-input" placeholder="Pesquisar por descrição ou placa..." [(ngModel)]="search" />
      <select class="f-input" [(ngModel)]="filterStatus">
        <option value="">Todos os status</option>
        <option value="PENDENTE">Pendente</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="CONCLUIDO">Concluído</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <select class="f-input" [(ngModel)]="filterUser">
        <option value="">Todos os clientes</option>
        <option *ngFor="let u of clientes" [value]="u.id">{{ u.nome }}</option>
      </select>
      <select class="f-input" [(ngModel)]="filterMec">
        <option value="">Todos os mecânicos</option>
        <option *ngFor="let m of mecanicos" [value]="m.id">{{ m.nome }}</option>
      </select>
    </div>

    <!-- Shimmer loading skeleton list -->
    <div class="cards" *ngIf="loading">
      <div class="ag-card skeleton-card" *ngFor="let placeholder of [1, 2]">
        <div class="ag-img-skeleton shimmer"></div>
        <div class="ag-info-skeleton">
          <div class="shimmer header-shim"></div>
          <div class="shimmer text-shim" style="width: 50%"></div>
          <div class="shimmer text-shim" style="width: 70%"></div>
          <div class="shimmer text-shim" style="width: 40%"></div>
          <div class="shimmer text-shim" style="width: 60%"></div>
          <div class="shimmer btn-shim"></div>
        </div>
      </div>
    </div>

    <!-- Real cards list -->
    <div class="cards" *ngIf="!loading && filtered.length">
      <div class="ag-card" *ngFor="let a of filtered">
        <div class="ag-img"><div class="ag-id">ID:{{ a.id }}</div></div>
        <div class="ag-info">
          <div class="ag-head">{{ a.servico?.nome || 'Serviço não definido' }}</div>
          <p><b>CLIENTE</b> {{ a.cliente?.nome || 'Desconhecido' }}</p>
          <p><b>STATUS</b> <span class="status-chip"
            [class.status-chip-pendente]="a.status==='PENDENTE'"
            [class.status-chip-andamento]="a.status==='EM_ANDAMENTO'"
            [class.status-chip-concluido]="a.status==='CONCLUIDO'"
            [class.status-chip-cancelado]="a.status==='CANCELADO'">{{ a.status }}</span></p>
          <p><b>PLACA</b> {{ a.veiculo?.placa || 'Sem placa' }}</p>
          <p><b>MODELO</b> {{ a.veiculo?.modelo || 'Sem modelo' }}</p>
          <p><b>DATA INÍCIO</b> {{ a.dataInicio }}</p>
          <p><b>MECÂNICO</b> {{ a.mecanico?.nome || 'Não atribuído' }}</p>
          <p><b>DESCRIÇÃO</b> {{ a.descricao }}</p>
          <div class="ag-actions">
            <a class="app-btn app-btn-sm" [routerLink]="['/agendamentos', a.id]">Detalhes</a>
            <button class="app-btn app-btn-sm app-btn-ghost" (click)="openEdit(a)">Editar</button>
            <button class="app-btn app-btn-sm app-btn-danger" (click)="remove(a)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state app-panel" *ngIf="!loading && !filtered.length">
      <strong>Nenhum agendamento encontrado.</strong>
      <p>Quando houver registros, eles aparecerão em cartões nesta tela.</p>
    </div>

    <!-- Form Modal -->
    <app-modal [open]="modal" [title]="form.id ? 'Editar agendamento' : 'Novo agendamento'" (close)="modal=false">
      <div class="form-body">
        <div class="form-section-label">Partes envolvidas</div>
        <div class="form-group">
          <label class="fg-label">Cliente</label>
          <select class="fg-input" name="uid" [(ngModel)]="form.usuarioId">
            <option [value]="0">Selecione um cliente...</option>
            <option *ngFor="let u of clientes" [value]="u.id">{{ u.nome }} ({{ u.email }})</option>
          </select>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label class="fg-label">Mecânico (Opcional)</label>
          <select class="fg-input" name="mid" [(ngModel)]="form.mecanicoId">
            <option [value]="undefined">Nenhum mecânico selecionado</option>
            <option *ngFor="let m of mecanicos" [value]="m.id">{{ m.nome }}</option>
          </select>
        </div>

        <div class="form-section-label" style="margin-top:18px">Veículo e Serviço</div>
        <div class="form-grid-2">
          <div class="form-group full">
            <label class="fg-label">Veículo</label>
            <select class="fg-input" name="vid" [(ngModel)]="form.veiculoId">
              <option [value]="0">Selecione um veículo...</option>
              <option *ngFor="let v of veiculos" [value]="v.id">{{ v.placa }} — {{ v.modelo }} ({{ v.marca }})</option>
            </select>
          </div>
          <div class="form-group full">
            <label class="fg-label">Serviço</label>
            <select class="fg-input" name="sid" [(ngModel)]="form.servicoId">
              <option [value]="0">Selecione um serviço...</option>
              <option *ngFor="let s of servicos" [value]="s.id">{{ s.nome }} — R$ {{ s.valor }}</option>
            </select>
          </div>
        </div>

        <div class="form-section-label" style="margin-top:18px">Programação</div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="fg-label">Data de início</label>
            <input class="fg-input" type="date" name="di" [(ngModel)]="form.dataInicio" />
          </div>
          <div class="form-group">
            <label class="fg-label">Status</label>
            <select class="fg-input" name="st" [(ngModel)]="form.status">
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div class="form-group full">
            <label class="fg-label">Descrição / Observações</label>
            <textarea class="fg-input fg-textarea" rows="3" name="desc" [(ngModel)]="form.descricao" placeholder="Detalhes do agendamento..."></textarea>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>

    <!-- Delete Modal -->
    <app-modal [open]="deleteModal" title="Confirmar Exclusão" (close)="deleteModal=false">
      <div class="delete-body">
        <div class="delete-icon-svg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44" height="44" fill="none"
            stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <p class="delete-msg">
          Deseja remover o agendamento <strong>#{{ agendamentoToDelete?.id }}</strong>
          para o veículo <strong>{{ agendamentoToDelete?.veiculo?.placa }}</strong>?
        </p>
        <p class="delete-warn">Esta ação não poderá ser desfeita.</p>
      </div>
      <div class="form-footer">
        <button class="app-btn app-btn-ghost" (click)="deleteModal=false">Cancelar</button>
        <button class="app-btn app-btn-danger" (click)="confirmRemove()">Remover</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .f-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #e9e9e9;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .f-input:focus { border-color: rgba(255,106,0,.45); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }

    /* Cards */
    .cards { display: flex; flex-direction: column; gap: 18px; }
    .ag-card {
      background: linear-gradient(180deg, #ededed 0%, #dfdfdf 100%);
      border-radius: 18px; padding: 16px;
      display: grid; grid-template-columns: 300px 1fr;
      gap: 18px; box-shadow: var(--shadow); overflow: hidden;
    }
    .ag-img {
      background: linear-gradient(180deg, #ebebeb 0%, #dcdcdc 100%);
      border-radius: 18px; min-height: 190px; position: relative;
      display: flex; align-items: center; justify-content: center;
      color: #aaa; border: 1px solid rgba(0,0,0,.06); overflow: hidden;
    }
    .ag-img::after { content: ""; font-size: 64px; }
    .ag-id { position: absolute; top: 10px; left: 12px; font-size: 11px; color: #111; font-weight: 800; }
    .ag-info {
      background: linear-gradient(180deg, #565656 0%, #474747 100%);
      border-radius: 18px; padding: 18px; color: #fff;
      border: 1px solid rgba(255,255,255,.08);
    }
    .ag-head { color: var(--accent); font-weight: 900; text-align: center; letter-spacing: 2px; margin-bottom: 12px; }
    .ag-info p { margin: 4px 0; font-size: 13px; display: flex; gap: 12px; }
    .ag-info b { color: #111; min-width: 100px; font-size: 11px; letter-spacing: 1px; background: #eee; border-radius: 999px; padding: 2px 8px; align-self: flex-start; }
    .ag-actions { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }

    /* Form */
    .form-body { display: flex; flex-direction: column; }
    .form-section-label {
      font-size: 10px; text-transform: uppercase; font-weight: 800;
      letter-spacing: 1.2px; color: var(--accent); margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,106,0,.18); padding-bottom: 6px;
    }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
    .form-group { margin-bottom: 0; }
    .form-group.full { grid-column: 1 / -1; }
    .fg-label {
      display: block; font-size: 10px; text-transform: uppercase;
      font-weight: 800; color: #666; margin-bottom: 6px; letter-spacing: 0.6px;
    }
    .fg-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #ececec;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .fg-input:focus { border-color: rgba(255,106,0,.5); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }
    .fg-textarea { border-radius: var(--radius-sm); resize: vertical; min-height: 80px; }

    /* Footer */
    .form-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

    /* Delete */
    .delete-body { text-align: center; padding: 12px 0 4px; }
    .delete-icon-svg { display: flex; justify-content: center; margin-bottom: 16px; }
    .delete-msg { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: var(--text); }
    .delete-msg strong { color: var(--accent); }
    .delete-warn { margin: 0; color: #e05b50; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Skeleton */
    .skeleton-card { border: 1px solid rgba(255,255,255,0.05); }
    .ag-img-skeleton { background: rgba(0,0,0,0.06); border-radius: 18px; min-height: 190px; }
    .ag-info-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 18px; }
    .shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 37%, rgba(255,255,255,0.03) 63%);
      background-size: 400% 100%;
      animation: shimmer-anim 1.4s linear infinite;
      border-radius: 4px;
    }
    .header-shim { height: 22px; width: 60%; margin: 0 auto 12px; }
    .text-shim { height: 14px; }
    .btn-shim { height: 32px; width: 120px; border-radius: 999px; margin-top: 12px; }
    @keyframes shimmer-anim {
      0% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @media (max-width: 768px) {
      .ag-card { grid-template-columns: 1fr; }
      .head { flex-direction: column; }
      .head .app-btn { width: 100%; }
      .form-grid-2 { grid-template-columns: 1fr; }
      .filters { grid-template-columns: 1fr; }
    }
  `],
})
export class AgendamentosComponent implements OnInit {
  private agendamentoService = inject(AgendamentoService);
  private userService = inject(UserService);
  private veiculoService = inject(VeiculoService);
  private servicoService = inject(ServicoService);

  rows: Agendamento[] = [];
  search = '';
  filterStatus: '' | StatusAgendamento = '';
  filterUser = '';
  filterMec = '';
  modal = false;
  form: Agendamento = { usuarioId: 0, veiculoId: 0, servicoId: 0, dataInicio: '', status: 'PENDENTE', descricao: '' };

  deleteModal = false;
  agendamentoToDelete: Agendamento | null = null;
  loading = false;

  clientes: User[] = [];
  mecanicos: User[] = [];
  veiculos: Veiculo[] = [];
  servicos: Servico[] = [];

  ngOnInit() {
    this.loadAgendamentos();
    this.loadRelatedData();
  }

  loadAgendamentos() {
    this.loading = true;
    this.agendamentoService.list().subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: (err) => { console.error('Erro ao carregar agendamentos:', err); this.loading = false; }
    });
  }

  loadRelatedData() {
    this.userService.list().subscribe({
      next: (users) => {
        this.clientes = users.filter(u => u.role === 'CLIENTE');
        this.mecanicos = users.filter(u => u.role === 'MECANICO');
      },
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
    this.veiculoService.list().subscribe({
      next: (data) => { this.veiculos = data; },
      error: (err) => console.error('Erro ao carregar veículos:', err)
    });
    this.servicoService.list().subscribe({
      next: (data) => { this.servicos = data.filter(s => s.ativo); },
      error: (err) => console.error('Erro ao carregar serviços:', err)
    });
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r =>
      (!s || (r.descricao?.toLowerCase().includes(s) || r.veiculo?.placa?.toLowerCase().includes(s))) &&
      (!this.filterStatus || r.status === this.filterStatus) &&
      (!this.filterUser || String(r.usuarioId) === this.filterUser) &&
      (!this.filterMec || String(r.mecanicoId) === this.filterMec)
    );
  }

  openNew() {
    this.form = { usuarioId: 0, veiculoId: 0, servicoId: 0, dataInicio: '', status: 'PENDENTE', descricao: '' };
    this.modal = true;
  }

  openEdit(a: Agendamento) {
    this.form = { ...a };
    this.modal = true;
  }

  save() {
    if (!this.form.usuarioId || !this.form.veiculoId || !this.form.servicoId || !this.form.dataInicio) {
      alert('Por favor, preencha todos os campos obrigatórios (Cliente, Veículo, Serviço e Data de Início).');
      return;
    }
    this.loading = true;
    const obs = this.form.id
      ? this.agendamentoService.update(this.form.id, this.form)
      : this.agendamentoService.create(this.form);

    obs.subscribe({
      next: () => { this.modal = false; this.loadAgendamentos(); },
      error: (err) => {
        console.error('Erro ao salvar agendamento:', err);
        alert(err.error?.message || 'Erro ao salvar agendamento.');
        this.loading = false;
      }
    });
  }

  remove(a: Agendamento) {
    this.agendamentoToDelete = a;
    this.deleteModal = true;
  }

  confirmRemove() {
    if (this.agendamentoToDelete && this.agendamentoToDelete.id) {
      this.loading = true;
      this.agendamentoService.delete(this.agendamentoToDelete.id).subscribe({
        next: () => {
          this.deleteModal = false;
          this.agendamentoToDelete = null;
          this.loadAgendamentos();
        },
        error: (err) => {
          console.error('Erro ao remover agendamento:', err);
          alert(err.error?.message || 'Erro ao remover agendamento.');
          this.deleteModal = false;
          this.agendamentoToDelete = null;
          this.loading = false;
        }
      });
    }
  }
}
