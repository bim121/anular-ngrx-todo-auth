import { createReducer, on } from '@ngrx/store';
import { AppConfigState } from './app-config.model';
import * as AppConfigActions from './app-config.actions';

export const appConfigFeatureKey = 'appConfig';

export const initialAppConfigState: AppConfigState = {
  features: {},
};

export const appConfigReducer = createReducer(
  initialAppConfigState,

  on(AppConfigActions.loadAppConfig, (_state, { features }) => ({
    features,
  }))
);
