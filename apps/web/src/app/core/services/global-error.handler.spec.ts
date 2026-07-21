import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { GlobalErrorService } from '@anular-ngrx/shared-ui';
import {
  GlobalErrorHandler,
  isNgRxRuntimeError,
  toUserFacingMessage,
} from './global-error.handler';

describe('global error helpers', () => {
  it('toUserFacingMessage extracts Error message', () => {
    expect(toUserFacingMessage(new Error('boom'))).toBe('boom');
  });

  it('isNgRxRuntimeError detects @ngrx stack', () => {
    const err = new Error('effect failed');
    err.stack = 'at foo (node_modules/@ngrx/effects/fesm2022/effects.mjs:1:1)';
    expect(isNgRxRuntimeError(err)).toBe(true);
  });

  it('isNgRxRuntimeError returns false for app errors', () => {
    expect(isNgRxRuntimeError(new Error('component blew up'))).toBe(false);
  });
});

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let globalErrors: GlobalErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
    });

    handler = TestBed.inject(ErrorHandler) as GlobalErrorHandler;
    globalErrors = TestBed.inject(GlobalErrorService);
  });

  it('raises a global error for unhandled app errors', async () => {
    handler.handleError(new Error('Something broke'));

    const state = await firstValueFrom(globalErrors.error$);
    expect(state?.message).toBe('Something broke');
  });

  it('rethrows NgRx runtime errors without raising', async () => {
    const ngrxErr = new Error('NgRx effect');
    ngrxErr.stack = 'at x (node_modules/@ngrx/effects/effects.mjs:10:1)';

    expect(() => handler.handleError(ngrxErr)).toThrow(ngrxErr);

    const state = await firstValueFrom(globalErrors.error$);
    expect(state).toBeNull();
  });
});
