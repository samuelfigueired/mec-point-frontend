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
        <p class="subtitle">{{ rows.length === 0 ? 'Nenhum usuário cadastrado no momento.' : rows.length + (rows.length === 1 ? ' usuário cadastrado.' : ' usuários cadastrados.') }}</p>
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

    <app-modal [open]="deleteModal" title="Confirmar Exclusão" (close)="deleteModal=false">
      <div style="text-align: center; padding: 10px 0;">
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
          Deseja realmente remover o usuário <strong style="color: var(--accent);">{{ userToDelete?.nome }}</strong>?
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
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .subtitle { margin: 6px 0 0; color: #ececec; font-size: 13px; }
    .filter-row { margin-bottom: 16px; max-width: 340px; }
    label { display:block; font-size:11px; text-transform:uppercase; font-weight:700; color:#555; margin: 12px 0 6px; }
    @media (max-width: 900px) { .head { flex-direction: column; } .filter-row { max-width: none; } .head .app-btn { width: 100%; } }
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

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => {
        this.rows = users;
      },
      error: (err) => {
        console.error('Erro ao listar usuários:', err);
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
          next: () => {
            this.modal = false;
            this.loadUsers();
          },
          error: (err) => {
            console.error('Erro ao atualizar papel do usuário:', err);
            this.modal = false;
            this.loadUsers();
            alert('Usuário salvo, mas não foi possível alterar o tipo de usuário: ' + (err.error?.message || 'Permissão negada.'));
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
