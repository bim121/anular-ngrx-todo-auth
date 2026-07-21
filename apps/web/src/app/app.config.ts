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
import { devtoolsConfig } from '@app/core/store/devtools-config';
import { appConfigReducer, appConfigFeatureKey } from '@app/core/config/app-config.reducer';
import { provideAppConfigInitializer } from '@app/core/config/app-config.initializer';
import { httpInterceptorChain } from '@app/core/interceptors/http-interceptor.chain';
import { authFeature } from '@anular-ngrx/auth-data-access';
import { todosReducer, todosFeatureKey } from '@anular-ngrx/todos-data-access';
import { provideTodoRepository } from '@anular-ngrx/todos-data-access';
import { provideTodoFilterStrategies } from '@anular-ngrx/todos-data-access';
import { AuthEffects } from '@anular-ngrx/auth-data-access';
import { TodoEffects } from '@anular-ngrx/todos-data-access';
import {
  notificationsReducer,
  notificationsFeatureKey,
} from '@app/features/notifications/data-access/notification.reducer';
import { NotificationEffects } from '@app/features/notifications/data-access/notification.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors(httpInterceptorChain())),
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
      },
    ),
    provideState(authFeature.name, authFeature.reducer),
    provideState(todosFeatureKey, todosReducer),
    provideState(notificationsFeatureKey, notificationsReducer),
    provideState(appConfigFeatureKey, appConfigReducer),
    provideState('router', routerReducer),
    provideAppConfigInitializer(),
    provideTodoRepository(),
    provideTodoFilterStrategies(),
    provideEffects(AuthEffects, TodoEffects, NotificationEffects),
    provideRouterStore({ serializer: CustomRouterSerializer }),
    ...(isDevMode() ? [provideStoreDevtools(devtoolsConfig)] : []),
  ],
};
