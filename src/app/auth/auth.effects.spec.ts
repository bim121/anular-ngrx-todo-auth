import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, ReplaySubject, firstValueFrom, take, toArray } from 'rxjs';
import { AuthEffects } from './auth.effects';
import { AuthService } from './auth.service';
import * as AuthActions from './auth.actions';
import { AuthResponse } from './auth.model';

describe('AuthEffects', () => {
  let actions$: ReplaySubject<any>;
  let effects: AuthEffects;
  let loginMock: ReturnType<typeof vi.fn>;

  const authResponse: AuthResponse = {
    user: { id: 'u1', name: 'Test', email: 't@e.com' },
    accessToken: 'token-abc',
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<any>(1);
    loginMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$ as unknown as Observable<any>),
        { provide: AuthService, useValue: { login: loginMock } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    effects = TestBed.inject(AuthEffects);
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
});
