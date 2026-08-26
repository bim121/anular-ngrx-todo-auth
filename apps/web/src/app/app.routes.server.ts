import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * SSR strategy (Phase 7.2 / 7.3):
 * - Auth screens: server-rendered for hydration checks.
 * - Todo data routes: server-rendered with TransferState + session cookie.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Server,
  },
  {
    path: 'register',
    renderMode: RenderMode.Server,
  },
  {
    path: 'todos',
    renderMode: RenderMode.Server,
  },
  {
    path: 'kanban',
    renderMode: RenderMode.Server,
  },
  {
    path: 'calendar',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
