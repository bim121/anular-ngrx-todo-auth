import {
  selectApiBaseUrl,
  selectIsFeatureEnabled,
  selectFeatures,
} from './app-config.selectors';
import { appConfigFeatureKey } from './app-config.reducer';
import { AppConfigState } from './app-config.model';

describe('appConfig selectors', () => {
  const buildRootState = (config: Partial<AppConfigState>) => ({
    [appConfigFeatureKey]: {
      apiBaseUrl: 'http://localhost:3000',
      features: {},
      ...config,
    },
  });

  it('selectFeatures returns feature map', () => {
    const features = { analytics: true, betaTodos: false };
    expect(selectFeatures(buildRootState({ features }))).toEqual(features);
  });

  it('selectApiBaseUrl returns api base url', () => {
    expect(
      selectApiBaseUrl(
        buildRootState({ apiBaseUrl: 'https://api.example.com' })
      )
    ).toBe('https://api.example.com');
  });

  it('selectIsFeatureEnabled returns false for missing keys', () => {
    expect(
      selectIsFeatureEnabled('unknown')(
        buildRootState({ features: { analytics: true } })
      )
    ).toBe(false);
  });

  it('selectIsFeatureEnabled returns configured value', () => {
    expect(
      selectIsFeatureEnabled('analytics')(
        buildRootState({
          features: { analytics: true, betaTodos: false },
        })
      )
    ).toBe(true);
  });
});
