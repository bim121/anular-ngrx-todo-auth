import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/** Route `data` key: preload this lazy bundle after app bootstrap. */
export const PRELOAD_ROUTE_KEY = 'preload' as const;

/**
 * Preloads only routes marked with `data: { preload: true }`.
 * Auth chunks stay on-demand; todos feature loads in the background (typical post-login path).
 */
@Injectable({ providedIn: 'root' })
export class TodosPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.[PRELOAD_ROUTE_KEY] === true) {
      return load();
    }
    return of(null);
  }
}
