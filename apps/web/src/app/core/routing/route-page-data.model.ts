/** Typed `data` on feature routes — used for document title, header, breadcrumbs, SEO. */
export type RoutePageKey =
  | 'login'
  | 'register'
  | 'todos'
  | 'kanban'
  | 'calendar'
  | 'profile'
  | 'rtl';

export interface RoutePageData {
  title: string;
  breadcrumb: string;
  description: string;
  /** Key for `$localize` route copy (Phase 7.4). */
  pageKey?: RoutePageKey;
}

export const ROUTE_DATA_KEYS = {
  title: 'title',
  breadcrumb: 'breadcrumb',
  description: 'description',
  pageKey: 'pageKey',
} as const satisfies Record<keyof RoutePageData, keyof RoutePageData>;
