import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loginSuccess, logoutUser } from '@anular-ngrx/auth-data-access';
import { tap } from 'rxjs';
import { SsrSessionSyncService } from '@app/core/ssr/ssr-session-sync.service';

/** Mirrors login/logout to httpOnly session cookie for SSR (Phase 7.2.4). */
@Injectable()
export class AuthSessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly sessionSync = inject(SsrSessionSyncService);

  syncSessionOnLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ authResponse }) => this.sessionSync.syncSession(authResponse))
      ),
    { dispatch: false }
  );

  clearSessionOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutUser),
        tap(() => this.sessionSync.clearSession())
      ),
    { dispatch: false }
  );
}
