import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form;

  loading = false;
  error = '';

  constructor(private fb: NonNullableFormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      await this.auth.signIn(this.form.getRawValue());
      this.router.navigateByUrl('/dashboard');
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        this.error = e.error?.message || `Nao foi possivel autenticar (HTTP ${e.status || 0}).`;
      } else {
        this.error = 'Nao foi possivel autenticar.';
      }
    } finally {
      this.loading = false;
    }
  }
}
