import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Veiculo } from '../../models/models';
import { VeiculoService } from '../../services/veiculo.service';

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

    <app-modal [open]="modal" [title]="form.id ? 'Editar veículo' : 'Novo veículo'" (close)="modal=false">
      <label>Placa</label><input class="input" name="placa" [(ngModel)]="form.placa" />
      <label>Marca</label><input class="input" name="marca" [(ngModel)]="form.marca" />
      <label>Modelo</label><input class="input" name="modelo" [(ngModel)]="form.modelo" />
      <label>Ano</label><input class="input" type="number" name="ano" [(ngModel)]="form.ano" />
      <label>Cor</label><input class="input" name="cor" [(ngModel)]="form.cor" />
      <div style="margin-top:18px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>

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
  styles: [`.head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.subtitle{margin:6px 0 0;color:#ececec;font-size:13px}.filter-row{margin-bottom:16px;max-width:340px} label{display:block;font-size:11px;text-transform:uppercase;font-weight:700;color:#555;margin:12px 0 6px}@media (max-width:900px){.head{flex-direction:column}.filter-row{max-width:none}.head .app-btn{width:100%}}`],
})
export class VeiculosComponent implements OnInit {
  private veiculoService = inject(VeiculoService);

  columns: TableColumn[] = [
    { key: 'placa', label: 'Placa' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'ano', label: 'Ano' },
  ];
  rows: Veiculo[] = [];
  search = '';
  modal = false;
  form: Veiculo = { placa: '', modelo: '', marca: '', ano: 2024, cor: '' };
  
  deleteModal = false;
  veiculoToDelete: Veiculo | null = null;
  loading = false;

  ngOnInit() {
    this.loadVeiculos();
  }

  loadVeiculos() {
    this.loading = true;
    this.veiculoService.list().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.loading = false;
      }
    });
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.placa.toLowerCase().includes(s) || r.modelo.toLowerCase().includes(s));
  }
  
  openNew() { this.form = { placa: '', modelo: '', marca: '', ano: 2024, cor: '' }; this.modal = true; }
  
  openEdit(v: Veiculo) { this.form = { ...v }; this.modal = true; }
  
  save() {
    this.loading = true;
    const obs = this.form.id
      ? this.veiculoService.update(this.form.id, this.form)
      : this.veiculoService.create(this.form);
    
    obs.subscribe({
      next: () => {
        this.modal = false;
        this.loadVeiculos();
      },
      error: (err) => {
        console.error('Erro ao salvar veículo:', err);
        alert(err.error?.message || 'Erro ao salvar veículo.');
        this.loading = false;
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
          this.loadVeiculos();
        },
        error: (err) => {
          console.error('Erro ao remover veículo:', err);
          alert(err.error?.message || 'Erro ao remover veículo.');
          this.deleteModal = false;
          this.veiculoToDelete = null;
          this.loading = false;
        }
      });
    }
  }
}
