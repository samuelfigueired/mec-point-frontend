import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="layout-main">
        <app-navbar />
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--bg); position: relative; }
    .layout-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .layout-content {
      flex: 1;
      min-width: 0;
      padding: 28px 32px 32px;
      background:
        radial-gradient(circle at top, rgba(255,255,255,.05), transparent 26%),
        linear-gradient(180deg, rgba(255,255,255,.02), rgba(0,0,0,.1));
    }
    @media (max-width: 960px) { .layout { flex-direction: column; } }
    @media (max-width: 768px) { .layout-content { padding: 16px; } }
  `],
})
export class LayoutComponent {}
