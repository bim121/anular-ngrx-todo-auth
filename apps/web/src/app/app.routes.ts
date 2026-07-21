import { Routes } from '@angular/router';
import { PRELOAD_ROUTE_KEY } from './core/routing/todos-preload.strategy';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: '',
    loadChildren: () =>
      import('./todos.routes').then((m) => m.TODOS_ROUTES),
    data: { [PRELOAD_ROUTE_KEY]: true },
  },
  {
    path: '',
    loadChildren: () => import('./auth.routes').then((m) => m.AUTH_ROUTES),
  },
];
