import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Agendamento, EventoAgendamento, StatusAgendamento } from '../../models/models';
import { ModalComponent } from '../../shared/modal/modal.component';
import { AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agendamento-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="page-title">Agendamento #{{ ag.id || id }}</h1>
        <p class="subtitle">Acompanhe os detalhes e a linha do tempo do atendimento.</p>
      </div>
      <div class="head-actions">
        <button *ngIf="canManageEvents" class="app-btn" (click)="openNewEvento()">+ Novo Evento</button>
        <a class="app-btn app-btn-ghost" routerLink="/agendamentos">&lt; Voltar</a>
      </div>
    </div>

    <main class="page-shell">
      <div class="appointment-shell">
        <div class="vehicle-side-panel">
          <span class="vehicle-id">ID: {{ ag.id || id }}</span>
          <img 
            [src]="getCarImage(ag)" 
            alt="Veículo" 
            class="vehicle-img"
          />
        </div>
        
        <div class="service-info-panel">
          <div class="info-header">Serviço</div>
          <div class="info-body">
            <div class="info-grid">
              <span class="info-label">Serviço</span>
              <span class="info-value font-bold text-accent">{{ ag.servico || ag.servicoNome || 'Não definido' }}</span>

              <span class="info-label">Cliente</span>
              <span class="info-value">{{ ag.cliente || ag.usuarioNome || 'Não informado' }}</span>

              <span class="info-label">Status</span>
              <span class="info-value">
                <span *ngIf="!canManageEvents" style="display: flex; align-items: center; gap: 8px;">
                  <span class="status-dot" [ngClass]="ag.status === 'FINALIZADO' ? 'dot-concluido' : 'dot-andamento'"></span> 
                  {{ statusLabel }}
                </span>
                <select *ngIf="canManageEvents" class="status-select" [ngModel]="ag.status" (ngModelChange)="updateStatus($event)">
                  <option value="PENDENTE">Pendente</option>
                  <option value="AGENDADO">Agendado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="QUASE_FINALIZADO">Quase finalizado</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </span>
              
              <span class="info-label">Placa</span>
              <span class="info-value">{{ ag.veiculoPlaca || '—' }}</span>
              
              <span class="info-label">Data</span>
              <span class="info-value">{{ formatDate(ag.dataHora) }}</span>
              
              <span class="info-label">Modelo</span>
              <span class="info-value font-bold">{{ ag.veiculoModelo || '—' }}</span>
              
              <span class="info-label">Descrição</span>
              <span class="info-value text-upper">{{ ag.descricao || 'Nenhuma observação' }}</span>
            </div>
            <div class="orange-detail-dot"></div>
          </div>
        </div>
      </div>

      <div class="timeline-section-panel">
        <div class="timeline-header">
          <h3>Linha do Tempo de Eventos</h3>
        </div>
        
        <ul class="timeline" *ngIf="eventos.length; else emptyTimeline">
          <li *ngFor="let e of eventos">
            <span class="dot"></span>
            <div class="timeline-content">
              <strong>{{ e.titulo }}</strong>
              <small>{{ formatDate(e.dataEvento) }}</small>
              <p>{{ e.descricao }}</p>
              <div class="evt-actions" *ngIf="canManageEvents">
                <button class="app-btn app-btn-sm app-btn-ghost" (click)="openEditEvento(e)">Editar</button>
                <button *ngIf="isAdmin" class="app-btn app-btn-sm app-btn-danger" (click)="removeEvento(e)">Excluir</button>
              </div>
            </div>
          </li>
        </ul>

        <ng-template #emptyTimeline>
          <div class="empty-state">
            <strong>Nenhum evento registrado</strong>
            <p *ngIf="canManageEvents">Clique em "+ Novo Evento" para adicionar atualizações na timeline deste veículo.</p>
            <p *ngIf="!canManageEvents">Não há atualizações registradas para este agendamento.</p>
          </div>
        </ng-template>
      </div>
    </main>

    <app-modal [open]="modal" [title]="evForm.id ? 'Editar evento' : 'Novo evento'" (close)="modal=false">
      <div class="form-body">
        <div class="form-group">
          <label class="fg-label">Título</label>
          <input class="fg-input" name="titulo" [(ngModel)]="evForm.titulo" placeholder="Ex: Peças solicitadas" />
        </div>
        
        <div class="form-group" style="margin-top:12px">
          <label class="fg-label">Data</label>
          <input class="fg-input" type="datetime-local" name="data" [(ngModel)]="evForm.dataEvento" />
        </div>
        
        <div class="form-group" style="margin-top:12px">
          <label class="fg-label">Descrição</label>
          <textarea class="fg-input fg-textarea" rows="3" name="descricao" [(ngModel)]="evForm.descricao" placeholder="Detalhes da atualização..."></textarea>
        </div>
      </div>
      
      <div class="save-error-banner" *ngIf="eventoSaveError">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {{ eventoSaveError }}
      </div>

      <div class="form-footer">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="saveEvento()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
    }

    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .head-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .page-shell {
      max-width: 1200px;
      margin: 0 auto;
    }

    .appointment-shell {
      display: grid;
      grid-template-columns: 40% 60%;
      background-color: #dedede;
      border-radius: 24px;
      overflow: hidden;
      min-height: 290px;
      margin-bottom: 40px;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(0,0,0,.04);
    }

    .vehicle-side-panel {
      padding: 20px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e5e5e5 0%, #d8d8d8 100%);
    }

    .vehicle-id {
      position: absolute;
      top: 20px;
      left: 20px;
      color: #333;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .vehicle-img { max-width: 80%; height: auto; object-fit: contain; }

    .service-info-panel {
      background-color: #555555;
      display: flex;
      flex-direction: column;
    }

    .info-header {
      background-color: #444444;
      color: var(--accent, #ff6a00);
      text-align: center;
      padding: 12px;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 1.5px;
    }

    .info-body {
      padding: 25px 35px;
      position: relative;
      flex-grow: 1;
      display: flex;
      align-items: center;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      row-gap: 12px;
      column-gap: 10px;
      width: 100%;
    }

    .info-label { color: #ccc; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.6px; }
    .info-value { color: #ffffff; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .text-accent { color: var(--accent); }

    .status-select {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1.5px solid rgba(255,255,255,.08);
      background: #444;
      color: #fff;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      font-weight: 700;
      cursor: pointer;
    }
    .status-select:focus {
      border-color: var(--accent);
    }
    .status-select option {
      background: #333;
      color: #fff;
    }

    .orange-detail-dot {
      position: absolute;
      top: 20px;
      right: 30px;
      width: 16px;
      height: 16px;
      background-color: var(--accent, #ff6a00);
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(255,106,0,.4);
    }

    .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot-andamento { background-color: #59d26c; }
    .dot-concluido { background-color: #ea4f42; }
    .font-bold { font-weight: 800; }
    .text-upper { text-transform: uppercase; }

    .timeline-section-panel {
      background: #dedede;
      border-radius: 24px;
      padding: 30px;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(0,0,0,.04);
      color: var(--text);
    }

    .timeline-header h3 {
      margin: 0 0 20px 0;
      color: var(--accent, #ff6a00);
      text-transform: uppercase;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .timeline { list-style: none; padding: 0; margin: 0; }
    .timeline li { display: flex; gap: 14px; padding: 15px 0; border-left: 2px solid var(--accent, #ff6a00); margin-left: 8px; padding-left: 25px; position: relative; }
    .timeline .dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; background: var(--accent, #ff6a00); border-radius: 50%; box-shadow: 0 0 8px rgba(255,106,0,.4); }
    
    .timeline-content strong { color: var(--text); display: block; font-size: 15px; font-weight: 800; }
    .timeline-content small { color: #666; font-size: 11px; font-weight: 700; margin-top: 2px; display: block; }
    .timeline-content p { color: #444; margin: 8px 0; font-size: 13px; line-height: 1.5; }

    .evt-actions { display: flex; gap: 8px; margin-top: 10px; }

    .empty-state { border: 2px dashed rgba(0, 0, 0, 0.1); border-radius: 14px; padding: 30px; text-align: center; }
    .empty-state strong { display: block; margin-bottom: 5px; color: var(--text); }
    .empty-state p { margin: 0; color: #666; font-size: 13px; }

    /* Save error banner */
    .save-error-banner {
      display: flex; align-items: flex-start; gap: 8px;
      background: rgba(224,91,80,.08); border: 1.5px solid rgba(224,91,80,.3);
      border-radius: var(--radius-sm); padding: 10px 14px;
      color: #e05b50; font-size: 12px; font-weight: 600; line-height: 1.5;
      margin-top: 16px;
    }
    .save-error-banner svg { flex-shrink: 0; margin-top: 1px; }

    /* Modal Form elements */
    .form-body { display: flex; flex-direction: column; }
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
    .fg-textarea { border-radius: var(--radius-sm); resize: vertical; min-height: 80px; }
    .form-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

    @media (max-width: 768px) {
      .appointment-shell { grid-template-columns: 1fr; }
      .vehicle-side-panel { border-bottom: 1px solid rgba(0,0,0,.08); }
      .head { flex-direction: column; align-items: flex-start; }
      .head-actions { width: 100%; justify-content: space-between; }
    }
  `],
})
export class AgendamentoDetalheComponent implements OnInit {
  @Input() id?: string;
  ag: Agendamento = { id: 0, usuarioId: 0, veiculoId: 0, dataHora: '', status: 'PENDENTE', descricao: '' };
  eventos: EventoAgendamento[] = [];
  modal = false;
  evForm: EventoAgendamento = { agendamentoId: 0, titulo: '', dataEvento: '', descricao: '' };

  private agendamentoService = inject(AgendamentoService);
  private authService = inject(AuthService);

  get role() {
    return this.authService.role;
  }
  get isAdmin() {
    return this.role === 'ADMIN';
  }
  get isMecanico() {
    return this.role === 'MECANICO';
  }
  get canManageEvents() {
    return this.isAdmin || this.isMecanico;
  }

  get statusLabel() {
    const map: Record<string, string> = {
      'PENDENTE': 'Pendente',
      'AGENDADO': 'Agendado',
      'CONFIRMADO': 'Confirmado',
      'EM_ANDAMENTO': 'Em Andamento',
      'QUASE_FINALIZADO': 'Quase Finalizado',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado'
    };
    return map[this.ag.status] || this.ag.status;
  }

  ngOnInit() { 
    this.loadAgendamento();
  }

  loadAgendamento() {
    const targetId = this.id ? +this.id : this.ag.id;
    if (!targetId) return;

    this.agendamentoService.get(targetId).subscribe({
      next: (data) => {
        this.ag = data;
        this.loadEventos();
      },
      error: (err) => console.error('Erro ao carregar detalhes do agendamento:', err)
    });
  }

  loadEventos() {
    if (!this.ag.id) return;
    this.agendamentoService.listEventos(this.ag.id).subscribe({
      next: (data) => {
        this.eventos = data;
      },
      error: (err) => console.error('Erro ao carregar eventos:', err)
    });
  }

  updateStatus(status: StatusAgendamento) {
    if (!this.ag.id) return;
    this.agendamentoService.updateStatus(this.ag.id, status).subscribe({
      next: (updated) => {
        this.ag.status = updated.status;
        this.loadEventos();
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        alert(err.error?.message || 'Erro ao atualizar status.');
      }
    });
  }

  openNewEvento() { 
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);

    this.eventoSaveError = '';
    this.evForm = { 
      agendamentoId: this.ag.id!, 
      titulo: '', 
      dataEvento: localISOTime, 
      descricao: '',
      status: this.ag.status || 'EM_ANDAMENTO'
    }; 
    this.modal = true; 
  }

  openEditEvento(e: EventoAgendamento) { 
    this.eventoSaveError = '';
    this.evForm = { ...e }; 
    if (this.evForm.dataEvento) {
      try {
        const d = new Date(this.evForm.dataEvento);
        const offset = d.getTimezoneOffset() * 60000;
        this.evForm.dataEvento = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
      } catch (err) {
        console.error('Erro ao formatar data do evento:', err);
      }
    }
    this.modal = true; 
  }

  eventoSaveError = '';

  saveEvento() { 
    this.eventoSaveError = '';
    if (!this.evForm.titulo?.trim()) {
      this.eventoSaveError = 'O título do evento é obrigatório.';
      return;
    }

    // Send only the fields the backend expects in the body.
    // agendamentoId is already in the URL path, so we omit it from the body
    // to avoid a 400 "campos inválidos" rejection.
    const payload: Record<string, unknown> = {
      titulo: this.evForm.titulo.trim(),
      descricao: this.evForm.descricao || null,
      status: this.evForm.status || this.ag.status || 'EM_ANDAMENTO',
    };

    if (this.evForm.dataEvento) {
      payload['dataEvento'] = new Date(this.evForm.dataEvento).toISOString();
    }

    const obs = this.evForm.id
      ? this.agendamentoService.updateEvento(this.evForm.id, payload as any)
      : this.agendamentoService.createEvento(this.ag.id!, payload as any);

    obs.subscribe({
      next: () => {
        this.eventoSaveError = '';
        this.modal = false; 
        this.loadEventos();
      },
      error: (err) => {
        console.error('Erro ao salvar evento:', err);
        const details: string[] = err.error?.details || [];
        this.eventoSaveError = details.length
          ? details.join(' | ')
          : (err.error?.message || 'Erro ao salvar evento. Verifique os dados e tente novamente.');
      }
    });
  }

  removeEvento(e: EventoAgendamento) { 
    if (confirm(`Deseja realmente excluir o evento "${e.titulo}"?`)) {
      this.agendamentoService.deleteEvento(e.id!).subscribe({
        next: () => this.loadEventos(),
        error: (err) => {
          console.error('Erro ao excluir evento:', err);
          alert(err.error?.message || 'Erro ao excluir evento.');
        }
      });
    }
  }

  getCarImage(a: Agendamento): string {
    const model = a.veiculoModelo?.toLowerCase() || '';
    if (model.includes('seal') || model.includes('byd') || model.includes('dolphin')) {
      return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('pulse') || model.includes('compass') || model.includes('renegade') || model.includes('tracker') || model.includes('creta') || model.includes('t-cross') || model.includes('hr-v') || model.includes('suv')) {
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('porsche') || model.includes('mustang') || model.includes('ferrari') || model.includes('camaro') || model.includes('bmw') || model.includes('audi') || model.includes('mercedes')) {
      return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('civic') || model.includes('corolla') || model.includes('sentra') || model.includes('cruze') || model.includes('sedan')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600';
    }
    if (model.includes('gol') || model.includes('uno') || model.includes('palio') || model.includes('hb20') || model.includes('onix') || model.includes('argo') || model.includes('sandero')) {
      return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600';
    }
    const id = a.id || 0;
    const fallbacks = [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600'
    ];
    return fallbacks[id % fallbacks.length];
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}