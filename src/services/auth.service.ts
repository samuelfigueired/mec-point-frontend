import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map } from 'rxjs';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from './api.config';
import { AuthRequest, AuthResponse, RegisterRequest, Role, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/auth`;

  login(req: AuthRequest): Observable<User> {
    return this.http.post<{ token: string }>(`${this.base}/login`, req).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
      }),
      switchMap(() => this.me()),
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  register(req: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/register`, req);
  }

  private mapUser(user: User): User {
    if (user && (user.role as string) === 'USER') {
      return { ...user, role: 'CLIENTE' };
    }
    return user;
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`).pipe(
      map(user => this.mapUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  get currentUser(): User | null {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (!raw || raw === 'undefined') {
      return null;
    }
    try {
      return this.mapUser(JSON.parse(raw));
    } catch (e) {
      console.error('Erro ao ler usuário do localStorage:', e);
      return null;
    }
  }

  get role(): Role {
    return this.currentUser?.role ?? 'CLIENTE';
  }

  get isAuthenticated(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);
  }
}
