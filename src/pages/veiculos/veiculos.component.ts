import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Veiculo, User } from '../../models/models';
import { VeiculoService } from '../../services/veiculo.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Veículos</h1>
        <p class="subtitle">
          <ng-container *ngIf="loading">Carregando veículos...</ng-container>
          <ng-container *ngIf="!loading">
            {{ rows.length === 0 ? 'Nenhum veículo cadastrado no momento.' : rows.length + (rows.length === 1 ? ' veículo cadastrado.' : ' veículos cadastrados.') }}
          </ng-container>
        </p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo</button>
    </div>

    <div class="filter-row">
      <input class="f-input" placeholder="Pesquisar por placa, marca ou modelo..." [(ngModel)]="search" />
    </div>

    <app-table
      [columns]="columns"
      [rows]="filtered"
      [loading]="loading"
      emptyMessage="Nenhum veículo cadastrado."
      (edit)="openEdit($event)"
      (remove)="remove($event)"
    />

    <!-- Form Modal -->
    <app-modal [open]="modal" [title]="form.id ? 'Editar veículo' : 'Novo veículo'" (close)="modal=false">
      <div class="form-body">
        <div class="form-section-label">Identificação</div>
        <div class="form-grid-2">
          <div class="form-group full">
            <label class="fg-label">Placa</label>
            <input class="fg-input" name="placa" [(ngModel)]="form.placa" placeholder="Ex: AAA-1234 ou ABC1D23" />
          </div>
        </div>

        <div class="form-section-label" style="margin-top:16px">Especificações</div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="fg-label">Marca</label>
            <input class="fg-input" name="marca" [(ngModel)]="form.marca" placeholder="Ex: Chevrolet" />
          </div>
          <div class="form-group">
            <label class="fg-label">Modelo</label>
            <input class="fg-input" name="modelo" [(ngModel)]="form.modelo" placeholder="Ex: Onix" />
          </div>
          <div class="form-group">
            <label class="fg-label">Ano</label>
            <input class="fg-input" type="number" name="ano" [(ngModel)]="form.ano" placeholder="Ex: 2022" />
          </div>
          <div class="form-group">
            <label class="fg-label">Câmbio</label>
            <select class="fg-input" name="cambio" [(ngModel)]="form.cambio">
              <option value="">Selecione...</option>
              <option value="Manual">Manual</option>
              <option value="Automático">Automático</option>
            </select>
          </div>
        </div>

        <ng-container *ngIf="isAdminOrMecanico">
          <div class="form-section-label" style="margin-top:16px">Proprietário</div>
          <div class="form-group">
            <label class="fg-label">Cliente vinculado</label>
            <select class="fg-input" name="usuarioId" [(ngModel)]="form.usuarioId">
              <option [value]="undefined">Selecione o proprietário...</option>
              <option *ngFor="let u of users" [value]="u.id">{{ u.nome }} ({{ u.email }})</option>
            </select>
          </div>
        </ng-container>

        <div class="form-error" *ngIf="errorMessage">{{ errorMessage }}</div>
      </div>

      <div class="form-footer">
        <button class="app-btn app-btn-ghost" [disabled]="saving" (click)="modal=false">Cancelar</button>
        <button class="app-btn" [disabled]="saving" (click)="save()">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
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
          Deseja realmente remover o veículo <strong>{{ veiculoToDelete?.placa }}</strong>
          <span *ngIf="veiculoToDelete?.modelo"> — {{ veiculoToDelete?.modelo }}</span>?
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
    .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px }
    .subtitle { margin:6px 0 0; color:#ececec; font-size:13px }
    .filter-row { margin-bottom:16px; max-width:380px }
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
    .form-group.full { grid-column: 1 / -1; }

    .fg-label {
      display: block;
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

    .form-error {
      color: var(--danger); background: rgba(234,79,66,.12);
      padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12px;
      margin-top: 14px; font-weight: 600; border: 1px solid rgba(234,79,66,.2);
    }

    /* Footer */
    .form-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

    /* Delete */
    .delete-body { text-align: center; padding: 12px 0 4px; }
    .delete-icon-svg { display: flex; justify-content: center; margin-bottom: 16px; }
    .delete-msg { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: var(--text); }
    .delete-msg strong { color: var(--accent); }
    .delete-warn { margin: 0; color: #e05b50; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

    @media (max-width:900px) {
      .head { flex-direction: column }
      .filter-row { max-width: none }
      .head .app-btn { width: 100% }
      .form-grid-2 { grid-template-columns: 1fr }
    }
  `],
})
export class VeiculosComponent implements OnInit {
  private veiculoService = inject(VeiculoService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  columns: TableColumn[] = [];
  rows: Veiculo[] = [];
  users: User[] = [];
  search = '';
  modal = false;
  loading = false;
  saving = false;
  errorMessage = '';
  form: Veiculo = { placa: '', modelo: '', marca: '', ano: new Date().getFullYear(), cambio: '' };

  deleteModal = false;
  veiculoToDelete: Veiculo | null = null;

  ngOnInit() {
    this.setupColumns();
    this.loadData();
  }

  get isAdminOrMecanico() {
    const r = this.authService.role;
    return r === 'ADMIN' || r === 'MECANICO';
  }

  setupColumns() {
    this.columns = [
      { key: 'placa', label: 'Placa' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'cambio', label: 'Câmbio' },
      { key: 'ano', label: 'Ano' },
    ];
    if (this.isAdminOrMecanico) {
      this.columns.push({ key: 'usuarioNome', label: 'Proprietário' });
    }
  }

  loadData() {
    this.loading = true;
    this.errorMessage = '';

    const vehicles$ = this.isAdminOrMecanico
      ? this.veiculoService.list()
      : this.veiculoService.meus();

    vehicles$.subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erro ao carregar veículos do backend.';
        this.loading = false;
      }
    });

    if (this.isAdminOrMecanico) {
      this.userService.list().subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Erro ao carregar lista de usuários:', err);
        }
      });
    }
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r =>
      !s ||
      r.placa.toLowerCase().includes(s) ||
      r.modelo.toLowerCase().includes(s) ||
      r.marca.toLowerCase().includes(s) ||
      (r.usuarioNome && r.usuarioNome.toLowerCase().includes(s))
    );
  }

  openNew() {
    this.form = {
      placa: '',
      modelo: '',
      marca: '',
      ano: new Date().getFullYear(),
      cambio: '',
      usuarioId: this.isAdminOrMecanico ? undefined : (this.authService.currentUser?.id || undefined)
    };
    this.errorMessage = '';
    this.modal = true;
  }

  openEdit(v: Veiculo) {
    this.form = { ...v };
    this.errorMessage = '';
    this.modal = true;
  }

  save() {
    if (!this.form.placa || !this.form.marca || !this.form.modelo || !this.form.ano || !this.form.cambio) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.isAdminOrMecanico && !this.form.usuarioId) {
      this.errorMessage = 'Por favor, selecione o proprietário do veículo.';
      return;
    }

    this.form.placa = this.form.placa.trim().toUpperCase();
    this.form.marca = this.form.marca.trim();
    this.form.modelo = this.form.modelo.trim();

    this.saving = true;
    this.errorMessage = '';

    const payload: Veiculo = {
      placa: this.form.placa,
      marca: this.form.marca,
      modelo: this.form.modelo,
      ano: Number(this.form.ano),
      cambio: this.form.cambio,
      usuarioId: this.form.usuarioId ? Number(this.form.usuarioId) : undefined
    };

    const obs = this.form.id
      ? this.veiculoService.update(this.form.id, payload)
      : this.veiculoService.create(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.modal = false;
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Erro ao salvar veículo. Verifique os dados (a placa deve ser única).';
        this.saving = false;
      }
    });
  }

  remove(v: Veiculo) {
    this.veiculoToDelete = v;
    this.deleteModal = true;
  }

  confirmRemove() {
    if (this.veiculoToDelete && this.veiculoToDelete.id) {
      this.loading = true;
      this.veiculoService.delete(this.veiculoToDelete.id).subscribe({
        next: () => {
          this.deleteModal = false;
          this.veiculoToDelete = null;
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.message || 'Erro ao excluir o veículo.';
          this.deleteModal = false;
          this.veiculoToDelete = null;
          this.loading = false;
        }
      });
    }
  }
}
