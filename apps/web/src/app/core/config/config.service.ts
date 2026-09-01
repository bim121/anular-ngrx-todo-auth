import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { AppConfigFile, AppConfigState, DEFAULT_APP_CONFIG } from './app-config.model';
import * as AppConfigActions from './app-config.actions';
import { selectApiBaseUrl, selectFeatures } from './app-config.selectors';

const APP_CONFIG_URL = '/assets/app-config.json';

/**
 * Loads runtime config (feature flags, api base url) and exposes store queries.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly platformId = inject(PLATFORM_ID);

  readonly apiBaseUrl = toSignal(this.store.select(selectApiBaseUrl), {
    initialValue: DEFAULT_APP_CONFIG.apiBaseUrl,
  });
  readonly features = toSignal(this.store.select(selectFeatures), {
    initialValue: DEFAULT_APP_CONFIG.features,
  });

  load(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      this.store.dispatch(
        AppConfigActions.loadAppConfig({ config: { ...DEFAULT_APP_CONFIG } }),
      );
      return Promise.resolve();
    }

    return firstValueFrom(
      this.http.get<AppConfigFile>(APP_CONFIG_URL).pipe(
        tap((file) => {
          const config: AppConfigState = {
            apiBaseUrl: file.apiBaseUrl ?? DEFAULT_APP_CONFIG.apiBaseUrl,
            features: file.features ?? {},
          };
          this.store.dispatch(AppConfigActions.loadAppConfig({ config }));
        }),
        catchError(() => {
          this.store.dispatch(
            AppConfigActions.loadAppConfig({ config: { ...DEFAULT_APP_CONFIG } }),
          );
          return of(undefined);
        }),
        map(() => undefined),
      ),
    ).then(() => undefined);
  }

  isFeatureEnabled(feature: string): boolean {
    return this.features()[feature] ?? false;
  }
}
