import { createReducer, on } from '@ngrx/store';
import { AppConfigState, DEFAULT_APP_CONFIG } from './app-config.model';
import * as AppConfigActions from './app-config.actions';

export const appConfigFeatureKey = 'appConfig';

export const initialAppConfigState: AppConfigState = { ...DEFAULT_APP_CONFIG };

export const appConfigReducer = createReducer(
  initialAppConfigState,

  on(AppConfigActions.loadAppConfig, (_state, { config }) => ({ ...config }))
);
