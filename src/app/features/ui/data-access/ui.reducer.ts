import { createReducer, on } from '@ngrx/store';
import { UiState } from './ui.model';
import * as UiActions from './ui.actions';

export const uiFeatureKey = 'ui';

export const initialUiState: UiState = {
  error: null,
  errorRaisedAt: null,
};

export const uiReducer = createReducer(
  initialUiState,

  on(UiActions.globalErrorRaised, (state, { message }) => ({
    ...state,
    error: message,
    errorRaisedAt: Date.now(),
  })),

  on(UiActions.globalErrorCleared, () => initialUiState)
);
