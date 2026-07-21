import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { EffectsLifecycleService } from '@anular-ngrx/shared-ui';
import { ToastService } from '@anular-ngrx/shared-ui';
import { AuthEffects } from './auth.effects';
import { AuthService } from './auth.service';
import * as AuthActions from './auth.actions';
import { AuthResponse } from './auth.model';

describe('AuthEffects (marble)', () => {
  const authResponse: AuthResponse = {
    user: { id: 'u1', name: 'Test', email: 't@e.com' },
    accessToken: 'token-abc',
  };

  function runMarbleTest(
    setup: (helpers: {
      hot: TestScheduler['createHotObservable'];
      cold: TestScheduler['createColdObservable'];
    }) => {
      actionsMarble: string;
      actionsValues: Record<string, unknown>;
      effectKey: keyof AuthEffects;
      expectedMarble: string;
      expectedValues?: Record<string, unknown>;
      authService: Record<string, ReturnType<typeof vi.fn>>;
      toast?: { success: ReturnType<typeof vi.fn> };
      navigate?: ReturnType<typeof vi.fn>;
    }
  ): void {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, cold, expectObservable }) => {
      const config = setup({ hot, cold });
      const actions$ = hot(config.actionsMarble, config.actionsValues);

      TestBed.configureTestingModule({
        providers: [
          AuthEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: AuthService, useValue: config.authService },
          {
            provide: Router,
            useValue: { navigate: config.navigate ?? vi.fn() },
          },
          {
            provide: ToastService,
            useValue: config.toast ?? { success: vi.fn(), error: vi.fn() },
          },
        ],
      });

      const effects = TestBed.inject(AuthEffects);
      const effect$ = effects[config.effectKey] as Observable<unknown>;
      expectObservable(effect$).toBe(
        config.expectedMarble,
        config.expectedValues ?? {}
      );
    });
  }

  it('registerUser$: dispatches registerSuccess', () => {
    const user = authResponse.user;

    runMarbleTest(({ cold }) => ({
      actionsMarble: '-a',
      actionsValues: {
        a: AuthActions.registerUser({
          credentials: { name: 'Test', email: 't@e.com', password: 'pw' },
        }),
      },
      effectKey: 'registerUser$',
      expectedMarble: '--b',
      expectedValues: { b: AuthActions.registerSuccess({ user }) },
      authService: {
        register: vi.fn(() => cold('-u|', { u: user })),
      },
    }));
  });

  it('registerUser$: dispatches registerFailure on error', () => {
    const error = new Error('register failed');

    runMarbleTest(({ cold }) => ({
      actionsMarble: '-a',
      actionsValues: {
        a: AuthActions.registerUser({
          credentials: { name: 'Test', email: 't@e.com', password: 'pw' },
        }),
      },
      effectKey: 'registerUser$',
      expectedMarble: '--b',
      expectedValues: { b: AuthActions.registerFailure({ error }) },
      authService: {
        register: vi.fn(() => cold('-#', {}, error)),
      },
    }));
  });

  it('loginUser$: dispatches loginSuccess', () => {
    runMarbleTest(({ cold }) => ({
      actionsMarble: '-a',
      actionsValues: {
        a: AuthActions.loginUser({
          credentials: { email: 't@e.com', password: 'pw' },
        }),
      },
      effectKey: 'loginUser$',
      expectedMarble: '--b',
      expectedValues: { b: AuthActions.loginSuccess({ authResponse }) },
      authService: {
        login: vi.fn(() => cold('-r|', { r: authResponse })),
      },
    }));
  });

  it('loginUser$: dispatches loginFailure on error', () => {
    const error = new Error('invalid creds');

    runMarbleTest(({ cold }) => ({
      actionsMarble: '-a',
      actionsValues: {
        a: AuthActions.loginUser({
          credentials: { email: 't@e.com', password: 'pw' },
        }),
      },
      effectKey: 'loginUser$',
      expectedMarble: '--b',
      expectedValues: { b: AuthActions.loginFailure({ error }) },
      authService: {
        login: vi.fn(() => cold('-#', {}, error)),
      },
    }));
  });

  it('registerSuccess$: shows toast (non-dispatching)', () => {
    const toastSuccess = vi.fn();
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const action = AuthActions.registerSuccess({ user: authResponse.user });
      const actions$ = hot('-a', { a: action });

      TestBed.configureTestingModule({
        providers: [
          AuthEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: AuthService, useValue: {} },
          { provide: Router, useValue: { navigate: vi.fn() } },
          {
            provide: ToastService,
            useValue: { success: toastSuccess, error: vi.fn() },
          },
        ],
      });

      const effects = TestBed.inject(AuthEffects);
      expectObservable(effects.registerSuccess$).toBe('-a', { a: action });
    });

    expect(toastSuccess).toHaveBeenCalledWith(
      'Registration successful! Please log in.'
    );
  });

  it('authNavigation$: navigates to /todos on loginSuccess', () => {
    const navigate = vi.fn();
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const action = AuthActions.loginSuccess({ authResponse });
      const actions$ = hot('-a', { a: action });

      TestBed.configureTestingModule({
        providers: [
          AuthEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: AuthService, useValue: {} },
          { provide: Router, useValue: { navigate } },
          {
            provide: ToastService,
            useValue: { success: vi.fn(), error: vi.fn() },
          },
        ],
      });

      const effects = TestBed.inject(AuthEffects);
      expectObservable(effects.authNavigation$).toBe('-a', { a: action });
    });

    expect(navigate).toHaveBeenCalledWith(['/todos']);
  });

  it('authNavigation$: navigates to /login on logout', () => {
    const navigate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() =>
          of(AuthActions.logoutUser()) as Observable<unknown>
        ),
        { provide: AuthService, useValue: {} },
        { provide: Router, useValue: { navigate } },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
      ],
    });

    const lifecycle = TestBed.inject(EffectsLifecycleService);
    const cancelSpy = vi.spyOn(lifecycle, 'notifyCancelPendingRequests');
    const effects = TestBed.inject(AuthEffects);

    effects.authNavigation$.subscribe();

    expect(cancelSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('analyticsLog$: logs action type in dev mode', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const action = AuthActions.loginUser({
      credentials: { email: 'a@b.com', password: 'x' },
    });
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const actions$ = hot('-a', { a: action });

      TestBed.configureTestingModule({
        providers: [
          AuthEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: AuthService, useValue: {} },
          { provide: Router, useValue: { navigate: vi.fn() } },
          {
            provide: ToastService,
            useValue: { success: vi.fn(), error: vi.fn() },
          },
        ],
      });

      const effects = TestBed.inject(AuthEffects);
      expectObservable(effects.analyticsLog$).toBe('-a', { a: action });
    });

    expect(infoSpy).toHaveBeenCalledWith('[analytics mock]', action.type);

    infoSpy.mockRestore();
  });
});
