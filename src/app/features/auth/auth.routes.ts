import { Routes } from '@angular/router';
import { guestGuard } from '@app/core/guards/guest.guard';
import { RoutePageData } from '@app/core/routing/route-page-data.model';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@app/layout/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@app/features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
        canActivate: [guestGuard],
        data: {
          title: 'Sign In',
          breadcrumb: 'Login',
        } satisfies RoutePageData,
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@app/features/auth/pages/register/register.component').then(
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
