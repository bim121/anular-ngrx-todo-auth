import { selectIsFeatureEnabled, selectFeatures } from './app-config.selectors';
import { appConfigFeatureKey } from './app-config.reducer';

describe('appConfig selectors', () => {
  const buildRootState = (features: Record<string, boolean>) => ({
    [appConfigFeatureKey]: { features },
  });

  it('selectFeatures returns feature map', () => {
    const features = { analytics: true, betaTodos: false };
    expect(selectFeatures(buildRootState(features))).toEqual(features);
  });

  it('selectIsFeatureEnabled returns false for missing keys', () => {
    expect(
      selectIsFeatureEnabled('unknown')(buildRootState({ analytics: true }))
    ).toBe(false);
  });

  it('selectIsFeatureEnabled returns configured value', () => {
    expect(
      selectIsFeatureEnabled('analytics')(
        buildRootState({ analytics: true, betaTodos: false })
      )
    ).toBe(true);
  });
});
