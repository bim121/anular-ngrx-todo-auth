import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';
import { DEFAULT_LOCALE, isAppLocale } from './locale.constants';
import { LocaleService } from './locale.service';

export const localeGuard: CanActivateFn = (route) => {
  const localeParam = route.paramMap.get('locale');

  if (!isAppLocale(localeParam)) {
    const router = inject(Router);
    return router.createUrlTree(['/', DEFAULT_LOCALE, 'todos']);
  }

  const localeService = inject(LocaleService);
  return from(localeService.activate(localeParam)).pipe(map(() => true));
};
