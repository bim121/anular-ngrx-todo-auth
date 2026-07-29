import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, concat, finalize, of, shareReplay, tap } from 'rxjs';
import {
  HttpCacheService,
  cacheKeyForRequest,
  isTodoApiUrl,
  isTodoCollectionUrl,
} from '@app/core/http/http-cache.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** In-flight GET dedup (Phase 5.5.3) — shared Observable per cache key. */
const inflightGets = new Map<string, Observable<HttpEvent<unknown>>>();

/**
 * GET `/todos?…` cache with TTL + stale-while-revalidate.
 * Mutations against `/todos` invalidate the cache.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(HttpCacheService);

  if (MUTATION_METHODS.has(req.method) && isTodoApiUrl(req.url)) {
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          cache.invalidateTodos();
        }
      })
    );
  }

  if (req.method !== 'GET' || !isTodoCollectionUrl(req.url)) {
    return next(req);
  }

  const key = cacheKeyForRequest(req.method, req.url);
  const entry = cache.get(key);

  if (entry && cache.isFresh(entry)) {
    return of(cachedResponse(req, entry.data));
  }

  const network$ = shareInflightGet(key, () =>
    next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          cache.set(key, event.body);
        }
      })
    )
  );

  // Stale-while-revalidate: emit cached body immediately, then network refresh.
  if (entry) {
    return concat(of(cachedResponse(req, entry.data)), network$);
  }

  return network$;
};

function cachedResponse(
  req: HttpRequest<unknown>,
  body: unknown
): HttpResponse<unknown> {
  return new HttpResponse({
    body,
    status: 200,
    statusText: 'OK (from cache)',
    url: req.url,
  });
}

function shareInflightGet(
  key: string,
  factory: () => Observable<HttpEvent<unknown>>
): Observable<HttpEvent<unknown>> {
  const existing = inflightGets.get(key);
  if (existing) {
    return existing;
  }

  const shared = factory().pipe(
    finalize(() => {
      inflightGets.delete(key);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  inflightGets.set(key, shared);
  return shared;
}

/** @internal clears inflight map between tests */
export function resetHttpCacheInflightForTests(): void {
  inflightGets.clear();
}
