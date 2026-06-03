import { uiReducer, initialUiState } from './ui.reducer';
import * as UiActions from './ui.actions';

describe('uiReducer', () => {
  it('globalErrorRaised stores message and timestamp', () => {
    const state = uiReducer(
      initialUiState,
      UiActions.globalErrorRaised({ message: 'Oops' })
    );

    expect(state.error).toBe('Oops');
    expect(state.errorRaisedAt).toBeTypeOf('number');
  });

  it('globalErrorCleared resets state', () => {
    const withError = uiReducer(
      initialUiState,
      UiActions.globalErrorRaised({ message: 'Oops' })
    );
    const state = uiReducer(withError, UiActions.globalErrorCleared());

    expect(state).toEqual(initialUiState);
  });
});
