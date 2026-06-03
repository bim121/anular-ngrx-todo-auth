import { ErrorHandler, inject, Injectable, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { globalErrorRaised } from '@app/features/ui/data-access/ui.actions';

/** NgRx handles its own effect/reducer errors via `catchError` — do not route those here. */
export function isNgRxRuntimeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const stack = error.stack ?? '';
  const fromNgRx =
    stack.includes('@ngrx/') || stack.includes('node_modules/@ngrx');

  const ngRxEffectNotification = error.name === 'EffectNotification';

  return fromNgRx || ngRxEffectNotification;
}

export function toUserFacingMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly store = inject(Store);

  handleError(error: unknown): void {
    if (isNgRxRuntimeError(error)) {
      throw error;
    }

    const message = toUserFacingMessage(error);

    if (isDevMode()) {
      console.error('[GlobalErrorHandler]', error);
    }

    this.store.dispatch(globalErrorRaised({ message }));
  }
}
