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
import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { metaReducers } from '@app/core/store/store.meta-reducers';
import { devtoolsConfig } from '@app/core/store/devtools-config';
import { appConfigReducer, appConfigFeatureKey } from '@app/core/config/app-config.reducer';
import { provideAppConfigInitializer } from '@app/core/config/app-config.initializer';
import { httpInterceptorChain } from '@app/core/interceptors/http-interceptor.chain';
import {
  AuthEffects,
  authFeature,
} from '@anular-ngrx/auth-data-access';
import {
  CommentEffects,
  provideCommentRepository,
  provideTodoFilterStrategies,
  provideTodoRepository,
  TodoEffects,
  todosFeatureKey,
  todosReducer,
  commentsFeatureKey,
  commentsReducer,
} from '@anular-ngrx/todos-data-access';
import { provideRealtimeService } from '@app/core/realtime/realtime.providers';
import { RealtimeEffects } from '@app/core/realtime/realtime.effects';
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
    {
      // Pass-through loader so NgOptimizedImage accepts absolute dicebear URLs.
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => config.src,
    },
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
    provideState(commentsFeatureKey, commentsReducer),
    provideState(notificationsFeatureKey, notificationsReducer),
    provideState(appConfigFeatureKey, appConfigReducer),
    provideState('router', routerReducer),
    provideAppConfigInitializer(),
    provideTodoRepository(),
    provideCommentRepository(),
    provideTodoFilterStrategies(),
    provideRealtimeService(),
    provideEffects(
      AuthEffects,
      TodoEffects,
      CommentEffects,
      NotificationEffects,
      RealtimeEffects
    ),
    provideRouterStore({ serializer: CustomRouterSerializer }),
    ...(isDevMode() ? [provideStoreDevtools(devtoolsConfig)] : []),
  ],
};
