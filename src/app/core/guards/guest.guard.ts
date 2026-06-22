import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs';
import {
  selectAuthPersistenceReady,
  selectIsAuthenticated,
} from '@app/features/auth/data-access/auth.selectors';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthPersistenceReady).pipe(
    filter(Boolean),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    take(1),
    map((isLoggedIn) =>
      isLoggedIn ? router.createUrlTree(['/todos']) : true
    )
  );
};
