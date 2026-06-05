import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { authGuard } from '../guards/auth.guard';
import { roleGuard } from '../guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { 
        path: 'usuarios', 
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('../pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) 
      },
      { 
        path: 'veiculos', 
        canActivate: [roleGuard(['CLIENTE', 'ADMIN'])],
        loadComponent: () => import('../pages/veiculos/veiculos.component').then(m => m.VeiculosComponent) 
      },
      { path: 'servicos', loadComponent: () => import('../pages/servicos/servicos.component').then(m => m.ServicosComponent) },
      { path: 'perfil', loadComponent: () => import('../pages/perfil/perfil.component').then(m => m.PerfilComponent) },
      { path: 'agendamentos', loadComponent: () => import('../pages/agendamentos/agendamentos.component').then(m => m.AgendamentosComponent) },
      { path: 'agendamentos/:id', loadComponent: () => import('../pages/agendamentos/agendamento-detalhe.component').then(m => m.AgendamentoDetalheComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
