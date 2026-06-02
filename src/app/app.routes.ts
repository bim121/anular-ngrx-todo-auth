import { Routes } from '@angular/router';
import { PRELOAD_ROUTE_KEY } from '@app/core/routing/todos-preload.strategy';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: '',
    loadChildren: () =>
      import('@app/features/todos/todos.routes').then((m) => m.TODOS_ROUTES),
    data: { [PRELOAD_ROUTE_KEY]: true },
  },
  {
    path: '',
    loadChildren: () =>
      import('@app/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
];
