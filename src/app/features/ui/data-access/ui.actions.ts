import { createAction, props } from '@ngrx/store';

export const globalErrorRaised = createAction(
  '[UI] Global Error Raised',
  props<{ message: string }>()
);

export const globalErrorCleared = createAction('[UI] Global Error Cleared');
