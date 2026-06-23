import {
  appConfigReducer,
  initialAppConfigState,
} from './app-config.reducer';
import * as AppConfigActions from './app-config.actions';

describe('appConfigReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = appConfigReducer(undefined, { type: 'NOOP' } as never);
    expect(state).toEqual(initialAppConfigState);
  });

  it('loadAppConfig: replaces features map', () => {
    const features = { analytics: true, betaTodos: false };
    const state = appConfigReducer(
      initialAppConfigState,
      AppConfigActions.loadAppConfig({ features })
    );

    expect(state.features).toEqual(features);
  });
});
