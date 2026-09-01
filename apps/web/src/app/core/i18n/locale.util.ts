import { Router, UrlTree } from '@angular/router';
import {
  AppLocale,
  DEFAULT_LOCALE,
  isAppLocale,
} from './locale.constants';

export function getLocaleFromUrl(url: string): AppLocale {
  const segment = url.split('?')[0]?.split('/').filter(Boolean)[0];
  return isAppLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function getLocaleFromRouter(router: Router): AppLocale {
  return getLocaleFromUrl(router.url);
}

export function localeUrlTree(
  router: Router,
  ...segments: string[]
): UrlTree {
  const locale = getLocaleFromRouter(router);
  return router.createUrlTree(['/', locale, ...segments]);
}

export function swapLocaleInPath(path: string, locale: AppLocale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const parts = normalized.split('/').filter(Boolean);

  if (parts.length > 0 && isAppLocale(parts[0])) {
    parts[0] = locale;
  } else {
    parts.unshift(locale);
  }

  return `/${parts.join('/')}`;
}

export function pathWithoutLocale(path: string): string {
  const parts = path.split('?')[0]?.split('/').filter(Boolean) ?? [];
  if (parts.length > 0 && isAppLocale(parts[0])) {
    parts.shift();
  }
  return parts.length ? `/${parts.join('/')}` : '/';
}
