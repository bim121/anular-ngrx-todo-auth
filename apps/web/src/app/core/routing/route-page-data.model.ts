/** Typed `data` on feature routes — used for document title, header, breadcrumbs, SEO. */
export interface RoutePageData {
  title: string;
  breadcrumb: string;
  description: string;
}

export const ROUTE_DATA_KEYS = {
  title: 'title',
  breadcrumb: 'breadcrumb',
  description: 'description',
} as const satisfies Record<keyof RoutePageData, keyof RoutePageData>;
