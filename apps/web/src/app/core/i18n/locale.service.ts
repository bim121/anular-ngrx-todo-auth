import { Injectable, signal } from '@angular/core';
import {
  activateLocaleCatalog,
  registerLocaleCatalog,
} from './i18n.util';
import {
  AppLocale,
  DEFAULT_LOCALE,
} from './locale.constants';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<AppLocale>(DEFAULT_LOCALE);

  async activate(locale: AppLocale): Promise<boolean> {
    if (locale === 'ru') {
      const catalog = await import('../../../locale/messages.ru.json');
      registerLocaleCatalog('ru', catalog.translations);
    }

    activateLocaleCatalog(locale);
    this.locale.set(locale);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }

    return true;
  }
}
