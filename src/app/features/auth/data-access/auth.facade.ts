import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AuthStatus, LoginDto, RegisterDto, User } from './auth.model';
import * as AuthActions from './auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
  selectAuthStatus,
  selectIsLoggedIn,
  selectUser,
} from './auth.selectors';

/**
 * Thin API over NgRx auth state for UI layers (pages/layout).
 * Components call commands/queries here — they do not inject Store.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);

  readonly user = toSignal(this.store.select(selectUser), {
    initialValue: null as User | null,
  });
  readonly status = toSignal(this.store.select(selectAuthStatus), {
    initialValue: 'idle' as AuthStatus,
  });
  readonly isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), {
    initialValue: false,
  });
  readonly loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(selectAuthError), {
    initialValue: null as string | null,
  });

  login(credentials: LoginDto): void {
    this.store.dispatch(AuthActions.loginUser({ credentials }));
  }

  register(credentials: RegisterDto): void {
    this.store.dispatch(AuthActions.registerUser({ credentials }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }
}
