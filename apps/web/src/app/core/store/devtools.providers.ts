import { EnvironmentProviders } from '@angular/core';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { devtoolsConfig } from './devtools-config';

/** Dev-only — production build replaces this file with an empty stub. */
export function provideAppDevtools(): EnvironmentProviders[] {
  return [provideStoreDevtools(devtoolsConfig)];
}
