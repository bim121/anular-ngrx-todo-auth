import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppConfigState } from './app-config.model';
import { appConfigFeatureKey } from './app-config.reducer';

export const selectAppConfigState =
  createFeatureSelector<AppConfigState>(appConfigFeatureKey);

export const selectFeatures = createSelector(
  selectAppConfigState,
  (state) => state.features
);

export const selectIsFeatureEnabled = (feature: string) =>
  createSelector(selectFeatures, (features) => features[feature] ?? false);
