import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import {
  readSessionFromCookieHeader,
  type SsrSessionPayload,
} from './ssr-session.codec';

@Injectable({ providedIn: 'root' })
export class SsrSessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });

  readSessionFromRequest(): SsrSessionPayload | null {
    if (!isPlatformServer(this.platformId) || !this.request) {
      return null;
    }

    return readSessionFromCookieHeader(this.request.headers.get('cookie'));
  }

  getUserIdFromRequest(): string | null {
    return this.readSessionFromRequest()?.user.id ?? null;
  }
}
