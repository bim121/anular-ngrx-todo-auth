import { Routes } from '@angular/router';
import { PRELOAD_ROUTE_KEY } from './core/routing/todos-preload.strategy';
import { localeGuard } from './core/i18n/locale.guard';
import { RoutePageData } from './core/routing/route-page-data.model';
import { titleResolver } from './core/routing/title.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'en/todos' },
  {
    path: ':locale',
    canActivate: [localeGuard],
    children: [
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
      {
        path: 'rtl-demo',
        loadComponent: () =>
          import('./features/rtl-demo/rtl-demo.component').then(
            (m) => m.RtlDemoComponent
          ),
        resolve: { title: titleResolver },
        data: {
          pageKey: 'rtl',
          title: 'RTL demo',
          breadcrumb: 'RTL',
          description: 'Design system layout check with dir=rtl.',
        } satisfies RoutePageData,
      },
    ],
  },
  { path: '**', redirectTo: 'en/todos' },
];
