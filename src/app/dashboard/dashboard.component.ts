import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  token = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const savedToken = this.auth.getToken();

    if (!savedToken) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.token = savedToken;
  }

  logout(): void {
    this.auth.clearToken();
    this.router.navigateByUrl('/login');
  }
}