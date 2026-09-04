import { routing, type AppLocale } from '../i18n/routing';

export const SITE_NAME = 'Todo Platform';

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:4300'
  );
}

export function localizedPath(locale: AppLocale, path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: AppLocale, path = ''): string {
  return `${getSiteUrl()}${localizedPath(locale, path)}`;
}

export const MARKETING_PATHS = ['', '/pricing', '/docs'] as const;

export function allLocalizedMarketingUrls(): string[] {
  return routing.locales.flatMap((locale) =>
    MARKETING_PATHS.map((path) => absoluteUrl(locale, path)),
  );
}
