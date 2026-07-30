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
import { provideClientHydration } from '@angular/platform-browser';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '@app/core/routing/custom-router.serializer';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { metaReducers } from '@app/core/store/store.meta-reducers';
import { provideAppDevtools } from '@app/core/store/devtools.providers';
import { appConfigReducer, appConfigFeatureKey } from '@app/core/config/app-config.reducer';
import { provideAppConfigInitializer } from '@app/core/config/app-config.initializer';
import { httpInterceptorChain } from '@app/core/interceptors/http-interceptor.chain';
import { AuthEffects, authFeature } from '@anular-ngrx/auth-data-access';
import { HttpCacheEffects } from '@app/core/http/http-cache.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors(httpInterceptorChain())),
    provideRouter(routes, withPreloading(TodosPreloadStrategy)),
    // Hydration without withEventReplay() — see docs/perf/hydration.md (Phase 5.6.2).
    provideClientHydration(),
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
                strictStateSerializability: true,
                strictActionImmutability: true,
                strictActionSerializability: true,
              },
            }
          : {}),
      },
    ),
    provideState(authFeature.name, authFeature.reducer),
    provideState(appConfigFeatureKey, appConfigReducer),
    provideState('router', routerReducer),
    provideAppConfigInitializer(),
    provideEffects(AuthEffects, HttpCacheEffects),
    provideRouterStore({ serializer: CustomRouterSerializer }),
    ...provideAppDevtools(),
  ],
};
