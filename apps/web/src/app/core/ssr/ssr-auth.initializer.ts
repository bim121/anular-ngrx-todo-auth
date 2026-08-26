import {
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Store } from '@ngrx/store';
import { restoreAuthFromSession } from '@anular-ngrx/auth-data-access';
import { SsrSessionService } from './ssr-session.service';

/** Restores auth from httpOnly cookie before SSR guards/resolvers run (Phase 7.2.4). */
export function provideSsrAuthRestore() {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformServer(platformId)) {
        return;
      }

      const session = inject(SsrSessionService);
      const store = inject(Store);
      const payload = session.readSessionFromRequest();

      if (payload) {
        store.dispatch(
          restoreAuthFromSession({
            user: payload.user,
            token: payload.token,
          })
        );
      }
    }),
  ]);
}
