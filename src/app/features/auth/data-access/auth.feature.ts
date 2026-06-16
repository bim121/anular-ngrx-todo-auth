import { createFeature, createSelector } from '@ngrx/store';
import { authReducer } from './auth.reducer';

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
  extraSelectors: ({ selectAuthState }) => ({
    selectIsAuthenticated: createSelector(
      selectAuthState,
      (state) => state.isLoggedIn && !!state.token
    ),
  }),
});
