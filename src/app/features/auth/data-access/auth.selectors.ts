import { createSelector } from '@ngrx/store';
import { authFeature } from './auth.feature';

export { authFeature } from './auth.feature';

export const {
  selectAuthState,
  selectUser,
  selectToken,
  selectIsLoggedIn,
  selectIsLoading,
  selectError,
  selectIsAuthenticated,
} = authFeature;

export const selectAuthLoading = selectIsLoading;
export const selectAuthError = selectError;

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id
);
