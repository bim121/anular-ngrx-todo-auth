import { inject, provideAppInitializer } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { AppConfigState } from './app-config.model';
import * as AppConfigActions from './app-config.actions';

export function loadAppConfig(): Promise<void> {
  const http = inject(HttpClient);
  const store = inject(Store);

  return firstValueFrom(
    http.get<Pick<AppConfigState, 'features'>>('/assets/config.json').pipe(
      tap(({ features }) =>
        store.dispatch(AppConfigActions.loadAppConfig({ features }))
      ),
      catchError(() => {
        store.dispatch(AppConfigActions.loadAppConfig({ features: {} }));
        return of(undefined);
      }),
      map(() => undefined)
    )
  ).then(() => undefined);
}

export function provideAppConfigInitializer() {
  return provideAppInitializer(loadAppConfig);
}
