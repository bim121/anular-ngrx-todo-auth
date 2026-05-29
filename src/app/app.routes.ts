import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'todos',
        loadComponent: () =>
          import('@app/features/todos/pages/todo-list/todo-list.component').then(
            (m) => m.TodoListComponent
          ),
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@app/features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@app/features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },
];
