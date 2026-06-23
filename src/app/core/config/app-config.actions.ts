import { createAction, props } from '@ngrx/store';

export const loadAppConfig = createAction(
  '[App Config] Load Success',
  props<{ features: Record<string, boolean> }>()
);
