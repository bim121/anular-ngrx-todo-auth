import { authReducer, initialState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { AuthResponse, User } from './auth.model';

describe('authReducer', () => {
  const user: User = { id: 'u1', name: 'Test', email: 'test@example.com' };
  const authResponse: AuthResponse = { user, accessToken: 'token-123' };

  it('returns initial state for unknown action', () => {
    const state = authReducer(undefined, { type: 'NOOP' } as any);
    expect(state).toEqual(initialState);
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

  it('loginFailure: stays logged out and stores error message', () => {
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

  it('logoutUser: resets state back to initial', () => {
    const loggedInState = authReducer(
      initialState,
      AuthActions.loginSuccess({ authResponse })
    );

    const state = authReducer(loggedInState, AuthActions.logoutUser());

    expect(state).toEqual(initialState);
  });
});
