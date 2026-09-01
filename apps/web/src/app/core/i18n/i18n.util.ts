import { loadTranslations } from '@angular/localize';
import type { AppLocale } from './locale.constants';

const catalogs = new Map<AppLocale, Record<string, string>>();

export function registerLocaleCatalog(
  locale: AppLocale,
  messages: Record<string, string>
): void {
  catalogs.set(locale, messages);
}

export function activateLocaleCatalog(locale: AppLocale): void {
  if (locale === 'en') {
    loadTranslations({});
    return;
  }

  loadTranslations(catalogs.get(locale) ?? {});
}

