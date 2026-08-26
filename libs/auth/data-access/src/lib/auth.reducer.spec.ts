import { authReducer, initialState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { AuthResponse, User } from './auth.model';

describe('authReducer', () => {
  const user: User = { id: 'u1', name: 'Test', email: 'test@example.com' };
  const authResponse: AuthResponse = { user, accessToken: 'token-123' };

  it('returns initial state for unknown action', () => {
    const state = authReducer(undefined, { type: 'NOOP' } as never);
    expect(state).toEqual(initialState);
    expect(state.status).toBe('idle');
  });

  it('registerUser: transitions to submitting', () => {
    const state = authReducer(
      { ...initialState, error: 'old', status: 'error' },
      AuthActions.registerUser({
        credentials: { name: 'N', email: 'n@e.com', password: 'pw' },
      })
    );

    expect(state.status).toBe('submitting');
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('registerSuccess: returns to idle (not authenticated)', () => {
    const state = authReducer(
      { ...initialState, isLoading: true, status: 'submitting' },
      AuthActions.registerSuccess({ user })
    );

    expect(state.status).toBe('idle');
    expect(state.isLoading).toBe(false);
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBeNull();
  });

  it('registerFailure: transitions to error', () => {
    const state = authReducer(
      { ...initialState, isLoading: true, status: 'submitting' },
      AuthActions.registerFailure({ error: new Error('Email taken') })
    );

    expect(state.status).toBe('error');
    expect(state.isLoading).toBe(false);
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBe('Email taken');
  });

  it('registerFailure: falls back when error is not Error', () => {
    const state = authReducer(
      initialState,
      AuthActions.registerFailure({ error: 'fail' })
    );

    expect(state.status).toBe('error');
    expect(state.error).toBe('Registration failed');
  });

  it('loginUser: transitions to submitting', () => {
    const state = authReducer(
      { ...initialState, error: 'old', status: 'error' },
      AuthActions.loginUser({
        credentials: { email: 'test@example.com', password: 'pw' },
      })
    );

    expect(state.status).toBe('submitting');
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginSuccess: transitions to authenticated', () => {
    const state = authReducer(
      { ...initialState, isLoading: true, status: 'submitting' },
      AuthActions.loginSuccess({ authResponse })
    );

    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token-123');
    expect(state.isLoggedIn).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('restoreAuthFromSession: hydrates authenticated SSR session', () => {
    const state = authReducer(
      initialState,
      AuthActions.restoreAuthFromSession({ user, token: 'token-123' })
    );

    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token-123');
    expect(state.isLoggedIn).toBe(true);
    expect(state._persistedAt).not.toBeNull();
  });

  it('loginFailure: transitions to error', () => {
    const state = authReducer(
      { ...initialState, isLoading: true, status: 'submitting' },
      AuthActions.loginFailure({ error: new Error('Invalid creds') })
    );

    expect(state.status).toBe('error');
    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid creds');
  });

  it('loginFailure: falls back when error is not Error', () => {
    const state = authReducer(
      initialState,
      AuthActions.loginFailure({ error: 'fail' })
    );

    expect(state.status).toBe('error');
    expect(state.error).toBe('Login failed');
  });

  it('logoutUser: resets state back to idle', () => {
    const loggedInState = authReducer(
      initialState,
      AuthActions.loginSuccess({ authResponse })
    );

    const state = authReducer(loggedInState, AuthActions.logoutUser());

    expect(state).toEqual(initialState);
    expect(state.status).toBe('idle');
  });
});
