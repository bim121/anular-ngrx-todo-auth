import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * SSR strategy (Phase 5.6.2):
 * - Auth screens: server-rendered so we can verify hydration on `/login`.
 * - App shell (todos/profile): client-only — needs auth + API; avoid prerender flakes in CI.
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
    path: '**',
    renderMode: RenderMode.Client,
  },
];
