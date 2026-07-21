import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { RoutePageData } from './core/routing/route-page-data.model';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@anular-ngrx/auth-feature-login').then((m) => m.LoginComponent),
        canActivate: [guestGuard],
        data: {
          title: 'Sign In',
          breadcrumb: 'Login',
        } satisfies RoutePageData,
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@anular-ngrx/auth-feature-login').then(
            (m) => m.RegisterComponent
          ),
        canActivate: [guestGuard],
        data: {
          title: 'Create Account',
          breadcrumb: 'Register',
        } satisfies RoutePageData,
      },
    ],
  },
];
