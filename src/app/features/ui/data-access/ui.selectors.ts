import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.model';
import { uiFeatureKey } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>(uiFeatureKey);

export const selectGlobalError = createSelector(
  selectUiState,
  (state) => state?.error ?? null
);

export const selectHasGlobalError = createSelector(
  selectGlobalError,
  (error) => error != null && error.length > 0
);
