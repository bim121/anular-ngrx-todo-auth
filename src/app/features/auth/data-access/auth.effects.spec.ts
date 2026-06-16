import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, ReplaySubject, firstValueFrom, take, toArray } from 'rxjs';
import { EffectsLifecycleService } from '@app/core/effects/effects-lifecycle.service';
import { AuthEffects } from './auth.effects';
import { AuthService } from './auth.service';
import { ToastService } from '@app/shared/ui/toast/toast.service';
import * as AuthActions from './auth.actions';
import { AuthResponse } from './auth.model';

describe('AuthEffects', () => {
  let actions$: ReplaySubject<any>;
  let effects: AuthEffects;
  let loginMock: ReturnType<typeof vi.fn>;
  let navigateMock: ReturnType<typeof vi.fn>;
  let lifecycle: EffectsLifecycleService;

  const authResponse: AuthResponse = {
    user: { id: 'u1', name: 'Test', email: 't@e.com' },
    accessToken: 'token-abc',
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<any>(1);
    loginMock = vi.fn();
    navigateMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$ as unknown as Observable<any>),
        { provide: AuthService, useValue: { login: loginMock } },
        { provide: Router, useValue: { navigate: navigateMock } },
        { provide: ToastService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });

    effects = TestBed.inject(AuthEffects);
    lifecycle = TestBed.inject(EffectsLifecycleService);
  });

  it('loginUser$: dispatches loginSuccess when AuthService.login resolves', async () => {
    loginMock.mockReturnValue(
      new Observable((sub) => {
        sub.next(authResponse);
        sub.complete();
      })
    );

    const emissions = firstValueFrom(
      effects.loginUser$.pipe(take(1), toArray())
    );

    actions$.next(
      AuthActions.loginUser({
        credentials: { email: 't@e.com', password: 'pw' },
      })
    );

    const result = await emissions;

    expect(loginMock).toHaveBeenCalledWith({
      email: 't@e.com',
      password: 'pw',
    });
    expect(result).toEqual([AuthActions.loginSuccess({ authResponse })]);
  });

  it('authNavigation$: navigates to /todos on loginSuccess', async () => {
    const sub = effects.authNavigation$.subscribe();

    actions$.next(AuthActions.loginSuccess({ authResponse }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(navigateMock).toHaveBeenCalledWith(['/todos']);
    sub.unsubscribe();
  });

  it('authNavigation$: navigates to /login and cancels pending requests on logout', async () => {
    const cancelSpy = vi.spyOn(lifecycle, 'notifyCancelPendingRequests');
    const sub = effects.authNavigation$.subscribe();

    actions$.next(AuthActions.logoutUser());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(cancelSpy).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
    sub.unsubscribe();
  });
});
