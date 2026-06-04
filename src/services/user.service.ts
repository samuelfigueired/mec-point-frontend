import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Role, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/users`;

  private mapToBackend(u: User): User {
    if (u.role === 'CLIENTE') {
      return { ...u, role: 'USER' as Role };
    }
    return u;
  }

  private mapFromBackend(u: User): User {
    if ((u.role as string) === 'USER') {
      return { ...u, role: 'CLIENTE' };
    }
    return u;
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.base).pipe(
      map(users => users.map(u => this.mapFromBackend(u)))
    );
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`).pipe(
      map(u => this.mapFromBackend(u))
    );
  }

  create(u: User): Observable<User> {
    return this.http.post<User>(this.base, this.mapToBackend(u)).pipe(
      map(res => this.mapFromBackend(res))
    );
  }

  update(id: number, u: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, this.mapToBackend(u)).pipe(
      map(res => this.mapFromBackend(res))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateRole(id: number, role: Role): Observable<User> {
    const backendRole = role === 'CLIENTE' ? 'USER' : role;
    return this.http.patch<User>(`${this.base}/${id}/role`, { role: backendRole }).pipe(
      map(res => this.mapFromBackend(res))
    );
  }

  listMecanicos(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/mecanicos`).pipe(
      map(users => users.map(u => this.mapFromBackend(u)))
    );
  }
}
