import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Role, User, Veiculo, Agendamento } from '../../models/models';
import { UserService } from '../../services/user.service';
import { VeiculoService } from '../../services/veiculo.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
        <button class="app-btn app-btn-ghost" [disabled]="saving" (click)="modal=false">Cancelar</button>
        <button class="app-btn" [disabled]="saving" (click)="save()">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
      </div>
    </app-modal>

    <app-modal [open]="deleteModal" [title]="checkingDependencies ? 'Verificando dependências...' : (hasDependencies ? 'Não é possível excluir o usuário' : 'Confirmar Exclusão')" (close)="closeDeleteModal()">
      <!-- Checking dependencies loading state -->
      <div class="delete-body" *ngIf="checkingDependencies">
        <div class="loading-dependencies">
          <div class="shimmer-spinner" style="width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.06); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px;"></div>
          <span>Verificando vínculos do usuário...</span>
        </div>
      </div>

      <!-- If has dependencies (blocker screen) -->
      <div class="blocker-body" *ngIf="!checkingDependencies && hasDependencies">
        <div class="blocker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none"
            stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h3 class="blocker-title">
          Não é possível remover <span>{{ userToDelete?.nome }}</span>
        </h3>
        
        <p class="blocker-text">
          Este usuário possui vínculos ativos no sistema. Para excluí-lo, você deve primeiro remover ou desassociar os seguintes registros:
        </p>

        <div class="dependency-lists">
          <!-- Vehicles Section -->
          <div class="dep-section" *ngIf="linkedVeiculos.length > 0">
            <h4 class="dep-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dep-icon" style="margin-right: 6px;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Veículos Cadastrados ({{ linkedVeiculos.length }})
            </h4>
            <ul class="dep-list">
              <li *ngFor="let v of linkedVeiculos" class="dep-item">
                <span class="dep-name">{{ v.marca }} {{ v.modelo }}</span>
                <span class="dep-badge-plate">{{ v.placa }}</span>
              </li>
            </ul>
          </div>

          <!-- Appointments Section -->
          <div class="dep-section" *ngIf="linkedAgendamentos.length > 0">
            <h4 class="dep-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dep-icon" style="margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Agendamentos Vinculados ({{ linkedAgendamentos.length }})
            </h4>
            <ul class="dep-list">
              <li *ngFor="let a of linkedAgendamentos" class="dep-item">
                <div class="dep-agd-info">
                  <span class="dep-agd-id">#{{ a.id }}</span>
                  <span class="dep-agd-service" *ngIf="a.servicoNome || a.servico">{{ a.servicoNome || a.servico }}</span>
                  <span class="dep-agd-date">{{ formatDate(a.dataHora) }}</span>
                </div>
                <span class="status-chip" [class]="a.status.toLowerCase()">{{ formatStatus(a.status) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Normal Delete Confirmation (no dependencies, no error) -->
      <div class="delete-body" *ngIf="!checkingDependencies && !hasDependencies && !deleteError">
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

      <!-- Delete error fallback (if delete itself failed for some other reason) -->
      <div class="delete-body" *ngIf="!checkingDependencies && !hasDependencies && deleteError">
        <div class="delete-icon-svg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44" height="44" fill="none"
            stroke="var(--warning)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p class="delete-msg" style="font-weight: 800; color: var(--text);">
          Não foi possível excluir o usuário <strong>{{ userToDelete?.nome }}</strong>
        </p>
        <p class="delete-error-reason" style="margin: 10px 0 0; color: #e05b50; font-size: 13px; font-weight: 700; line-height: 1.5;">
          {{ deleteError }}
        </p>
      </div>

      <!-- Footer Buttons -->
      <div class="form-footer">
        <!-- Checking dependencies / loading -->
        <ng-container *ngIf="checkingDependencies">
          <button class="app-btn app-btn-ghost" disabled>Aguarde...</button>
        </ng-container>

        <!-- Has dependencies (blocker screen) -->
        <ng-container *ngIf="!checkingDependencies && hasDependencies">
          <button class="app-btn" (click)="closeDeleteModal()">Entendi, fechar</button>
        </ng-container>

        <!-- Normal confirmation -->
        <ng-container *ngIf="!checkingDependencies && !hasDependencies && !deleteError">
          <button class="app-btn app-btn-ghost" [disabled]="removing" (click)="closeDeleteModal()">Cancelar</button>
          <button class="app-btn app-btn-danger" [disabled]="removing" (click)="confirmRemove()">{{ removing ? 'Removendo...' : 'Remover' }}</button>
        </ng-container>

        <!-- Error fallback -->
        <ng-container *ngIf="!checkingDependencies && !hasDependencies && deleteError">
          <button class="app-btn" (click)="closeDeleteModal()">Fechar</button>
        </ng-container>
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

    /* Blocker screen style */
    .blocker-body { text-align: left; padding: 4px 0; }
    .blocker-icon { display: flex; justify-content: center; margin-bottom: 14px; }
    .blocker-title { font-size: 16px; font-weight: 900; color: #e05b50; text-align: center; margin: 0 0 10px; }
    .blocker-title span { color: var(--text); }
    .blocker-text { font-size: 13px; color: #666; line-height: 1.5; text-align: center; margin-bottom: 18px; }
    
    .dependency-lists { display: flex; flex-direction: column; gap: 16px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
    .dep-section { background: rgba(0,0,0,.02); border: 1px solid rgba(0,0,0,.05); border-radius: var(--radius-sm); padding: 12px; }
    .dep-section-title { display: flex; align-items: center; font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text); margin: 0 0 10px; border-bottom: 1px dashed rgba(0,0,0,.08); padding-bottom: 6px; }
    .dep-icon { color: var(--accent); }
    .dep-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .dep-item { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 8px 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.02); font-size: 12px; border: 1.5px solid rgba(0,0,0,.04); }
    .dep-name { font-weight: 700; color: var(--text); }
    .dep-badge-plate { font-size: 10px; font-weight: 800; background: #e0e0e0; color: #333; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc; font-family: monospace; }
    .dep-agd-info { display: flex; flex-direction: column; gap: 2px; }
    .dep-agd-id { font-weight: 900; color: var(--accent); font-size: 10px; }
    .dep-agd-service { font-weight: 700; color: var(--text); }
    .dep-agd-date { font-size: 10px; color: #888; }
    
    /* Status chips for blocker agendamentos */
    .status-chip { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-chip.pendente { background: rgba(255,106,0,.1); color: var(--accent); }
    .status-chip.agendado, .status-chip.confirmado, .status-chip.em_andamento, .status-chip.quase_finalizado { background: rgba(59,130,246,.15); color: #3b82f6; }
    .status-chip.finalizado { background: rgba(39,174,96,.15); color: #27ae60; }
    .status-chip.cancelado { background: rgba(0,0,0,.08); color: #666; }

    .loading-dependencies { font-size: 13px; color: #666; text-align: center; padding: 20px 0; font-weight: 600; }
    .shimmer-spinner {
      border: 3px solid rgba(0,0,0,0.06);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserService);
  private veiculoService = inject(VeiculoService);
  private agendamentoService = inject(AgendamentoService);

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
  saving = false;
  removing = false;
  deleteError = '';

  checkingDependencies = false;
  linkedVeiculos: Veiculo[] = [];
  linkedAgendamentos: Agendamento[] = [];

  get hasDependencies(): boolean {
    return this.linkedVeiculos.length > 0 || this.linkedAgendamentos.length > 0;
  }

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

    this.saving = true;
    request.subscribe({
      next: (savedUser) => {
        const userId = savedUser.id || this.form.id!;
        this.userService.updateRole(userId, targetRole).subscribe({
          next: () => {
            this.saving = false;
            this.modal = false;
            this.loadUsers();
          },
          error: (err) => {
            console.error('Erro ao atualizar papel do usuário:', err);
            this.saving = false;
            this.modal = false;
            this.loadUsers();
            alert('Usuário salvo, mas não foi possível alterar o tipo: ' + (err.error?.message || 'Permissão negada.'));
          }
        });
      },
      error: (err) => {
        console.error('Erro ao salvar usuário:', err);
        alert(err.error?.message || 'Erro ao salvar usuário.');
        this.saving = false;
      }
    });
  }

  remove(u: User) {
    if (!u.id) return;
    this.userToDelete = u;
    this.deleteError = '';
    this.checkingDependencies = true;
    this.linkedVeiculos = [];
    this.linkedAgendamentos = [];
    this.deleteModal = true;

    const veiculos$ = this.veiculoService.byUsuario(u.id).pipe(catchError(() => of([])));
    const agendamentosClient$ = this.agendamentoService.byUsuario(u.id).pipe(catchError(() => of([])));
    const agendamentosMecanico$ = u.role === 'MECANICO'
      ? this.agendamentoService.byMecanico(u.id).pipe(catchError(() => of([])))
      : of([]);

    forkJoin([veiculos$, agendamentosClient$, agendamentosMecanico$]).subscribe({
      next: ([veiculos, agClient, agMec]) => {
        this.checkingDependencies = false;
        this.linkedVeiculos = veiculos;
        
        const allAgs = [...agClient, ...agMec];
        const uniqueAgsMap = new Map<number, Agendamento>();
        allAgs.forEach(a => {
          if (a.id) uniqueAgsMap.set(a.id, a);
        });
        this.linkedAgendamentos = Array.from(uniqueAgsMap.values());
      },
      error: (err) => {
        console.error('Erro ao verificar dependências:', err);
        this.checkingDependencies = false;
      }
    });
  }

  confirmRemove() {
    if (this.userToDelete && this.userToDelete.id) {
      this.removing = true;
      this.deleteError = '';
      this.userService.delete(this.userToDelete.id).subscribe({
        next: () => {
          this.removing = false;
          this.deleteModal = false;
          this.userToDelete = null;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erro ao remover usuário:', err);
          this.deleteError = err.error?.message || 'Não foi possível concluir a operação.';
          this.removing = false;
        }
      });
    }
  }

  closeDeleteModal() {
    this.deleteModal = false;
    this.userToDelete = null;
    this.deleteError = '';
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
