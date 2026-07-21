import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { RoutePageData } from './core/routing/route-page-data.model';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'todos',
        loadComponent: () =>
          import('@anular-ngrx/todos-feature-list').then(
            (m) => m.TodoListPageComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'My Todos',
          breadcrumb: 'Todos',
        } satisfies RoutePageData,
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('@anular-ngrx/auth-feature-login').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'My Profile',
          breadcrumb: 'Profile',
        } satisfies RoutePageData,
      },
    ],
  },
];
