import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
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

  constructor(private http: HttpClient) {}

  // Mock sign-in: aceita qualquer credencial com senha >= 6
  async signIn({ email, password }: { email: string; password: string }): Promise<void> {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !password) {
      throw new Error('Credenciais inválidas');
    }
    if (password.length < 6) {
      throw new Error('Senha muito curta');
    }
    // aqui você trocaria por chamada HTTP real
    return;
  }

  register(payload: RegisterPayload): Promise<RegisterResponse> {
    return firstValueFrom(this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, payload));
  }
}
