import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs';
import { selectAuthPersistenceReady, selectIsAuthenticated } from '@anular-ngrx/auth-data-access';
import { localeUrlTree } from '../i18n/locale.util';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthPersistenceReady).pipe(
    filter(Boolean),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    take(1),
    map((isLoggedIn) => (isLoggedIn ? localeUrlTree(router, 'todos') : true)),
  );
};
