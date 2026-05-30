import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  form;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: NonNullableFormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const result = await this.auth.register(this.form.getRawValue());
      this.success = `Conta criada com sucesso para ${result.nome}.`;
      this.form.reset();
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 1200);
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        this.error = e.error?.message || `Nao foi possivel criar a conta (HTTP ${e.status || 0}).`;
      } else {
        this.error = 'Nao foi possivel criar a conta.';
      }
    } finally {
      this.loading = false;
    }
  }
}
