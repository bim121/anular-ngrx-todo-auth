import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Hybrid rendering (Phase 7.3):
 * - Public auth screens: prerendered static HTML (SEO + fast TTFB).
 * - Authenticated todo views: per-request SSR + TransferState (Phase 7.2).
 * - Everything else: client-only.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender,
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
