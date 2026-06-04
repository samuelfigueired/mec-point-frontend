import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Role, User } from '../../models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Usuários</h1>
        <p class="subtitle">Nenhum usuário cadastrado no momento.</p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo</button>
    </div>
    <div class="filter-row">
      <input class="input" placeholder="Pesquisar..." [(ngModel)]="search" />
    </div>
    <app-table [columns]="columns" [rows]="filtered" emptyMessage="Nenhum usuário encontrado." (edit)="openEdit($event)" (remove)="remove($event)" />

    <app-modal [open]="modal" [title]="form.id ? 'Editar usuário' : 'Novo usuário'" (close)="modal=false">
      <label>Nome</label>
      <input class="input" name="nome" [(ngModel)]="form.nome" />
      <label>Email</label>
      <input class="input" name="email" type="email" [(ngModel)]="form.email" />
      <label *ngIf="!form.id">Senha</label>
      <input class="input" *ngIf="!form.id" type="password" name="senha" [(ngModel)]="form.senha" />
      <label>Perfil</label>
      <select class="input" name="role" [(ngModel)]="form.role">
        <option value="CLIENTE">CLIENTE</option>
        <option value="MECANICO">MECÂNICO</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <div style="margin-top:18px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filter-row { margin-bottom: 16px; max-width: 340px; }
    label { display:block; font-size:11px; text-transform:uppercase; font-weight:700; color:#555; margin: 12px 0 6px; }
    @media (max-width: 900px) { .head { flex-direction: column; } .filter-row { max-width: none; } .head .app-btn { width: 100%; } }
  `],
})
export class UsuariosComponent {
  columns: TableColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Perfil' },
  ];
  rows: User[] = [];
  search = '';
  modal = false;
  form: User = { nome: '', email: '', senha: '', role: 'CLIENTE' };

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.nome.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
  }
  openNew() { this.form = { nome: '', email: '', senha: '', role: 'CLIENTE' }; this.modal = true; }
  openEdit(u: User) { this.form = { ...u }; this.modal = true; }
  save() { this.modal = false; }
  remove(_: User) { }
}
