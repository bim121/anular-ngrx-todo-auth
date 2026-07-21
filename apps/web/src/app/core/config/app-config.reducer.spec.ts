import { appConfigReducer, initialAppConfigState } from './app-config.reducer';
import * as AppConfigActions from './app-config.actions';

describe('appConfigReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = appConfigReducer(undefined, { type: 'NOOP' } as never);
    expect(state).toEqual(initialAppConfigState);
  });

  it('loadAppConfig: replaces apiBaseUrl and features', () => {
    const config = {
      apiBaseUrl: 'https://api.example.com',
      features: { analytics: true, betaTodos: false },
    };
    const state = appConfigReducer(
      initialAppConfigState,
      AppConfigActions.loadAppConfig({ config }),
    );

    expect(state).toEqual(config);
  });
});
