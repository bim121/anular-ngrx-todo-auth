import { RenderMode, ServerRoute } from '@angular/ssr';
import { SUPPORTED_LOCALES } from './core/i18n/locale.constants';

const localeParams = () => SUPPORTED_LOCALES.map((locale) => ({ locale }));

/**
 * Hybrid rendering (Phase 7.3 + 7.4 locale prefix):
 * - Public auth screens: prerendered static HTML per locale.
 * - Authenticated todo views: per-request SSR + TransferState (Phase 7.2).
 * - Everything else: client-only.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: ':locale/login',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return localeParams();
    },
  },
  {
    path: ':locale/register',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return localeParams();
    },
  },
  {
    path: ':locale/todos',
    renderMode: RenderMode.Server,
  },
  {
    path: ':locale/kanban',
    renderMode: RenderMode.Server,
  },
  {
    path: ':locale/calendar',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
