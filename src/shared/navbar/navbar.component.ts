import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <div class="brand-copy">
        <strong>MEC POINT</strong>
        <small>Visualização do sistema</small>
      </div>
      <div class="toolbar">
        <div class="profile-container">
          <button class="avatar-btn" (click)="toggleDropdown()" aria-label="Menu do perfil">
            <div class="avatar"></div>
          </button>
          <div class="dropdown-menu" *ngIf="showDropdown">
            <div class="user-info" *ngIf="currentUser">
              <span class="user-name">{{ currentUser.nome }}</span>
              <span class="user-email">{{ currentUser.email }}</span>
              <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
            </div>
            <button class="dropdown-item logout-btn" (click)="logout()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 2px;">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 28px;
      background: linear-gradient(180deg, #f0f0f0 0%, #e2e2e2 100%);
      border-bottom: 1px solid rgba(0,0,0,.06);
      box-shadow: 0 8px 24px rgba(0,0,0,.05);
      color: #111;
    }
    .brand-copy { display: flex; flex-direction: column; gap: 4px; color: #111; }
    .brand-copy strong { font-size: 22px; font-weight: 900; letter-spacing: 1px; }
    .brand-copy small { color: #4d4d4d; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; }
    .toolbar { display: flex; align-items: center; gap: 16px; margin-left: auto; }

    
    .profile-container {
      position: relative;
    }
    .avatar-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      outline: none;
      border-radius: 50%;
    }
    .avatar { 
      width: 44px; 
      height: 44px; 
      border-radius: 50%; 
      background: var(--accent); 
      box-shadow: 0 8px 16px rgba(255,106,0,.28); 
      transition: transform 0.2s ease;
    }
    .avatar-btn:hover .avatar {
      transform: scale(1.05);
    }
    .dropdown-menu {
      position: absolute;
      right: 0;
      top: 54px;
      background: #2c2c2c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      min-width: 180px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      padding: 8px 0;
      z-index: 100;
      animation: fadeIn 0.2s ease;
    }
    .user-info {
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .user-name {
      font-weight: 700;
      font-size: 13px;
      color: #fff;
    }
    .user-email {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .user-role {
      font-size: 10px;
      color: var(--accent);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .dropdown-item {
      width: 100%;
      background: none;
      border: none;
      padding: 10px 16px;
      color: #fff;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .dropdown-item:hover {
      background: rgba(255, 106, 0, 0.15);
      color: var(--accent);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 920px) { .navbar { flex-direction: column; align-items: flex-start; } .toolbar { width: 100%; } }
    @media (max-width: 768px) { .navbar { padding: 14px 16px; } .brand-copy strong { font-size: 18px; } }
  `],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef);

  showDropdown = false;

  get currentUser() {
    return this.authService.currentUser;
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MECANICO': 'Mecânico',
      'CLIENTE': 'Cliente'
    };
    return map[role] || role;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
