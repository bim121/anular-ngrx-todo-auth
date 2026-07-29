import { HttpInterceptorFn } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { authInterceptor } from './auth.interceptor';
import { cacheInterceptor } from './cache.interceptor';
import { correlationIdInterceptor } from './correlation-id.interceptor';
import { loggingInterceptor } from './logging.interceptor';
import { retryInterceptor } from './retry.interceptor';

/**
 * Interceptor chain order (outer → inner on request):
 * 1. correlationId
 * 2. auth
 * 3. logging (dev only)
 * 4. cache (GET todos TTL + SWR + inflight dedup)
 * 5. retry (GET only)
 */
export function httpInterceptorChain(): HttpInterceptorFn[] {
  return [
    correlationIdInterceptor,
    authInterceptor,
    ...(isDevMode() ? [loggingInterceptor] : []),
    cacheInterceptor,
    retryInterceptor,
  ];
}
