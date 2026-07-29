import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { logoutUser } from '@anular-ngrx/auth-data-access';
import { HttpCacheService } from '@app/core/http/http-cache.service';

/** Clears HTTP todo cache on logout so the next session cannot see prior GETs. */
@Injectable()
export class HttpCacheEffects {
  private readonly actions$ = inject(Actions);
  private readonly cache = inject(HttpCacheService);

  clearCacheOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutUser),
        tap(() => this.cache.clear())
      ),
    { dispatch: false }
  );
}
