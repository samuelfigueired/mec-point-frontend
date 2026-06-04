import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="open" (click)="close.emit()">
      <div class="dialog-surface" (click)="$event.stopPropagation()">
        <header>
          <h3>{{ title }}</h3>
          <button (click)="close.emit()">×</button>
        </header>
        <div class="body"><ng-content /></div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 99; padding: 16px; }
    .dialog-surface { background: #ececec; color: var(--text); border-radius: 22px; width: 100%; max-width: 560px; box-shadow: 0 28px 80px rgba(0,0,0,.35); animation: in .15s ease-out; overflow: hidden; }
    @keyframes in { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; background: linear-gradient(180deg, #f7f7f7 0%, #e9e9e9 100%); border-bottom: 1px solid rgba(0,0,0,.06); }
    header h3 { margin: 0; font-size: 14px; text-transform: uppercase; color: var(--accent); letter-spacing: 1.2px; font-weight: 900; }
    header button { background: transparent; font-size: 26px; color: #555; }
    .body { padding: 22px; }
  `],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}
