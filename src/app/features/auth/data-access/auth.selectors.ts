import { createSelector } from '@ngrx/store';
import { authFeature } from './auth.feature';

export { authFeature } from './auth.feature';

export const {
  selectAuthState,
  selectUser,
  selectToken,
  selectStatus,
  selectIsLoggedIn,
  selectIsLoading,
  selectError,
  selectIsAuthenticated,
} = authFeature;

export const selectAuthStatus = selectStatus;
export const selectAuthLoading = selectIsLoading;
export const selectAuthError = selectError;

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id
);

export const selectAuthPersistenceReady = createSelector(
  selectAuthState,
  (state) => state._persistedAt != null
);
