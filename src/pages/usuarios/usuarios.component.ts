import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Role, User } from '../../models/models';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Usuários</h1>
        <p class="subtitle">
          <ng-container *ngIf="loading">Carregando usuários...</ng-container>
          <ng-container *ngIf="!loading">
            {{ rows.length === 0 ? 'Nenhum usuário cadastrado no momento.' : rows.length + (rows.length === 1 ? ' usuário cadastrado.' : ' usuários cadastrados.') }}
          </ng-container>
        </p>
      </div>
      <button class="app-btn" (click)="openNew()">+ Novo</button>
    </div>
    <div class="filter-row">
      <input class="f-input" placeholder="Pesquisar por nome ou e-mail..." [(ngModel)]="search" />
    </div>
    <app-table [columns]="columns" [rows]="filtered" [loading]="loading" emptyMessage="Nenhum usuário encontrado." (edit)="openEdit($event)" (remove)="remove($event)" />

    <app-modal [open]="modal" [title]="form.id ? 'Editar usuário' : 'Novo usuário'" (close)="modal=false">
      <div class="form-body">
        <div class="form-section-label">Dados pessoais</div>

        <div class="form-grid-2">
          <div class="form-group full">
            <label class="fg-label">Nome completo</label>
            <input class="fg-input" name="nome" [(ngModel)]="form.nome" placeholder="Ex: João da Silva" />
          </div>
          <div class="form-group full">
            <label class="fg-label">E-mail</label>
            <input class="fg-input" name="email" type="email" [(ngModel)]="form.email" placeholder="joao@email.com" />
          </div>
          <div class="form-group full" *ngIf="!form.id">
            <label class="fg-label">Senha</label>
            <input class="fg-input" type="password" name="senha" [(ngModel)]="form.senha" placeholder="Mínimo 6 caracteres" />
          </div>
        </div>

        <div class="form-section-label" style="margin-top:18px">Permissão</div>

        <div class="form-group">
          <label class="fg-label">Perfil de acesso</label>
          <div class="role-selector">
            <label class="role-option" [class.selected]="form.role === 'CLIENTE'">
              <input type="radio" name="role" value="CLIENTE" [(ngModel)]="form.role" />
              <span class="role-badge cliente">Cliente</span>
            </label>
            <label class="role-option" [class.selected]="form.role === 'MECANICO'">
              <input type="radio" name="role" value="MECANICO" [(ngModel)]="form.role" />
              <span class="role-badge mecanico">Mecânico</span>
            </label>
            <label class="role-option" [class.selected]="form.role === 'ADMIN'">
              <input type="radio" name="role" value="ADMIN" [(ngModel)]="form.role" />
              <span class="role-badge admin">Admin</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>

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
          Deseja realmente remover o usuário <strong>{{ userToDelete?.nome }}</strong>?
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
    .filter-row { margin-bottom: 16px; max-width: 380px; }
    .f-input {
      width: 100%; padding: 11px 14px; border-radius: var(--radius-sm);
      border: 1.5px solid rgba(0,0,0,.1); background: #e9e9e9;
      color: var(--text); outline: none; font-size: 13px; font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .f-input:focus { border-color: rgba(255,106,0,.45); box-shadow: 0 0 0 3px rgba(255,106,0,.12); }

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

    /* Role selector */
    .role-selector { display: flex; gap: 10px; flex-wrap: wrap; }
    .role-option { cursor: pointer; }
    .role-option input { display: none; }
    .role-badge {
      display: inline-block; padding: 8px 18px; border-radius: 999px;
      font-size: 11px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.5px; border: 2px solid transparent;
      transition: all .15s; opacity: 0.5;
    }
    .role-option.selected .role-badge { opacity: 1; transform: scale(1.04); }
    .role-badge.cliente { background: rgba(59,130,246,.15); color: #3b82f6; border-color: #3b82f6; }
    .role-badge.mecanico { background: rgba(89,210,108,.15); color: #27ae60; border-color: #27ae60; }
    .role-badge.admin { background: rgba(255,106,0,.15); color: var(--accent); border-color: var(--accent); }

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
      .role-selector { flex-direction: column; }
    }
  `],
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserService);

  columns: TableColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Perfil' },
  ];
  rows: User[] = [];
  search = '';
  modal = false;
  form: User = { nome: '', email: '', senha: '', role: 'CLIENTE' };
  deleteModal = false;
  userToDelete: User | null = null;
  loading = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.rows = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao listar usuários:', err);
        this.loading = false;
      }
    });
  }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.rows.filter(r => !s || r.nome.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
  }

  openNew() {
    this.form = { nome: '', email: '', senha: '', role: 'CLIENTE' };
    this.modal = true;
  }

  openEdit(u: User) {
    this.form = { ...u };
    this.modal = true;
  }

  save() {
    const isEditing = !!this.form.id;
    const targetRole = this.form.role;
    const request = isEditing
      ? this.userService.update(this.form.id!, this.form)
      : this.userService.create(this.form);

    request.subscribe({
      next: (savedUser) => {
        const userId = savedUser.id || this.form.id!;
        this.userService.updateRole(userId, targetRole).subscribe({
          next: () => { this.modal = false; this.loadUsers(); },
          error: (err) => {
            console.error('Erro ao atualizar papel do usuário:', err);
            this.modal = false;
            this.loadUsers();
            alert('Usuário salvo, mas não foi possível alterar o tipo: ' + (err.error?.message || 'Permissão negada.'));
          }
        });
      },
      error: (err) => {
        console.error('Erro ao salvar usuário:', err);
        alert(err.error?.message || 'Erro ao salvar usuário.');
      }
    });
  }

  remove(u: User) {
    this.userToDelete = u;
    this.deleteModal = true;
  }

  confirmRemove() {
    if (this.userToDelete && this.userToDelete.id) {
      this.userService.delete(this.userToDelete.id).subscribe({
        next: () => {
          this.deleteModal = false;
          this.userToDelete = null;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erro ao remover usuário:', err);
          alert(err.error?.message || 'Erro ao remover usuário.');
          this.deleteModal = false;
          this.userToDelete = null;
        }
      });
    }
  }
}
