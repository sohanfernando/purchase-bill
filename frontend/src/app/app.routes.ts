import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login | Enhanzer',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'purchase-bill',
    title: 'Purchase Bill | Enhanzer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/purchase-bill/purchase-bill.component').then(
        (m) => m.PurchaseBillComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'purchase-bill',
  },
  {
    path: '**',
    redirectTo: 'purchase-bill',
  },
];
