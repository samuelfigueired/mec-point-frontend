import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Agendamento, StatusAgendamento, User, Veiculo, Servico } from '../../models/models';
import { AgendamentoService } from '../../services/agendamento.service';
import { UserService } from '../../services/user.service';
import { VeiculoService } from '../../services/veiculo.service';
import { ServicoService } from '../../services/servico.service';
import { AuthService } from '../../services/auth.service';

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
      <div class="head-actions">
        <div class="view-toggle">
          <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Visualização em grade">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Grade
          </button>
          <button class="view-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="Visualização em lista">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Lista
          </button>
        </div>
        <button *ngIf="isCliente || isAdmin" class="app-btn" (click)="openNew()">+ Novo agendamento</button>
      </div>
    </div>

    <div class="filters">
      <input class="f-input" placeholder="Pesquisar por descrição ou placa..." [(ngModel)]="search" />
      <select class="f-input" [(ngModel)]="filterStatus">
        <option value="">Todos os status</option>
        <option value="PENDENTE">Pendente</option>
        <option value="AGENDADO">Agendado</option>
        <option value="CONFIRMADO">Confirmado</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="QUASE_FINALIZADO">Quase finalizado</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <select *ngIf="isAdmin" class="f-input" [(ngModel)]="filterUser">
        <option value="">Todos os clientes</option>
        <option *ngFor="let u of clientes" [value]="u.id">{{ u.nome }}</option>
      </select>
      <select *ngIf="isAdmin || isCliente" class="f-input" [(ngModel)]="filterMec">
        <option value="">Todos os mecânicos</option>
        <option *ngFor="let m of mecanicos" [value]="m.id">{{ m.nome }}</option>
      </select>
    </div>

    <!-- Shimmer loading skeleton (grade) -->
    <div class="cards" *ngIf="loading && viewMode === 'grid'">
      <div class="ag-card skeleton-card" *ngFor="let placeholder of [1, 2, 3]">
        <div class="shimmer" style="width: 100%; height: 140px; border-radius: var(--radius-sm); margin-bottom: 4px;"></div>
        <div class="ag-card-header">
          <div class="shimmer header-shim" style="width: 70%; height: 16px;"></div>
          <div class="shimmer id-shim" style="width: 40px; height: 16px; border-radius: 999px;"></div>
        </div>
        <div class="shimmer status-shim" style="width: 80px; height: 20px; border-radius: 999px; margin-top: 4px;"></div>
        <div class="ag-card-body" style="gap: 12px; margin-top: 6px;">
          <div class="shimmer text-shim" style="width: 100%; height: 12px;"></div>
          <div class="shimmer text-shim" style="width: 85%; height: 12px;"></div>
          <div class="shimmer text-shim" style="width: 90%; height: 12px;"></div>
        </div>
        <div class="ag-actions" style="border-top: 1px solid rgba(0,0,0,.04); padding-top: 12px; margin-top: 8px;">
          <div class="shimmer btn-shim" style="width: 80px; height: 30px; border-radius: var(--radius-sm);"></div>
        </div>
      </div>
    </div>

    <!-- Shimmer loading skeleton (lista) -->
    <div class="list-view" *ngIf="loading && viewMode === 'list'">
      <div class="list-item skeleton-list" *ngFor="let placeholder of [1, 2, 3, 4]">
        <div class="shimmer" style="width: 60px; height: 20px; border-radius: 999px; flex-shrink:0;"></div>
        <div class="list-item-main">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="shimmer" style="width: 42px; height: 32px; border-radius: var(--radius-sm); flex-shrink:0;"></div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div class="shimmer" style="width: 200px; height: 14px;"></div>
              <div class="shimmer" style="width: 140px; height: 11px;"></div>
            </div>
          </div>
        </div>
        <div class="shimmer" style="width: 120px; height: 12px;"></div>
        <div class="shimmer" style="width: 90px; height: 12px;"></div>
        <div class="shimmer btn-shim" style="width: 70px; height: 28px; border-radius: var(--radius-sm); flex-shrink:0;"></div>
      </div>
    </div>

    <!-- GRADE: Real cards -->
    <div class="cards" *ngIf="!loading && filtered.length && viewMode === 'grid'">
      <div class="ag-card" *ngFor="let a of filtered">
        <div class="ag-card-image">
          <img [src]="getCarImage(a)" alt="Veículo" class="ag-vehicle-img" />
        </div>

        <div class="ag-card-header">
          <div class="ag-service">{{ a.servico || a.servicoNome || 'Serviço não definido' }}</div>
          <span class="ag-id">#{{ a.id }}</span>
        </div>

        <div class="ag-status-row">
          <span class="status-chip"
            [class.status-chip-pendente]="a.status==='PENDENTE'"
            [class.status-chip-andamento]="a.status==='EM_ANDAMENTO' || a.status==='AGENDADO' || a.status==='CONFIRMADO' || a.status==='QUASE_FINALIZADO'"
            [class.status-chip-concluido]="a.status==='FINALIZADO'"
            [class.status-chip-cancelado]="a.status==='CANCELADO'">{{ formatStatus(a.status) }}</span>
        </div>

        <div class="ag-card-body">
          <div class="info-row">
            <span class="info-label">Cliente</span>
            <span class="info-val">{{ a.cliente || a.usuarioNome || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Veículo</span>
            <span class="info-val font-bold">{{ a.veiculoModelo || '—' }} <small class="text-muted">({{ a.veiculoPlaca || '—' }})</small></span>
          </div>
          <div class="info-row" *ngIf="a.mecanicoNome">
            <span class="info-label">Mecânico</span>
            <span class="info-val">{{ a.mecanicoNome }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data/Hora</span>
            <span class="info-val">{{ formatDate(a.dataHora) }}</span>
          </div>
          <div class="info-desc" *ngIf="a.descricao">
            {{ a.descricao }}
          </div>
        </div>

        <div class="ag-actions">
          <a class="app-btn app-btn-sm" [routerLink]="['/agendamentos', a.id]">Detalhes</a>
          <button *ngIf="isAdmin" class="app-btn app-btn-sm app-btn-ghost" (click)="openEdit(a)">Editar</button>
          <button *ngIf="isAdmin" class="app-btn app-btn-sm app-btn-danger" (click)="remove(a)">Excluir</button>
        </div>
      </div>
    </div>

    <!-- LISTA: List view -->
    <div class="list-view" *ngIf="!loading && filtered.length && viewMode === 'list'">
      <div class="list-header">
        <span>Status</span>
        <span>Serviço / Veículo</span>
        <span>Cliente</span>
        <span>Mecânico</span>
        <span>Data/Hora</span>
        <span></span>
      </div>
      <div class="list-item" *ngFor="let a of filtered">
        <div class="list-status">
          <span class="status-chip status-chip-sm"
            [class.status-chip-pendente]="a.status==='PENDENTE'"
            [class.status-chip-andamento]="a.status==='EM_ANDAMENTO' || a.status==='AGENDADO' || a.status==='CONFIRMADO' || a.status==='QUASE_FINALIZADO'"
            [class.status-chip-concluido]="a.status==='FINALIZADO'"
            [class.status-chip-cancelado]="a.status==='CANCELADO'">{{ formatStatus(a.status) }}</span>
        </div>
        <div class="list-item-main">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img [src]="getCarImage(a)" alt="Veículo" style="width: 42px; height: 32px; object-fit: cover; border-radius: var(--radius-sm); border: 1.5px solid rgba(0,0,0,0.1); flex-shrink: 0;" />
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
              <span class="list-service">{{ a.servico || a.servicoNome || 'Serviço não definido' }}</span>
              <span class="list-vehicle">{{ a.veiculoModelo || '—' }} <small class="text-muted">({{ a.veiculoPlaca || '—' }})</small></span>
            </div>
          </div>
        </div>
        <span class="list-cell">{{ a.cliente || a.usuarioNome || '—' }}</span>
        <span class="list-cell list-cell-muted">{{ a.mecanicoNome || '—' }}</span>
        <span class="list-cell list-cell-date">{{ formatDate(a.dataHora) }}</span>
        <div class="list-actions">
          <a class="app-btn app-btn-sm" [routerLink]="['/agendamentos', a.id]">Detalhes</a>
          <button *ngIf="isAdmin" class="app-btn app-btn-sm app-btn-ghost" (click)="openEdit(a)">Editar</button>
          <button *ngIf="isAdmin" class="app-btn app-btn-sm app-btn-danger" (click)="remove(a)">Excluir</button>
        </div>
      </div>
    </div>

    <div class="empty-state app-panel" *ngIf="!loading && !filtered.length">
      <strong>Nenhum agendamento encontrado.</strong>
      <p>Quando houver registros, eles aparecerão nesta tela.</p>
    </div>

    <!-- Form Modal -->
    <app-modal [open]="modal" [title]="form.id ? 'Editar agendamento' : 'Novo agendamento'" (close)="modal=false">
      <div class="form-body">
        <div class="form-section-label">Partes envolvidas</div>
        <div class="form-group" *ngIf="isAdmin">
          <label class="fg-label">Cliente</label>
          <select class="fg-input" name="uid" [ngModel]="form.usuarioId" (ngModelChange)="onClientChange($event)">
            <option [value]="0">Selecione um cliente...</option>
            <option *ngFor="let u of clientes" [value]="u.id">{{ u.nome }} ({{ u.email }})</option>
          </select>
        </div>
        <div class="form-group" [style.margin-top]="isAdmin ? '12px' : '0px'">
          <label class="fg-label">Mecânico <span class="required-star">*</span></label>
          <select class="fg-input" name="mid" [(ngModel)]="form.mecanicoId">
            <option [value]="undefined">Selecione um mecânico...</option>
            <option *ngFor="let m of mecanicos" [value]="m.id">{{ m.nome }}</option>
          </select>
          <span class="fg-hint" *ngIf="mecanicos.length === 0">Nenhum mecânico disponível. Cadastre um novo usuário com perfil Mecânico.</span>
        </div>

        <div class="form-section-label" style="margin-top:18px">Veículo e Serviço</div>
        <div class="form-grid-2">
          <div class="form-group full">
            <label class="fg-label">Veículo</label>
            <select class="fg-input" name="vid" [(ngModel)]="form.veiculoId">
              <option [value]="0">Selecione um veículo...</option>
              <option *ngFor="let v of filteredVeiculos" [value]="v.id">{{ v.placa }} — {{ v.modelo }} ({{ v.marca }})</option>
            </select>
            <span class="fg-hint" *ngIf="isAdmin && form.usuarioId && filteredVeiculos.length === 0">Este cliente não possui veículos cadastrados.</span>
            <span class="fg-hint" *ngIf="isAdmin && !form.usuarioId">Selecione um cliente para ver seus veículos.</span>
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
          <div class="form-group" [class.full]="!isAdmin">
            <label class="fg-label">Data de início</label>
            <input class="fg-input" type="datetime-local" name="di" [(ngModel)]="form.dataHora" />
          </div>
          <div class="form-group" *ngIf="isAdmin">
            <label class="fg-label">Status</label>
            <select class="fg-input" name="st" [(ngModel)]="form.status">
              <option value="PENDENTE">Pendente</option>
              <option value="AGENDADO">Agendado</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="QUASE_FINALIZADO">Quase finalizado</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div class="form-group full">
            <label class="fg-label">Descrição / Observações</label>
            <textarea class="fg-input fg-textarea" rows="3" name="desc" [(ngModel)]="form.descricao" placeholder="Detalhes do agendamento..."></textarea>
          </div>
        </div>
      </div>

      <div class="save-error-banner" *ngIf="saveError">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {{ saveError }}
      </div>

      <div class="form-footer">
        <button class="app-btn app-btn-ghost" [disabled]="saving" (click)="modal=false">Cancelar</button>
        <button class="app-btn" [disabled]="saving" (click)="save()">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
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
          para o veículo <strong>{{ agendamentoToDelete?.veiculoPlaca }}</strong>?
        </p>
        <p class="delete-warn">Esta ação não poderá ser desfeita.</p>
      </div>
      <div class="form-footer">
        <button class="app-btn app-btn-ghost" [disabled]="removing" (click)="deleteModal=false">Cancelar</button>
        <button class="app-btn app-btn-danger" [disabled]="removing" (click)="confirmRemove()">{{ removing ? 'Removendo...' : 'Remover' }}</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .head-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .f-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #e9e9e9;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .f-input:focus { border-color: rgba(255,106,0,.45); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }

    /* View toggle */
    .view-toggle {
      display: flex;
      background: rgba(0,0,0,.06);
      border-radius: var(--radius-sm);
      padding: 3px;
      gap: 2px;
    }
    .view-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 10px; border-radius: calc(var(--radius-sm) - 2px);
      border: none; background: transparent; cursor: pointer;
      font-size: 11px; font-weight: 700; font-family: inherit;
      color: #666; letter-spacing: 0.3px;
      transition: background .15s, color .15s, box-shadow .15s;
    }
    .view-btn:hover { color: var(--text); background: rgba(0,0,0,.06); }
    .view-btn.active {
      background: #fff;
      color: var(--accent);
      box-shadow: 0 1px 4px rgba(0,0,0,.12);
    }

    /* Cards (grade) */
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .ag-card {
      background: linear-gradient(180deg, #ededed 0%, #e3e3e3 100%);
      border-radius: 18px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(0,0,0,.04);
      transition: transform .15s ease, box-shadow .15s ease;
      position: relative;
    }
    .ag-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0,0,0,.08);
    }
    .ag-card-image {
      width: 100%;
      height: 140px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 2px;
      position: relative;
    }
    .ag-vehicle-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .ag-card:hover .ag-vehicle-img {
      transform: scale(1.05);
    }
    .ag-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 1px solid rgba(0,0,0,.06);
      padding-bottom: 10px;
    }
    .ag-service {
      font-weight: 900;
      font-size: 14px;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .ag-id {
      font-size: 10px;
      font-weight: 800;
      color: var(--accent);
      background: rgba(255,106,0,.12);
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .ag-status-row {
      display: flex;
    }
    .ag-card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      border-bottom: 1px dashed rgba(0,0,0,.04);
      padding-bottom: 4px;
    }
    .info-label {
      color: #666;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.6px;
    }
    .info-val {
      color: var(--text);
      font-weight: 600;
      text-align: right;
    }
    .info-val.font-bold {
      font-weight: 800;
    }
    .text-muted {
      color: #888;
    }
    .info-desc {
      margin-top: 6px;
      font-size: 12px;
      color: #555;
      font-style: italic;
      background: rgba(0,0,0,.03);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--accent);
      line-height: 1.4;
    }
    .ag-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
      border-top: 1px solid rgba(0,0,0,.06);
      padding-top: 12px;
    }

    /* List view */
    .list-view {
      display: flex;
      flex-direction: column;
      gap: 0;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: var(--shadow-soft);
    }
    .list-header {
      display: grid;
      grid-template-columns: 140px 1fr 160px 140px 150px auto;
      gap: 12px;
      align-items: center;
      padding: 10px 18px;
      background: rgba(0,0,0,.06);
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #777;
    }
    .list-item {
      display: grid;
      grid-template-columns: 140px 1fr 160px 140px 150px auto;
      gap: 12px;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(180deg, #ededed 0%, #e8e8e8 100%);
      border-top: 1px solid rgba(0,0,0,.05);
      transition: background .12s;
    }
    .list-item:first-of-type { border-top: none; }
    .list-item:hover { background: #e2e2e2; }
    .list-status { display: flex; align-items: center; }
    .list-item-main {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .list-service {
      font-weight: 800;
      font-size: 13px;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .list-vehicle {
      font-size: 11px;
      color: #666;
      font-weight: 600;
    }
    .list-cell {
      font-size: 12px;
      color: var(--text);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .list-cell-muted { color: #777; font-weight: 500; }
    .list-cell-date { font-variant-numeric: tabular-nums; font-size: 11px; }
    .list-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      flex-shrink: 0;
    }
    .skeleton-list {
      background: #f0f0f0;
    }
    .status-chip-sm {
      font-size: 9px;
      padding: 3px 8px;
    }

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
    .skeleton-card {
      border: 1px solid rgba(0,0,0,.04);
      background: #f7f7f7;
    }
    .shimmer {
      background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.1) 37%, rgba(0,0,0,0.04) 63%);
      background-size: 400% 100%;
      animation: shimmer-anim 1.4s linear infinite;
      border-radius: 4px;
    }
    @keyframes shimmer-anim {
      0% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Save error banner */
    .save-error-banner {
      display: flex; align-items: flex-start; gap: 8px;
      background: rgba(224,91,80,.08); border: 1.5px solid rgba(224,91,80,.3);
      border-radius: var(--radius-sm); padding: 10px 14px;
      color: #e05b50; font-size: 12px; font-weight: 600; line-height: 1.5;
      margin-top: 16px;
    }
    .save-error-banner svg { flex-shrink: 0; margin-top: 1px; }
    .required-star { color: #e05b50; margin-left: 2px; }
    .fg-hint { display: block; font-size: 11px; color: #888; margin-top: 4px; font-style: italic; }
    .fg-hint-warn { display: block; font-size: 11px; color: #b45309; margin-top: 5px; background: rgba(245,158,11,.08); border-radius: 4px; padding: 4px 8px; border-left: 3px solid #d97706; }

    @media (max-width: 900px) {
      .list-header { display: none; }
      .list-item {
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto auto;
        gap: 8px 12px;
        padding: 14px 14px;
      }
      .list-status { grid-column: 1; grid-row: 1; }
      .list-item-main { grid-column: 2; grid-row: 1; }
      .list-cell, .list-cell-date { grid-column: 1 / -1; }
      .list-actions { grid-column: 1 / -1; justify-content: flex-start; }
    }

    @media (max-width: 768px) {
      .cards { grid-template-columns: 1fr; }
      .head { flex-direction: column; align-items: stretch; }
      .head-actions { flex-wrap: wrap; }
      .head-actions .app-btn { flex: 1; }
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
  private authService = inject(AuthService);

  get role() {
    return this.authService.role;
  }
  get isAdmin() {
    return this.role === 'ADMIN';
  }
  get isCliente() {
    return this.role === 'CLIENTE';
  }
  get isMecanico() {
    return this.role === 'MECANICO';
  }

  viewMode: 'grid' | 'list' = 'grid';

  rows: Agendamento[] = [];
  search = '';
  filterStatus: '' | StatusAgendamento = '';
  filterUser = '';
  filterMec = '';
  modal = false;
  saveError = '';
  form: Agendamento = { usuarioId: 0, veiculoId: 0, servicoId: 0, dataHora: '', status: 'PENDENTE', descricao: '' };

  deleteModal = false;
  agendamentoToDelete: Agendamento | null = null;
  loading = false;
  saving = false;
  removing = false;

  clientes: User[] = [];
  mecanicos: User[] = [];
  allVeiculos: Veiculo[] = [];  // All vehicles (admin only, for filtering)
  veiculos: Veiculo[] = [];
  servicos: Servico[] = [];

  // Vehicles filtered by selected client (for admin only)
  get filteredVeiculos(): Veiculo[] {
    if (!this.isAdmin) return this.veiculos;
    // eslint-disable-next-line eqeqeq
    if (!this.form.usuarioId || this.form.usuarioId == 0) return [];
    // Use == (loose) to handle string vs number comparison from select option values
    // eslint-disable-next-line eqeqeq
    return this.allVeiculos.filter(v => v.usuarioId != null && v.usuarioId == this.form.usuarioId);
  }

  ngOnInit() {
    this.loadAgendamentos();
    this.loadRelatedData();
  }

  loadAgendamentos() {
    this.loading = true;
    const role = this.role;
    let obs$;
    if (role === 'ADMIN') {
      obs$ = this.agendamentoService.list();
    } else if (role === 'CLIENTE') {
      obs$ = this.agendamentoService.meus();
    } else { // MECANICO
      const mid = this.authService.currentUser?.id;
      obs$ = mid ? this.agendamentoService.byMecanico(mid) : this.agendamentoService.meus();
    }

    obs$.subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: (err) => { console.error('Erro ao carregar agendamentos:', err); this.loading = false; }
    });
  }

  loadRelatedData() {
    const role = this.role;
    if (role === 'ADMIN') {
      this.userService.list().subscribe({
        next: (users) => {
          this.clientes = users.filter(u => u.role === 'CLIENTE');
        },
        error: (err) => console.error('Erro ao carregar clientes:', err)
      });
      this.loadMecanicos();
      this.veiculoService.list().subscribe({
        next: (data) => { this.allVeiculos = data; this.veiculos = data; },
        error: (err) => console.error('Erro ao carregar veículos:', err)
      });
      this.servicoService.ativos().subscribe({
        next: (data) => { this.servicos = data; },
        error: (err) => console.error('Erro ao carregar serviços:', err)
      });
    } else if (role === 'CLIENTE' || role === 'MECANICO') {
      const cur = this.authService.currentUser;
      this.clientes = cur && role === 'CLIENTE' ? [cur] : [];
      
      this.loadMecanicos();
      if (role === 'CLIENTE') {
        this.veiculoService.meus().subscribe({
          next: (data) => { this.veiculos = data; },
          error: (err) => console.error('Erro ao carregar veículos:', err)
        });
      }
      this.servicoService.ativos().subscribe({
        next: (data) => { this.servicos = data; },
        error: (err) => console.error('Erro ao carregar serviços ativos:', err)
      });
    }
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r =>
      (!s || (r.descricao?.toLowerCase().includes(s) || r.veiculoPlaca?.toLowerCase().includes(s))) &&
      (!this.filterStatus || r.status === this.filterStatus) &&
      (!this.filterUser || String(r.usuarioId) === this.filterUser) &&
      (!this.filterMec || String(r.mecanicoId) === this.filterMec)
    );
  }

  openNew() {
    const curId = this.authService.currentUser?.id || 0;
    this.saveError = '';
    this.form = {
      usuarioId: this.isCliente ? curId : 0,
      veiculoId: 0,
      mecanicoId: undefined,
      servicoId: 0,
      dataHora: '',
      status: 'PENDENTE',
      descricao: ''
    };

    // Always refresh related data before opening so newly created users/vehicles appear
    if (this.isAdmin) {
      this.userService.list().subscribe({
        next: (users) => {
          this.clientes = users.filter(u => u.role === 'CLIENTE');
        }
      });
      this.loadMecanicos();
      this.veiculoService.list().subscribe({
        next: (data) => { this.allVeiculos = data; }
      });
    } else if (this.isCliente || this.isMecanico) {
      if (this.isCliente) {
        this.veiculoService.meus().subscribe({
          next: (data) => { this.veiculos = data; }
        });
      }
      this.loadMecanicos();
    }

    this.modal = true;
  }

  openEdit(a: Agendamento) {
    this.saveError = '';
    this.form = { ...a };
    this.modal = true;
  }

  onClientChange(clienteId: number) {
    this.form.usuarioId = Number(clienteId);
    // Reset vehicle when client changes to prevent ownership mismatch
    this.form.veiculoId = 0;
  }

  private loadMecanicos(): void {
    this.userService.listMecanicos().pipe(
      catchError((err) => {
        console.warn('Falha ao carregar mecânicos pelo endpoint dedicado, usando filtro geral:', err);
        return this.userService.list().pipe(
          map(users => users.filter(user => user.role === 'MECANICO'))
        );
      })
    ).subscribe({
      next: (mecanicos) => { this.mecanicos = mecanicos; },
      error: (err) => console.error('Erro ao carregar mecânicos:', err)
    });
  }

  save() {
    this.saveError = '';
    if (!this.form.usuarioId || !this.form.veiculoId || !this.form.servicoId || !this.form.dataHora) {
      this.saveError = 'Por favor, preencha todos os campos obrigatórios: Cliente, Veículo, Serviço e Data de Início.';
      return;
    }
    if (!this.form.mecanicoId) {
      this.saveError = 'Selecione um mecânico para prosseguir. O campo Mecânico é obrigatório.';
      return;
    }

    // Ensure dataHora has seconds (datetime-local returns 'YYYY-MM-DDTHH:mm' without seconds)
    let dataHora = this.form.dataHora;
    if (dataHora && !dataHora.match(/T\d{2}:\d{2}:\d{2}/)) {
      dataHora = dataHora + ':00';
    }

    // Build clean payload — backend requires both FK IDs and denormalized text fields
    const selectedCliente = this.clientes.find(c => c.id == this.form.usuarioId);
    const selectedServico = this.servicos.find(s => s.id == this.form.servicoId);

    const payload: Record<string, unknown> = {
      usuarioId: Number(this.form.usuarioId),
      veiculoId: Number(this.form.veiculoId),
      servicoId: Number(this.form.servicoId),
      mecanicoId: Number(this.form.mecanicoId),
      dataHora,
      status: this.form.status,
      descricao: this.form.descricao || null,
      // Required string fields (backend stores denormalized name alongside FK)
      cliente: selectedCliente?.nome || '',
      servico: selectedServico?.nome || '',
    };

    this.saving = true;
    const obs = this.form.id
      ? this.agendamentoService.update(this.form.id, payload as any)
      : this.agendamentoService.create(payload as any);

    obs.subscribe({
      next: () => { 
        this.saving = false;
        this.modal = false; 
        this.loadAgendamentos(); 
      },
      error: (err) => {
        console.error('Erro ao salvar agendamento:', err.error);
        const details: string[] = err.error?.details || [];
        const backendMsg: string = err.error?.message || '';
        const backendError: string = err.error?.error || '';

        if (details.length) {
          this.saveError = details.join(' | ');
        } else if (backendError === 'Violação de integridade' || backendMsg.toLowerCase().includes('vínculo') || backendMsg.toLowerCase().includes('outro registro')) {
          this.saveError = 'Erro de integridade no banco de dados. Isso geralmente ocorre quando o cliente ou mecânico foi criado pelo painel admin (não pelo cadastro padrão). '
            + 'Use usuários que se registraram normalmente no sistema, ou solicite ao desenvolvedor do backend que corrija o endpoint POST /users para inicializar os registros nas tabelas de clientes/mecânicos.';
        } else {
          this.saveError = backendMsg || 'Erro ao salvar agendamento. Verifique os dados e tente novamente.';
        }
        this.saving = false;
      }
    });
  }

  remove(a: Agendamento) {
    this.agendamentoToDelete = a;
    this.deleteModal = true;
  }

  confirmRemove() {
    if (this.agendamentoToDelete && this.agendamentoToDelete.id) {
      const id = this.agendamentoToDelete.id;
      this.removing = true;

      this.agendamentoService.listEventos(id).pipe(
        catchError(err => {
          console.warn('Erro ao listar eventos do agendamento, prosseguindo com exclusão direta:', err);
          return of([]);
        }),
        switchMap(eventos => {
          if (eventos && eventos.length > 0) {
            const deleteRequests = eventos.map(e => this.agendamentoService.deleteEvento(e.id!));
            return forkJoin(deleteRequests).pipe(
              catchError(deleteEventsErr => {
                console.warn('Erro ao deletar eventos do agendamento, tentando deletar agendamento mesmo assim:', deleteEventsErr);
                return of(null);
              })
            );
          }
          return of(null);
        }),
        switchMap(() => this.agendamentoService.delete(id))
      ).subscribe({
        next: () => {
          this.removing = false;
          this.deleteModal = false;
          this.agendamentoToDelete = null;
          this.loadAgendamentos();
        },
        error: (err) => {
          console.error('Erro ao remover agendamento:', err);
          alert(err.error?.message || 'Erro ao remover agendamento.');
          this.removing = false;
          this.deleteModal = false;
          this.agendamentoToDelete = null;
        }
      });
    }
  }

  getCarImage(a: Agendamento): string {
    const model = a.veiculoModelo?.toLowerCase() || '';
    if (model.includes('seal') || model.includes('byd') || model.includes('dolphin')) {
      return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('pulse') || model.includes('compass') || model.includes('renegade') || model.includes('tracker') || model.includes('creta') || model.includes('t-cross') || model.includes('hr-v') || model.includes('suv')) {
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('porsche') || model.includes('mustang') || model.includes('ferrari') || model.includes('camaro') || model.includes('bmw') || model.includes('audi') || model.includes('mercedes')) {
      return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('civic') || model.includes('corolla') || model.includes('sentra') || model.includes('cruze') || model.includes('sedan')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('gol') || model.includes('uno') || model.includes('palio') || model.includes('hb20') || model.includes('onix') || model.includes('argo') || model.includes('sandero')) {
      return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600';
    }
    const id = a.id || 0;
    const fallbacks = [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600'
    ];
    return fallbacks[id % fallbacks.length];
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}
