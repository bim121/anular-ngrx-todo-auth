import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: '',
    loadChildren: () =>
      import('@app/features/todos/todos.routes').then((m) => m.TODOS_ROUTES),
  },
  {
    path: '',
    loadChildren: () =>
      import('@app/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
];
