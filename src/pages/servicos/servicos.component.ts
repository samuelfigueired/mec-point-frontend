import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Servico } from '../../models/models';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Serviços</h1>
        <p class="subtitle">Nenhum serviço disponível no momento.</p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo</button>
    </div>
    <div class="filter-row">
      <input class="input" placeholder="Pesquisar..." [(ngModel)]="search" />
    </div>
    <app-table [columns]="columns" [rows]="filtered" emptyMessage="Nenhum serviço disponível." (edit)="openEdit($event)" (remove)="remove($event)" />

    <app-modal [open]="modal" [title]="form.id ? 'Editar serviço' : 'Novo serviço'" (close)="modal=false">
      <label>Nome</label><input class="input" name="nome" [(ngModel)]="form.nome" />
      <label>Descrição</label><textarea class="input" rows="3" name="descricao" [(ngModel)]="form.descricao"></textarea>
      <label>Preço (R$)</label><input class="input" type="number" name="preco" [(ngModel)]="form.preco" />
      <label style="display:flex; align-items:center; gap:8px; margin-top:14px"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo" /> Ativo</label>
      <div style="margin-top:18px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`.head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.subtitle{margin:6px 0 0;color:#ececec;font-size:13px}.filter-row{margin-bottom:16px;max-width:340px} label{display:block;font-size:11px;text-transform:uppercase;font-weight:700;color:#555;margin:12px 0 6px}@media (max-width:900px){.head{flex-direction:column}.filter-row{max-width:none}.head .app-btn{width:100%}}`],
})
export class ServicosComponent {
  columns: TableColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'preco', label: 'Preço' },
    { key: 'ativo', label: 'Ativo' },
  ];
  rows: Servico[] = [];
  search = '';
  modal = false;
  form: Servico = { nome: '', descricao: '', preco: 0, ativo: true };

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.nome.toLowerCase().includes(s));
  }
  openNew() { this.form = { nome: '', descricao: '', preco: 0, ativo: true }; this.modal = true; }
  openEdit(s: Servico) { this.form = { ...s }; this.modal = true; }
  save() { this.modal = false; }
  remove(_: Servico) { }
}
