import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="navbar">
      <div class="brand-copy">
        <strong>MEC POINT</strong>
        <small>Visualização do sistema</small>
      </div>
      <div class="toolbar">
        <div class="search">
          <input type="text" placeholder="Pesquisar..." />
          <span>⌕</span>
        </div>
        <div class="avatar" aria-hidden="true"></div>
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
    .search { position: relative; width: min(100vw, 430px); }
    .search input {
      width: 100%;
      padding: 13px 46px 13px 18px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,.08);
      background: #ececec;
      color: #111;
      font-size: 14px;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
    }
    .search span { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #111; font-size: 22px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); box-shadow: 0 8px 16px rgba(255,106,0,.28); flex: 0 0 auto; }
    @media (max-width: 920px) { .navbar { flex-direction: column; align-items: flex-start; } .toolbar { width: 100%; } .search { width: 100%; } }
    @media (max-width: 768px) { .navbar { padding: 14px 16px; } .brand-copy strong { font-size: 18px; } }
  `],
})
export class NavbarComponent {
}
