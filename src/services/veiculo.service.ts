import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Veiculo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/veiculos`;

  list(): Observable<Veiculo[]> { return this.http.get<Veiculo[]>(this.base); }
  get(id: number): Observable<Veiculo> { return this.http.get<Veiculo>(`${this.base}/${id}`); }
  byUsuario(uid: number): Observable<Veiculo[]> { return this.http.get<Veiculo[]>(`${this.base}/usuario/${uid}`); }
  meus(): Observable<Veiculo[]> { return this.http.get<Veiculo[]>(`${this.base}/meus`); }
  create(v: Veiculo): Observable<Veiculo> { return this.http.post<Veiculo>(this.base, v); }
  update(id: number, v: Veiculo): Observable<Veiculo> { return this.http.put<Veiculo>(`${this.base}/${id}`, v); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
