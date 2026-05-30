import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
	{ path: 'signup', loadComponent: () => import('./auth/signup.component').then(m => m.SignupComponent) },
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: '**', redirectTo: 'login' }
];
