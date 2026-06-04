import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Servico } from '../../models/models';
import { ServicoService } from '../../services/servico.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Serviços</h1>
        <p class="subtitle">
          <ng-container *ngIf="loading">Carregando serviços...</ng-container>
          <ng-container *ngIf="!loading">
            {{ rawServices.length }} {{ rawServices.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados' }} no momento.
          </ng-container>
        </p>
      </div>
      <button *ngIf="isAdmin" class="app-btn" (click)="openNew()">+ Novo</button>
    </div>
    <div class="filter-row">
      <input class="f-input" placeholder="Pesquisar por nome..." [(ngModel)]="search" />
    </div>
    
    <app-table 
      [columns]="columns" 
      [rows]="filtered" 
      [loading]="loading"
      [actions]="isAdmin"
      emptyMessage="Nenhum serviço disponível." 
      (edit)="openEdit($event)" 
      (remove)="remove($event)" 
    />

    <!-- Form Modal -->
    <app-modal [open]="modal" [title]="form.id ? 'Editar serviço' : 'Novo serviço'" (close)="modal=false">
      <div class="form-body">
        <div class="form-section-label">Informações do serviço</div>
        <div class="form-group">
          <label class="fg-label">Nome do serviço</label>
          <input class="fg-input" name="nome" [(ngModel)]="form.nome" placeholder="Ex: Alinhamento e Balanceamento" />
        </div>

        <div class="form-group" style="margin-top:12px">
          <label class="fg-label">Descrição</label>
          <textarea class="fg-input fg-textarea" rows="3" name="descricao" [(ngModel)]="form.descricao" placeholder="Descreva brevemente o serviço..."></textarea>
        </div>

        <div class="form-section-label" style="margin-top:18px">Preço e Status</div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="fg-label">Preço (R$)</label>
            <input class="fg-input" type="number" name="valor" [(ngModel)]="form.valor" min="0" step="0.01" placeholder="0,00" />
          </div>

          <div class="form-group">
            <label class="fg-label">Status</label>
            <div class="toggle-wrap" (click)="form.ativo = !form.ativo">
              <div class="toggle-track" [class.on]="form.ativo">
                <div class="toggle-thumb"></div>
              </div>
              <span class="toggle-label" [class.active]="form.ativo">
                {{ form.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>

        <p class="err-msg" *ngIf="error">{{ error }}</p>
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
          Deseja realmente excluir o serviço <strong>{{ serviceToDelete?.nome }}</strong>?
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
    .head {
      display: flex; justify-content: space-between;
      align-items: flex-start; gap: 16px; margin-bottom: 16px;
    }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filter-row { margin-bottom: 16px; max-width: 380px; }
    .f-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #e9e9e9;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .f-input:focus { border-color: rgba(255,106,0,.45); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }

    /* Form layout */
    .form-body { display: flex; flex-direction: column; }
    .form-section-label {
      font-size: 10px; text-transform: uppercase; font-weight: 800;
      letter-spacing: 1.2px; color: var(--accent); margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,106,0,.18); padding-bottom: 6px;
    }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
    .form-group { margin-bottom: 0; }

    .fg-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 10px; text-transform: uppercase; font-weight: 800;
      color: #666; margin-bottom: 6px; letter-spacing: 0.6px;
    }
    .fg-icon { font-size: 12px; }
    .fg-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #ececec;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .fg-input:focus { border-color: rgba(255,106,0,.5); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }
    .fg-textarea { border-radius: var(--radius-sm); resize: vertical; min-height: 80px; }

    /* Toggle */
    .toggle-wrap {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; padding: 9px 0; user-select: none;
    }
    .toggle-track {
      width: 46px; height: 24px; border-radius: 999px;
      background: #ccc; position: relative;
      transition: background .2s ease;
    }
    .toggle-track.on { background: var(--accent); }
    .toggle-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; position: absolute; top: 3px; left: 3px;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
      transition: transform .2s ease;
    }
    .toggle-track.on .toggle-thumb { transform: translateX(22px); }
    .toggle-label { font-size: 12px; font-weight: 700; color: #888; transition: color .2s; }
    .toggle-label.active { color: var(--accent); }

    .err-msg {
      color: var(--danger); font-size: 12px;
      margin: 12px 0 0; text-align: right; font-weight: 600;
    }

    /* Footer */
    .form-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

    /* Delete */
    .delete-body { text-align: center; padding: 12px 0 4px; }
    .delete-icon-svg { display: flex; justify-content: center; margin-bottom: 16px; }
    .delete-msg { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: var(--text); }
    .delete-msg strong { color: var(--accent); }
    .delete-warn { margin: 0; color: #e05b50; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

    @media (max-width: 900px) {
      .head { flex-direction: column; }
      .filter-row { max-width: none; }
      .head .app-btn { width: 100%; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `],
})
export class ServicosComponent implements OnInit {
  private servicoService = inject(ServicoService);
  private authService = inject(AuthService);

  get isAdmin() {
    return this.authService.role === 'ADMIN';
  }

  columns: TableColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'valorFormatado', label: 'Preço' },
    { key: 'statusHtml', label: 'Ativo' },
  ];
  
  rawServices: Servico[] = [];
  rows: any[] = [];
  search = '';
  modal = false;
  error = '';
  loading = false;
  saving = false;
  removing = false;
  deleteModal = false;
  serviceToDelete: Servico | null = null;
  
  form: Servico = { nome: '', descricao: '', valor: 0, ativo: true };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    const obs = this.isAdmin
      ? this.servicoService.list()
      : this.servicoService.ativos();

    obs.subscribe({
      next: (data) => {
        this.rawServices = data;
        this.rows = data.map(s => ({
          ...s,
          valorFormatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.valor),
          statusHtml: s.ativo 
            ? '<span class="status-chip status-chip-concluido">Ativo</span>' 
            : '<span class="status-chip status-chip-cancelado">Inativo</span>'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar serviços.';
        this.loading = false;
      }
    });
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.nome.toLowerCase().includes(s));
  }

  openNew() {
    this.form = { nome: '', descricao: '', valor: 0, ativo: true };
    this.error = '';
    this.modal = true;
  }

  openEdit(s: any) {
    this.form = { 
      id: s.id,
      nome: s.nome, 
      descricao: s.descricao, 
      valor: s.valor, 
      ativo: s.ativo,
      categoria: s.categoria
    };
    this.error = '';
    this.modal = true;
  }

  save() {
    if (!this.form.nome || this.form.valor === undefined || this.form.valor === null) {
      this.error = 'Nome e Preço são obrigatórios.';
      return;
    }
    if (this.form.valor < 0) {
      this.error = 'O preço não pode ser negativo.';
      return;
    }

    this.error = '';
    this.saving = true;
    const obs = this.form.id
      ? this.servicoService.update(this.form.id, this.form)
      : this.servicoService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.modal = false;
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Erro ao salvar o serviço. Verifique os dados.';
        this.saving = false;
      }
    });
  }

  remove(s: any) {
    this.serviceToDelete = s;
    this.deleteModal = true;
  }

  confirmRemove() {
    if (!this.serviceToDelete?.id) return;
    this.removing = true;
    this.servicoService.delete(this.serviceToDelete.id).subscribe({
      next: () => {
        this.removing = false;
        this.deleteModal = false;
        this.serviceToDelete = null;
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erro ao excluir o serviço.');
        this.removing = false;
        this.deleteModal = false;
        this.serviceToDelete = null;
      }
    });
  }
}
