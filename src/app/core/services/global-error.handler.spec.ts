import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { globalErrorRaised } from '@app/features/ui/data-access/ui.actions';
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
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
      ],
    });

    handler = TestBed.inject(ErrorHandler) as GlobalErrorHandler;
    store = TestBed.inject(MockStore);
  });

  it('dispatches globalErrorRaised for unhandled app errors', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    handler.handleError(new Error('Something broke'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      globalErrorRaised({ message: 'Something broke' })
    );
  });

  it('rethrows NgRx runtime errors without dispatching', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const ngrxErr = new Error('NgRx effect');
    ngrxErr.stack = 'at x (node_modules/@ngrx/effects/effects.mjs:10:1)';

    expect(() => handler.handleError(ngrxErr)).toThrow(ngrxErr);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
