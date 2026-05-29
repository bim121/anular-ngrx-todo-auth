import { selectIsLoggedIn } from './auth.selectors';
import { AuthState } from './auth.model';
import { authFeatureKey, initialState } from './auth.reducer';

describe('auth selectors', () => {
  const buildRootState = (auth: AuthState) => ({ [authFeatureKey]: auth });

  it('selectIsLoggedIn returns false for initial state', () => {
    expect(selectIsLoggedIn(buildRootState(initialState))).toBe(false);
  });

  it('selectIsLoggedIn returns true when user is logged in', () => {
    const state = buildRootState({
      ...initialState,
      isLoggedIn: true,
      user: { id: 'u1', name: 'Test', email: 't@e.com' },
      token: 'abc',
    });

    expect(selectIsLoggedIn(state)).toBe(true);
  });
});
