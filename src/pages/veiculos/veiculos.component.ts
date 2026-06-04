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
      <input class="input" placeholder="Pesquisar..." [(ngModel)]="search" />
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
      <div class="form-group">
        <label>Placa</label>
        <input class="input" name="placa" [(ngModel)]="form.placa" placeholder="Ex: AAA-1234 ou ABC1D23" />
      </div>

      <div class="form-group">
        <label>Marca</label>
        <input class="input" name="marca" [(ngModel)]="form.marca" placeholder="Ex: Chevrolet" />
      </div>

      <div class="form-group">
        <label>Modelo</label>
        <input class="input" name="modelo" [(ngModel)]="form.modelo" placeholder="Ex: Onix" />
      </div>

      <div class="form-group">
        <label>Ano</label>
        <input class="input" type="number" name="ano" [(ngModel)]="form.ano" placeholder="Ex: 2022" />
      </div>

      <div class="form-group">
        <label>Câmbio</label>
        <select class="input" name="cambio" [(ngModel)]="form.cambio">
          <option value="">Selecione...</option>
          <option value="Manual">Manual</option>
          <option value="Automático">Automático</option>
        </select>
      </div>

      <div class="form-group" *ngIf="isAdminOrMecanico">
        <label>Proprietário</label>
        <select class="input" name="usuarioId" [(ngModel)]="form.usuarioId">
          <option [value]="undefined">Selecione o proprietário...</option>
          <option *ngFor="let u of users" [value]="u.id">{{ u.nome }} ({{ u.email }})</option>
        </select>
      </div>

      <div class="form-error" *ngIf="errorMessage">{{ errorMessage }}</div>

      <div style="margin-top:22px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" [disabled]="saving" (click)="modal=false">Cancelar</button>
        <button class="app-btn" [disabled]="saving" (click)="save()">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </app-modal>

    <!-- Custom Styled Delete Modal -->
    <app-modal [open]="deleteModal" title="Confirmar Exclusão" (close)="deleteModal=false">
      <div style="text-align: center; padding: 10px 0;">
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
          Deseja realmente remover o veículo com placa <strong style="color: var(--accent);">{{ veiculoToDelete?.placa }}</strong> ({{ veiculoToDelete?.modelo }})?
        </p>
        <p style="margin: 0; color: #ff9e93; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          ⚠ Esta ação não poderá ser desfeita.
        </p>
      </div>
      <div style="margin-top:20px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="deleteModal=false">Cancelar</button>
        <button class="app-btn app-btn-danger" (click)="confirmRemove()">Remover</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px }
    .subtitle { margin:6px 0 0; color:#ececec; font-size:13px }
    .filter-row { margin-bottom:16px; max-width:340px }
    .form-group { display: flex; flex-direction: column; margin-bottom: 14px; }
    .form-group label { display:block; font-size:11px; text-transform:uppercase; font-weight:700; color:#555; margin: 0 0 6px; }
    .input {
      width: 100%;
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(0,0,0,.08);
      background: #ececec;
      color: var(--text);
      outline: none;
      font-size: 14px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .input:focus {
      border-color: rgba(255, 106, 0, 0.45);
      box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.12);
    }
    .form-error {
      color: var(--danger);
      background: rgba(234, 79, 66, 0.15);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      margin-top: 14px;
      font-weight: 600;
      border: 1px solid rgba(234, 79, 66, 0.2);
    }
    @media (max-width:900px){.head{flex-direction:column}.filter-row{max-width:none}.head .app-btn{width:100%}}
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
