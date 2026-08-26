import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { AuthResponse } from '@anular-ngrx/auth-data-access';
import { SESSION_API_PATH } from './ssr-session.constants';

/**
 * Syncs authenticated session to httpOnly cookie via Express mock (ADR-004).
 * Client still keeps localStorage via NgRx meta-reducer for SPA reloads.
 */
@Injectable({ providedIn: 'root' })
export class SsrSessionSyncService {
  private readonly platformId = inject(PLATFORM_ID);

  syncSession(authResponse: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void fetch(SESSION_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user: authResponse.user,
        token: authResponse.accessToken,
      }),
    }).catch(() => {
      // SSR dev server may be offline during json-server-only workflows.
    });
  }

  clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void fetch(SESSION_API_PATH, {
      method: 'DELETE',
      credentials: 'include',
    }).catch(() => {
      // noop
    });
  }
}
