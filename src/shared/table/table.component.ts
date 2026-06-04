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
            <ng-container *ngIf="loading">
              <tr *ngFor="let placeholder of [1, 2, 3]">
                <td *ngFor="let c of columns">
                  <div class="skeleton-shimmer"></div>
                </td>
                <td *ngIf="actions" style="text-align:right">
                  <div class="skeleton-shimmer skeleton-btn" style="float: right;"></div>
                </td>
              </tr>
            </ng-container>
            
            <ng-container *ngIf="!loading">
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
            </ng-container>
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
    .skeleton-shimmer {
      height: 16px;
      background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%);
      background-size: 400% 100%;
      animation: shimmer-anim 1.4s linear infinite;
      border-radius: 4px;
      width: 80%;
    }
    .skeleton-btn {
      width: 120px;
      height: 24px;
      border-radius: 999px;
    }
    @keyframes shimmer-anim {
      0% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() actions = true;
  @Input() emptyMessage = 'Nenhum registro encontrado.';
  @Input() loading = false;
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
}
