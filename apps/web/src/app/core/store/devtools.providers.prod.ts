import { EnvironmentProviders } from '@angular/core';

/** Production stub — no @ngrx/store-devtools in the initial bundle. */
export function provideAppDevtools(): EnvironmentProviders[] {
  return [];
}
