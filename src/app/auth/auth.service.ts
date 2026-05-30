import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}

interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: number;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '';
  private readonly tokenKey = 'auth_token';
  private readonly isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
    const payload: LoginPayload = {
      email,
      senha: password
    };

    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload)
    );

    this.saveToken(response.token);
    return response;
  }

  register(payload: RegisterPayload): Promise<RegisterResponse> {
    return firstValueFrom(this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, payload));
  }

  saveToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.tokenKey);
  }
}
