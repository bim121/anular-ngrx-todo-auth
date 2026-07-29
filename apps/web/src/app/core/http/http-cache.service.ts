import { Injectable } from '@angular/core';

export interface HttpCacheEntry {
  data: unknown;
  /** Fresh until this timestamp (Date.now()). */
  expiry: number;
}

/** Default TTL for cacheable GET responses (Phase 5.5.1). */
export const HTTP_CACHE_TTL_MS = 30_000;

/**
 * In-memory HTTP response cache for GET todos (and tests).
 * Invalidated on todo mutations via the cache interceptor.
 */
@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private readonly entries = new Map<string, HttpCacheEntry>();

  get(key: string): HttpCacheEntry | undefined {
    return this.entries.get(key);
  }

  set(key: string, data: unknown, ttlMs = HTTP_CACHE_TTL_MS): void {
    this.entries.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  isFresh(entry: HttpCacheEntry, now = Date.now()): boolean {
    return now < entry.expiry;
  }

  /** Drop all cached todo collection GETs (and related todo URLs). */
  invalidateTodos(): void {
    for (const key of [...this.entries.keys()]) {
      if (key.includes('/todos')) {
        this.entries.delete(key);
      }
    }
  }

  clear(): void {
    this.entries.clear();
  }

  /** @internal test helper */
  size(): number {
    return this.entries.size;
  }
}

/** Collection list GET — e.g. `http://localhost:3000/todos?userId=…` */
export function isTodoCollectionUrl(url: string): boolean {
  try {
    const path = new URL(url, 'http://local').pathname;
    return path.endsWith('/todos') || path === '/todos';
  } catch {
    return /\/todos(\?|$)/.test(url) && !/\/todos\/[^/?]+/.test(url);
  }
}

export function isTodoApiUrl(url: string): boolean {
  return url.includes('/todos');
}

export function cacheKeyForRequest(method: string, url: string): string {
  return `${method}:${url}`;
}
