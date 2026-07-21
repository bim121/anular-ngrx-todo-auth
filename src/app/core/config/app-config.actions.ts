import { createAction, props } from '@ngrx/store';
import { AppConfigState } from './app-config.model';

export const loadAppConfig = createAction(
  '[App Config] Load Success',
  props<{ config: AppConfigState }>()
);
