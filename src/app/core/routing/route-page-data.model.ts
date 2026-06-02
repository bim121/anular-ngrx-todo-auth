/** Typed `data` on feature routes — used for document title, header, breadcrumbs. */
export interface RoutePageData {
  title: string;
  breadcrumb: string;
}

export const ROUTE_DATA_KEYS = {
  title: 'title',
  breadcrumb: 'breadcrumb',
} as const satisfies Record<keyof RoutePageData, keyof RoutePageData>;
