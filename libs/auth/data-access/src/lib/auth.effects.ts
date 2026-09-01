import { inject, Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { EffectsLifecycleService } from '@anular-ngrx/shared-ui/effects-lifecycle.service';
import { ToastService } from '@anular-ngrx/shared-ui/toast/toast.service';
import { AuthService } from './auth.service';
import * as fromAuth from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly lifecycle = inject(EffectsLifecycleService);

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.registerUser),
      exhaustMap((action) =>
        this.authService.register(action.credentials).pipe(
          map((user) => fromAuth.registerSuccess({ user })),
          catchError((error) => of(fromAuth.registerFailure({ error })))
        )
      )
    )
  );

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.loginUser),
      exhaustMap((action) =>
        this.authService.login(action.credentials).pipe(
          map((authResponse) => fromAuth.loginSuccess({ authResponse })),
          catchError((error) => of(fromAuth.loginFailure({ error })))
        )
      )
    )
  );

  /** Non-dispatching: toast, navigation, analytics — see docs/ngrx-effects-operators.md */
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuth.registerSuccess),
        tap(() => {
          this.toast.success('Registration successful! Please log in.');
        })
      ),
    { dispatch: false }
  );

  private localeSegment(): string {
    const segment = this.router.url.split('?')[0]?.split('/').filter(Boolean)[0];
    return segment === 'ru' ? 'ru' : 'en';
  }

  authNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuth.loginSuccess, fromAuth.logoutUser),
        tap((action) => {
          const locale = this.localeSegment();

          if (action.type === fromAuth.loginSuccess.type) {
            this.router.navigate(['/', locale, 'todos']);
            return;
          }

          this.lifecycle.notifyCancelPendingRequests();
          this.router.navigate(['/', locale, 'login']);
        })
      ),
    { dispatch: false }
  );

  analyticsLog$ = createEffect(
    () =>
      this.actions$.pipe(
        tap((action) => {
          if (isDevMode()) {
            console.info('[analytics mock]', action.type);
          }
        })
      ),
    { dispatch: false }
  );
}
