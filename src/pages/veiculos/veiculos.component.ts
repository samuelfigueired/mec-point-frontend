import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Veiculo } from '../../models/models';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Veículos</h1>
        <p class="subtitle">Nenhum veículo cadastrado no momento.</p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo</button>
    </div>
    <div class="filter-row">
      <input class="input" placeholder="Pesquisar..." [(ngModel)]="search" />
    </div>
    <app-table [columns]="columns" [rows]="filtered" emptyMessage="Nenhum veículo cadastrado." (edit)="openEdit($event)" (remove)="remove($event)" />

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
  `,
  styles: [`.head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.subtitle{margin:6px 0 0;color:#ececec;font-size:13px}.filter-row{margin-bottom:16px;max-width:340px} label{display:block;font-size:11px;text-transform:uppercase;font-weight:700;color:#555;margin:12px 0 6px}@media (max-width:900px){.head{flex-direction:column}.filter-row{max-width:none}.head .app-btn{width:100%}}`],
})
export class VeiculosComponent {
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

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.placa.toLowerCase().includes(s) || r.modelo.toLowerCase().includes(s));
  }
  openNew() { this.form = { placa: '', modelo: '', marca: '', ano: 2024, cor: '' }; this.modal = true; }
  openEdit(v: Veiculo) { this.form = { ...v }; this.modal = true; }
  save() { this.modal = false; }
  remove(_: Veiculo) { }
}
