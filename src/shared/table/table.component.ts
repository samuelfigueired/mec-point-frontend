import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn { key: string; label: string; }

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrap">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th *ngFor="let c of columns">{{ c.label }}</th>
              <th *ngIf="actions" style="text-align:right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td *ngFor="let c of columns" [innerHTML]="row[c.key]"></td>
              <td *ngIf="actions" style="text-align:right">
                <button class="app-btn app-btn-sm" (click)="edit.emit(row)">Editar</button>
                <button class="app-btn app-btn-sm app-btn-danger" (click)="remove.emit(row)" style="margin-left:6px">Excluir</button>
              </td>
            </tr>
            <tr *ngIf="!rows?.length">
              <td [attr.colspan]="columns.length + (actions ? 1 : 0)" class="empty">{{ emptyMessage }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-wrap { background: #dedede; color: var(--text); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-soft); }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { min-width: 120px; }
    th, td { padding: 14px 16px; text-align: left; font-size: 12px; }
    thead { background: #4a4a4a; color: var(--accent); text-transform: uppercase; font-size: 11px; letter-spacing: 1.2px; }
    thead th { border-bottom: 1px solid rgba(255,255,255,.08); }
    tbody tr { border-top: 1px solid rgba(0,0,0,.08); }
    tbody tr:hover { background: rgba(255,255,255,.45); }
    .empty { text-align: center; padding: 28px; color: #5a5a5a; font-weight: 600; }
  `],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() actions = true;
  @Input() emptyMessage = 'Nenhum registro encontrado.';
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
}
