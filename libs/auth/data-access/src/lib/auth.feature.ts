import { createFeature, createSelector } from '@ngrx/store';
import { authReducer } from './auth.reducer';

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
  extraSelectors: ({ selectStatus, selectToken }) => ({
    selectIsAuthenticated: createSelector(
      selectStatus,
      selectToken,
      (status, token) => status === 'authenticated' && !!token
    ),
    selectIsSubmitting: createSelector(
      selectStatus,
      (status) => status === 'submitting'
    ),
  }),
});