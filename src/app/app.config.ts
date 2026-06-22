import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { GlobalErrorHandler } from '@app/core/services/global-error.handler';
import { provideRouter, withPreloading } from '@angular/router';
import { TodosPreloadStrategy } from '@app/core/routing/todos-preload.strategy';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '@app/core/routing/custom-router.serializer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { metaReducers } from '@app/core/store/store.meta-reducers';
import { authInterceptor } from '@app/core/interceptors/auth.interceptor';
import { authFeature } from '@app/features/auth/data-access/auth.feature';
import { todosReducer, todosFeatureKey } from '@app/features/todos/data-access/todo.reducer';
import { AuthEffects } from '@app/features/auth/data-access/auth.effects';
import { TodoEffects } from '@app/features/todos/data-access/todo.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(TodosPreloadStrategy)),
    provideClientHydration(withEventReplay()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideStore(
      {},
      {
        metaReducers,
        ...(isDevMode()
          ? {
              runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true,
              },
            }
          : {}),
      }
    ),
    provideState(authFeature.name, authFeature.reducer),
    provideState(todosFeatureKey, todosReducer),
    provideState('router', routerReducer),
    provideEffects(AuthEffects, TodoEffects),
    provideRouterStore({ serializer: CustomRouterSerializer }),
    ...(isDevMode()
      ? [provideStoreDevtools({ maxAge: 25 })]
      : []),
  ],
};
