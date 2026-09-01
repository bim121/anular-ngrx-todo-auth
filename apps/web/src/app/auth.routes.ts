import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { RoutePageData } from './core/routing/route-page-data.model';
import { titleResolver } from './core/routing/title.resolver';

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
        resolve: { title: titleResolver },
        data: {
          pageKey: 'login',
          title: 'Login',
          breadcrumb: 'Login',
          description: 'Sign in to manage your tasks securely.',
        } satisfies RoutePageData,
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@anular-ngrx/auth-feature-login').then(
            (m) => m.RegisterComponent
          ),
        canActivate: [guestGuard],
        resolve: { title: titleResolver },
        data: {
          pageKey: 'register',
          title: 'Create Account',
          breadcrumb: 'Register',
          description: 'Create a free account and start organizing your todos.',
        } satisfies RoutePageData,
      },
    ],
  },
];
