import {
  selectAuthPersistenceReady,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsLoggedIn,
} from './auth.selectors';
import { AuthState } from './auth.model';
import { authFeatureKey, initialState } from './auth.reducer';

describe('auth selectors', () => {
  const buildRootState = (auth: AuthState) => ({ [authFeatureKey]: auth });

  it('selectIsLoggedIn returns false for initial state', () => {
    expect(selectIsLoggedIn(buildRootState(initialState))).toBe(false);
  });

  it('selectAuthStatus is idle initially', () => {
    expect(selectAuthStatus(buildRootState(initialState))).toBe('idle');
  });

  it('selectIsLoggedIn returns true when user is logged in', () => {
    const state = buildRootState({
      ...initialState,
      status: 'authenticated',
      isLoggedIn: true,
      user: { id: 'u1', name: 'Test', email: 't@e.com' },
      token: 'abc',
    });

    expect(selectIsLoggedIn(state)).toBe(true);
  });

  it('selectIsAuthenticated requires authenticated status and token', () => {
    const withoutToken = buildRootState({
      ...initialState,
      status: 'authenticated',
      isLoggedIn: true,
      token: null,
    });
    expect(selectIsAuthenticated(withoutToken)).toBe(false);

    const authenticated = buildRootState({
      ...initialState,
      status: 'authenticated',
      isLoggedIn: true,
      user: { id: 'u1', name: 'Test', email: 't@e.com' },
      token: 'abc',
    });
    expect(selectIsAuthenticated(authenticated)).toBe(true);
  });

  it('selectAuthPersistenceReady is true when _persistedAt is set', () => {
    expect(selectAuthPersistenceReady(buildRootState(initialState))).toBe(false);

    expect(
      selectAuthPersistenceReady(
        buildRootState({ ...initialState, _persistedAt: Date.now() })
      )
    ).toBe(true);
  });
});
