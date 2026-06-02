import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { RoutePageData } from '@app/core/routing/route-page-data.model';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@app/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'todos',
        loadComponent: () =>
          import('@app/features/todos/pages/todo-list/todo-list.component').then(
            (m) => m.TodoListComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'My Todos',
          breadcrumb: 'Todos',
        } satisfies RoutePageData,
      },
    ],
  },
];
