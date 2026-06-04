import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Role, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/users`;

  list(): Observable<User[]> { return this.http.get<User[]>(this.base); }
  get(id: number): Observable<User> { return this.http.get<User>(`${this.base}/${id}`); }
  create(u: User): Observable<User> { return this.http.post<User>(this.base, u); }
  update(id: number, u: User): Observable<User> { return this.http.put<User>(`${this.base}/${id}`, u); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  updateRole(id: number, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/role`, { role });
  }
  listMecanicos(): Observable<User[]> { return this.http.get<User[]>(`${this.base}/mecanicos`); }
}
