import { inject, provideAppInitializer } from '@angular/core';
import { ConfigService } from './config.service';

export function loadAppConfig(): Promise<void> {
  return inject(ConfigService).load();
}

export function provideAppConfigInitializer() {
  return provideAppInitializer(loadAppConfig);
}
