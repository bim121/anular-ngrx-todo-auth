import { environment } from '../../../environments/environment';
import { RoutePageData } from '@app/core/routing/route-page-data.model';

export function buildDocumentTitle(page: RoutePageData | null): string {
  if (page?.title) {
    return `${page.title} | ${environment.appName}`;
  }

  return environment.appName;
}

export function buildPageDescription(page: RoutePageData | null): string {
  return page?.description ?? environment.defaultDescription;
}

export function buildCanonicalUrl(path: string): string {
  const base = environment.siteUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/') {
    return base;
  }

  return `${base}${normalizedPath}`;
}
