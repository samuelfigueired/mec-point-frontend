import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Agendamento, DashboardMecanico, EventoAgendamento, StatusAgendamento } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/agendamentos`;

  list(): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(this.base); }
  get(id: number): Observable<Agendamento> { return this.http.get<Agendamento>(`${this.base}/${id}`); }
  meus(): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/meus`); }
  byStatus(s: StatusAgendamento): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/status/${s}`); }
  byUsuario(uid: number): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/usuario/${uid}`); }
  byUsuarioStatus(uid: number, s: StatusAgendamento): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/usuario/${uid}/status/${s}`); }
  byMecanico(mid: number): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/mecanico/${mid}`); }
  byMecanicoStatus(mid: number, s: StatusAgendamento): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/mecanico/${mid}/status/${s}`); }
  byVeiculo(vid: number): Observable<Agendamento[]> { return this.http.get<Agendamento[]>(`${this.base}/veiculo/${vid}`); }
  dashboardMecanico(): Observable<DashboardMecanico> { return this.http.get<DashboardMecanico>(`${this.base}/dashboard/mecanico`); }
  dashboardMecanicoId(mid: number): Observable<DashboardMecanico> { return this.http.get<DashboardMecanico>(`${this.base}/dashboard/mecanico/${mid}`); }

  create(a: Agendamento): Observable<Agendamento> { return this.http.post<Agendamento>(this.base, a); }
  update(id: number, a: Agendamento): Observable<Agendamento> { return this.http.put<Agendamento>(`${this.base}/${id}`, a); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  updateStatus(id: number, status: StatusAgendamento): Observable<Agendamento> {
    return this.http.patch<Agendamento>(`${this.base}/${id}/status`, { status });
  }

  // Eventos
  listEventos(aid: number): Observable<EventoAgendamento[]> { return this.http.get<EventoAgendamento[]>(`${this.base}/${aid}/eventos`); }
  createEvento(aid: number, e: EventoAgendamento): Observable<EventoAgendamento> { return this.http.post<EventoAgendamento>(`${this.base}/${aid}/eventos`, e); }
  updateEvento(eid: number, e: EventoAgendamento): Observable<EventoAgendamento> { return this.http.put<EventoAgendamento>(`${this.base}/eventos/${eid}`, e); }
  deleteEvento(eid: number): Observable<void> { return this.http.delete<void>(`${this.base}/eventos/${eid}`); }
}
