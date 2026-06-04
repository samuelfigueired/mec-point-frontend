import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Agendamento, EventoAgendamento } from '../../models/models';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-agendamento-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  template: `
    <header class="main-header">
      <div class="logo">MEC POINT</div>
      <nav class="nav-links">
        <a href="#" class="active">Serviços</a>
        <a href="#">Serviços</a>
        <a href="#">Serviços</a>
        <a href="#">Serviços</a>
      </nav>
      <div class="user-avatar"></div>
    </header>

    <main class="page-shell">
      <div class="search-section">
        <div class="search-wrapper">
          <input type="text" class="main-search" placeholder="Pesquisar...">
          <button class="search-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="section-title-bar">
        <h1 class="page-title-orange">Meus Agendamentos</h1>
        <button class="app-btn app-btn-accent" (click)="openNewEvento()">
          Novo Agendamento 
          <span class="plus-icon">+</span>
        </button>
      </div>

      <div class="appointment-shell">
        <div class="vehicle-side-panel">
          <span class="vehicle-id">ID: {{ id || '927837' }}</span>
          <img 
            [src]="ag.veiculoModelo?.toLowerCase()?.includes('seal') ? 'https://images.images.com/byd-seal.png' : 'https://images.images.com/fiat-pulse.png'" 
            alt="Veículo" 
            class="vehicle-img"
          />
        </div>
        
        <div class="service-info-panel">
          <div class="info-header">Serviços</div>
          <div class="info-body">
            <div class="info-grid">
              <span class="info-label">Status</span>
              <span class="info-value">
                <span class="status-dot" [ngClass]="ag.status === 'FINALIZADO' ? 'dot-concluido' : 'dot-andamento'"></span> 
                {{ statusLabel }}
              </span>
              
              <span class="info-label">Placa</span>
              <span class="info-value">{{ ag.veiculoPlaca || 'TRHX-9972' }}</span>
              
              <span class="info-label">Data</span>
              <span class="info-value">{{ ag.dataHora || '20/03/2026' }}</span>
              
              <span class="info-label">Modelo</span>
              <span class="info-value font-bold">{{ ag.veiculoModelo || 'FIAT PULSE' }}</span>
              
              <span class="info-label">Ano</span>
              <span class="info-value">{{ '—' }}</span>
              
              <span class="info-label">Descrição</span>
              <span class="info-value text-upper">{{ ag.descricao || 'Carro deixado para a revisão' }}</span>
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
              <small>{{ e.dataEvento }}</small>
              <p>{{ e.descricao }}</p>
              <div class="evt-actions">
                <button class="app-btn app-btn-sm app-btn-ghost" (click)="openEditEvento(e)">Editar</button>
                <button class="app-btn app-btn-sm app-btn-danger" (click)="removeEvento(e)">Excluir</button>
              </div>
            </div>
          </li>
        </ul>

        <ng-template #emptyTimeline>
          <div class="empty-state">
            <strong>Nenhum evento registrado</strong>
            <p>Clique em "+ Evento" para adicionar atualizações na timeline deste veículo.</p>
          </div>
        </ng-template>
      </div>
    </main>

    <app-modal [open]="modal" [title]="evForm.id ? 'Editar evento' : 'Novo evento'" (close)="modal=false">
      <label class="dialog-label">Título</label>
      <input class="input" name="titulo" [(ngModel)]="evForm.titulo" />
      
      <label class="dialog-label">Data</label>
      <input class="input" type="datetime-local" name="data" [(ngModel)]="evForm.dataEvento" />
      
      <label class="dialog-label">Descrição</label>
      <textarea class="input" rows="3" name="descricao" [(ngModel)]="evForm.descricao"></textarea>
      
      <div class="dialog-actions">
        <button class="app-btn app-btn-ghost" (click)="modal=false">Cancelar</button>
        <button class="app-btn" (click)="saveEvento()">Salvar</button>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #4a4a4a;
      min-height: 100vh;
      color: #ffffff;
      font-family: 'Montserrat', sans-serif;
    }

    .page-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px 40px;
    }

    .main-header {
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 50px;
      color: #121212;
    }

    .main-header .logo {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }

    .nav-links { display: flex; gap: 25px; }
    .nav-links a { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #121212; }
    .nav-links a.active { border-bottom: 2px solid var(--accent, #ff6a00); }
    .user-avatar { width: 45px; height: 45px; background-color: var(--accent, #ff6a00); border-radius: 50%; }

    .search-section { display: flex; justify-content: center; margin: 40px 0; }
    .search-wrapper { position: relative; width: 100%; max-width: 550px; }
    
    .main-search {
      width: 100%;
      padding: 15px 60px 15px 25px;
      border-radius: 999px;
      border: none;
      background-color: #d9d9d9;
      font-size: 16px;
      color: #121212;
      outline: none;
    }

    .search-btn {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #121212;
      cursor: pointer;
    }

    .section-title-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-bottom: 35px;
    }

    .page-title-orange {
      color: var(--accent, #ff6a00);
      font-size: 32px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .app-btn-accent {
      position: absolute;
      right: 0;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 24px;
      border: 2px solid #fff;
    }

    .plus-icon {
      background: rgba(0, 0, 0, 0.2);
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 12px;
    }

    .appointment-shell {
      display: grid;
      grid-template-columns: 45% 55%;
      background-color: #d9d9d9;
      border-radius: 24px;
      overflow: hidden;
      min-height: 290px;
      margin-bottom: 40px;
      box-shadow: 0 18px 40px rgba(0,0,0,.22);
    }

    .vehicle-side-panel {
      padding: 20px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vehicle-id {
      position: absolute;
      top: 20px;
      left: 20px;
      color: #121212;
      font-weight: 800;
      font-size: 12px;
    }

    .vehicle-img { max-width: 85%; height: auto; object-fit: contain; }

    .service-info-panel {
      background-color: #5a5a5a;
      border-top-left-radius: 24px;
      border-bottom-left-radius: 24px;
      display: flex;
      flex-direction: column;
    }

    .info-header {
      background-color: #4a4a4a;
      color: var(--accent, #ff6a00);
      text-align: center;
      padding: 12px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 16px;
      letter-spacing: 1px;
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
      grid-template-columns: 120px 1fr;
      row-gap: 10px;
      width: 100%;
    }

    .info-label { color: #121212; font-weight: 800; text-transform: uppercase; font-size: 13px; }
    .info-value { color: #121212; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }

    .orange-detail-dot {
      position: absolute;
      top: 20px;
      right: 40px;
      width: 24px;
      height: 24px;
      background-color: var(--accent, #ff6a00);
      border-radius: 50%;
    }

    .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot-andamento { background-color: #59d26c; }
    .dot-concluido { background-color: #ea4f42; }
    .font-bold { font-weight: 800; }
    .text-upper { text-transform: uppercase; }

    .timeline-section-panel {
      background: #5a5a5a;
      border-radius: 24px;
      padding: 30px;
      box-shadow: 0 18px 40px rgba(0,0,0,.22);
    }

    .timeline-header h3 {
      margin: 0 0 20px 0;
      color: var(--accent, #ff6a00);
      text-transform: uppercase;
      font-weight: 800;
      font-size: 18px;
    }

    .timeline { list-style: none; padding: 0; margin: 0; }
    .timeline li { display: flex; gap: 14px; padding: 15px 0; border-left: 3px solid var(--accent, #ff6a00); margin-left: 8px; padding-left: 25px; position: relative; }
    .timeline .dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; background: var(--accent, #ff6a00); border-radius: 50%; }
    
    .timeline-content strong { color: #fff; display: block; font-size: 16px; }
    .timeline-content small { color: #ccc; font-size: 12px; }
    .timeline-content p { color: #e0e0e0; margin: 6px 0; }

    .evt-actions { display: flex; gap: 8px; margin-top: 10px; }

    .empty-state { border: 2px dashed rgba(255,255,255,.2); border-radius: 14px; padding: 30px; text-align: center; }
    .empty-state strong { display: block; margin-bottom: 5px; color: #fff; }
    .empty-state p { margin: 0; color: #ccc; font-size: 14px; }

    .dialog-label { display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #fff; margin: 12px 0 6px; }
    .input { width: 100%; padding: 12px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.24); background: #ececec; color: #121212; font-size: 14px; outline: none; }
    .dialog-actions { margin-top: 18px; display: flex; gap: 8px; justify-content: flex-end; }

    @media (max-width: 768px) {
      .appointment-shell { grid-template-columns: 1fr; }
      .service-info-panel { border-radius: 0; }
      .app-btn-accent { position: static; margin-top: 15px; }
      .section-title-bar { flex-direction: column; gap: 10px; }
    }
  `],
})
export class AgendamentoDetalheComponent implements OnInit {
  @Input() id?: string;
  ag: Agendamento = { id: 0, usuarioId: 0, veiculoId: 0, dataHora: '', status: 'PENDENTE', descricao: '' };
  eventos: EventoAgendamento[] = [];
  modal = false;
  evForm: EventoAgendamento = { agendamentoId: 0, titulo: '', dataEvento: '', descricao: '' };
  statusLabel = 'Em Andamento';

  ngOnInit() { 
    if (this.id) this.ag.id = +this.id; 
    this.statusLabel = this.ag.status === 'FINALIZADO' ? 'Finalizado' : 'Em Andamento';
  }

  openNewEvento() { 
    this.evForm = { agendamentoId: this.ag.id!, titulo: '', dataEvento: '', descricao: '' }; 
    this.modal = true; 
  }

  openEditEvento(e: EventoAgendamento) { 
    this.evForm = { ...e }; 
    this.modal = true; 
  }

  saveEvento() { 
    if (this.evForm.id) {
      this.eventos = this.eventos.map(x => x.id === this.evForm.id ? { ...this.evForm } : x);
    } else {
      this.eventos = [...this.eventos, { ...this.evForm, id: Date.now() }];
    }
    this.modal = false; 
  }

  removeEvento(e: EventoAgendamento) { 
    if (confirm('Excluir evento?')) {
      this.eventos = this.eventos.filter(x => x.id !== e.id);
    }
  }
}