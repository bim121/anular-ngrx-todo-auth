import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { GlobalErrorHandler } from '@app/core/services/global-error.handler';
import { provideRouter, withPreloading } from '@angular/router';
import { TodosPreloadStrategy } from '@app/core/routing/todos-preload.strategy';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@app/core/interceptors/auth.interceptor';
import { authReducer, authFeatureKey } from '@app/features/auth/data-access/auth.reducer';
import { todosReducer, todosFeatureKey } from '@app/features/todos/data-access/todo.reducer';
import { AuthEffects } from '@app/features/auth/data-access/auth.effects';
import { TodoEffects } from '@app/features/todos/data-access/todo.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(TodosPreloadStrategy)),
    provideClientHydration(withEventReplay()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideStore(),
    provideState(authFeatureKey, authReducer),
    provideState(todosFeatureKey, todosReducer),
    provideEffects(AuthEffects, TodoEffects),
    provideRouterStore(),
    ...(isDevMode()
      ? [provideStoreDevtools({ maxAge: 25 })]
      : []),
  ],
};
