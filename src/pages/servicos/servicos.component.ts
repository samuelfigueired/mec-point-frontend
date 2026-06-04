import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/table/table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Servico } from '../../models/models';
import { ServicoService } from '../../services/servico.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Serviços</h1>
        <p class="subtitle">
          {{ rawServices.length }} {{ rawServices.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados' }} no momento.
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
      emptyMessage="Nenhum serviço disponível." 
      (edit)="openEdit($event)" 
      (remove)="remove($event)" 
    />

    <app-modal [open]="modal" [title]="form.id ? 'Editar serviço' : 'Novo serviço'" (close)="modal=false">
      <label>Nome</label>
      <input class="input" name="nome" [(ngModel)]="form.nome" placeholder="Ex: Alinhamento e Balanceamento" />
      
      <label>Descrição</label>
      <textarea class="input" rows="3" name="descricao" [(ngModel)]="form.descricao" placeholder="Descreva brevemente o serviço..."></textarea>
      
      <label>Preço (R$)</label>
      <input class="input" type="number" name="valor" [(ngModel)]="form.valor" min="0" placeholder="0.00" />
      
      <label style="display:flex; align-items:center; gap:8px; margin-top:14px">
        <input type="checkbox" name="ativo" [(ngModel)]="form.ativo" /> Ativo
      </label>

      <p class="err-msg" *ngIf="error">{{ error }}</p>

      <div style="margin-top:18px; display:flex; gap:8px; justify-content:flex-end">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="save()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }
    .subtitle {
      margin: 6px 0 0;
      color: #ececec;
      font-size: 13px;
    }
    .filter-row {
      margin-bottom: 16px;
      max-width: 340px;
    }
    label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #b0b0b0;
      margin: 12px 0 6px;
    }
    .err-msg {
      color: var(--danger);
      font-size: 12px;
      margin: 12px 0 0;
      text-align: right;
    }
    @media (max-width: 900px) {
      .head {
        flex-direction: column;
      }
      .filter-row {
        max-width: none;
      }
      .head .app-btn {
        width: 100%;
      }
    }
  `],
})
export class ServicosComponent implements OnInit {
  private servicoService = inject(ServicoService);

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
  
  form: Servico = { nome: '', descricao: '', valor: 0, ativo: true };

  ngOnInit() {
    this.load();
  }

  load() {
    this.servicoService.list().subscribe({
      next: (data) => {
        this.rawServices = data;
        this.rows = data.map(s => ({
          ...s,
          valorFormatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.valor),
          statusHtml: s.ativo 
            ? '<span class="status-chip status-chip-concluido">Ativo</span>' 
            : '<span class="status-chip status-chip-cancelado">Inativo</span>'
        }));
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar serviços.';
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
    const obs = this.form.id
      ? this.servicoService.update(this.form.id, this.form)
      : this.servicoService.create(this.form);

    obs.subscribe({
      next: () => {
        this.modal = false;
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Erro ao salvar o serviço. Verifique os dados.';
      }
    });
  }

  remove(s: any) {
    if (confirm(`Deseja realmente excluir o serviço "${s.nome}"?`)) {
      this.servicoService.delete(s.id).subscribe({
        next: () => {
          this.load();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Erro ao excluir o serviço.');
        }
      });
    }
  }
}
