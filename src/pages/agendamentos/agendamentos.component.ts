import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Agendamento, StatusAgendamento } from '../../models/models';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Agendamentos</h1>
        <p class="subtitle">Nenhum agendamento encontrado no momento.</p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo agendamento</button>
    </div>

    <div class="filters">
      <input class="input" placeholder="Pesquisar..." [(ngModel)]="search" />
      <select class="input" [(ngModel)]="filterStatus">
        <option value="">Todos os status</option>
        <option value="PENDENTE">Pendente</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="CONCLUIDO">Concluído</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <input class="input" placeholder="Usuário (id)" [(ngModel)]="filterUser" />
      <input class="input" placeholder="Mecânico (id)" [(ngModel)]="filterMec" />
    </div>

    <div class="cards" *ngIf="filtered.length; else emptyState">
      <div class="ag-card" *ngFor="let a of filtered">
        <div class="ag-img"><div class="ag-id">ID:{{ a.id }}</div></div>
        <div class="ag-info">
          <div class="ag-head">SERVIÇOS</div>
          <p><b>STATUS</b> <span class="status-chip"
            [class.status-chip-pendente]="a.status==='PENDENTE'"
            [class.status-chip-andamento]="a.status==='EM_ANDAMENTO'"
            [class.status-chip-concluido]="a.status==='CONCLUIDO'"
            [class.status-chip-cancelado]="a.status==='CANCELADO'">{{ a.status }}</span></p>
          <p><b>PLACA</b> {{ a.veiculo?.placa }}</p>
          <p><b>DATA INÍCIO</b> {{ a.dataInicio }}</p>
          <p><b>MODELO</b> {{ a.veiculo?.modelo }}</p>
          <p><b>ANO</b> {{ a.veiculo?.ano }}</p>
          <p><b>DESCRIÇÃO</b> {{ a.descricao }}</p>
          <div class="ag-actions">
            <a class="app-btn app-btn-sm" [routerLink]="['/agendamentos', a.id]">Detalhes</a>
            <button class="app-btn app-btn-sm app-btn-ghost" (click)="openEdit(a)">Editar</button>
            <button class="app-btn app-btn-sm app-btn-danger" (click)="remove(a)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #emptyState>
      <div class="empty-state app-panel">
        <strong>Nenhum agendamento encontrado.</strong>
        <p>Quando houver registros, eles aparecerão em cartões nesta tela.</p>
      </div>
    </ng-template>

    <app-modal [open]="modal" [title]="form.id ? 'Editar agendamento' : 'Novo agendamento'" (close)="modal=false">
      <label>Veículo (id)</label><input class="input" type="number" name="vid" [(ngModel)]="form.veiculoId" />
      <label>Serviço (id)</label><input class="input" type="number" name="sid" [(ngModel)]="form.servicoId" />
      <label>Mecânico (id)</label><input class="input" type="number" name="mid" [(ngModel)]="form.mecanicoId" />
      <label>Data início</label><input class="input" type="date" name="di" [(ngModel)]="form.dataInicio" />
      <label>Status</label>
      <select class="input" name="st" [(ngModel)]="form.status">
        <option value="PENDENTE">Pendente</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="CONCLUIDO">Concluído</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <label>Descrição</label><textarea class="input" rows="3" name="desc" [(ngModel)]="form.descricao"></textarea>
      <div style="margin-top:18px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .cards { display: flex; flex-direction: column; gap: 18px; }
    .ag-card {
      background: linear-gradient(180deg, #ededed 0%, #dfdfdf 100%);
      border-radius: 18px;
      padding: 16px;
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 18px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .ag-img {
      background: linear-gradient(180deg, #ebebeb 0%, #dcdcdc 100%);
      border-radius: 18px;
      min-height: 190px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #aaa;
      border: 1px solid rgba(0,0,0,.06);
      overflow: hidden;
    }
    .ag-img::after { content: "🚗"; font-size: 64px; filter: grayscale(1) contrast(.95); }
    .ag-id { position: absolute; top: 10px; left: 12px; font-size: 11px; color: #111; font-weight: 800; }
    .ag-info {
      background: linear-gradient(180deg, #565656 0%, #474747 100%);
      border-radius: 18px;
      padding: 18px;
      color: #fff;
      border: 1px solid rgba(255,255,255,.08);
    }
    .ag-head { color: var(--accent); font-weight: 900; text-align: center; letter-spacing: 2px; margin-bottom: 12px; }
    .ag-info p { margin: 4px 0; font-size: 13px; display: flex; gap: 12px; }
    .ag-info b { color: #111; min-width: 100px; font-size: 11px; letter-spacing: 1px; background: #eee; border-radius: 999px; padding: 2px 8px; align-self: flex-start; }
    .ag-actions { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
    label { display:block; font-size:11px; text-transform:uppercase; font-weight:700; color:#555; margin: 12px 0 6px; }
    @media (max-width: 768px) { .ag-card { grid-template-columns: 1fr; } .head { flex-direction: column; } .head .app-btn { width: 100%; } }
  `],
})
export class AgendamentosComponent {
  rows: Agendamento[] = [];
  search = ''; filterStatus: '' | StatusAgendamento = ''; filterUser = ''; filterMec = '';
  modal = false;
  form: Agendamento = { usuarioId: 0, veiculoId: 0, servicoId: 0, dataInicio: '', status: 'PENDENTE', descricao: '' };

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r =>
      (!s || (r.descricao?.toLowerCase().includes(s) || r.veiculo?.placa?.toLowerCase().includes(s))) &&
      (!this.filterStatus || r.status === this.filterStatus) &&
      (!this.filterUser || String(r.usuarioId) === this.filterUser) &&
      (!this.filterMec || String(r.mecanicoId) === this.filterMec)
    );
  }
  openNew() { this.form = { usuarioId: 0, veiculoId: 0, servicoId: 0, dataInicio: '', status: 'PENDENTE', descricao: '' }; this.modal = true; }
  openEdit(a: Agendamento) { this.form = { ...a }; this.modal = true; }
  save() { this.modal = false; }
  remove(_: Agendamento) { }
}
