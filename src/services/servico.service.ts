import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Servico } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/servicos`;

  list(): Observable<Servico[]> { return this.http.get<Servico[]>(this.base); }
  ativos(): Observable<Servico[]> { return this.http.get<Servico[]>(`${this.base}/ativos`); }
  get(id: number): Observable<Servico> { return this.http.get<Servico>(`${this.base}/${id}`); }
  create(s: Servico): Observable<Servico> { return this.http.post<Servico>(this.base, s); }
  update(id: number, s: Servico): Observable<Servico> { return this.http.put<Servico>(`${this.base}/${id}`, s); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
