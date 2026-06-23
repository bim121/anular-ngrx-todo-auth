import { authReducer, initialState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { AuthResponse, User } from './auth.model';

describe('authReducer', () => {
  const user: User = { id: 'u1', name: 'Test', email: 'test@example.com' };
  const authResponse: AuthResponse = { user, accessToken: 'token-123' };

  it('returns initial state for unknown action', () => {
    const state = authReducer(undefined, { type: 'NOOP' } as never);
    expect(state).toEqual(initialState);
  });

  it('registerUser: sets loading and clears error', () => {
    const state = authReducer(
      { ...initialState, error: 'old' },
      AuthActions.registerUser({
        credentials: { name: 'N', email: 'n@e.com', password: 'pw' },
      })
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('registerSuccess: clears loading and keeps user logged out', () => {
    const state = authReducer(
      { ...initialState, isLoading: true },
      AuthActions.registerSuccess({ user })
    );

    expect(state.isLoading).toBe(false);
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBeNull();
  });

  it('registerFailure: stores Error message', () => {
    const state = authReducer(
      { ...initialState, isLoading: true },
      AuthActions.registerFailure({ error: new Error('Email taken') })
    );

    expect(state.isLoading).toBe(false);
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBe('Email taken');
  });

  it('registerFailure: falls back when error is not Error', () => {
    const state = authReducer(
      initialState,
      AuthActions.registerFailure({ error: 'fail' })
    );

    expect(state.error).toBe('Registration failed');
  });

  it('loginUser: sets loading and clears error', () => {
    const state = authReducer(
      { ...initialState, error: 'old' },
      AuthActions.loginUser({
        credentials: { email: 'test@example.com', password: 'pw' },
      })
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginSuccess: writes user + token and sets isLoggedIn', () => {
    const state = authReducer(
      { ...initialState, isLoading: true },
      AuthActions.loginSuccess({ authResponse })
    );

    expect(state.user).toEqual(user);
    expect(state.token).toBe('token-123');
    expect(state.isLoggedIn).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loginFailure: stores Error message', () => {
    const state = authReducer(
      { ...initialState, isLoading: true },
      AuthActions.loginFailure({ error: new Error('Invalid creds') })
    );

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

    expect(state.error).toBe('Login failed');
  });

  it('logoutUser: resets state back to initial', () => {
    const loggedInState = authReducer(
      initialState,
      AuthActions.loginSuccess({ authResponse })
    );

    const state = authReducer(loggedInState, AuthActions.logoutUser());

    expect(state).toEqual(initialState);
  });
});
