import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, merge, of, shareReplay } from 'rxjs';
import { getLeafRoutePageData } from '@app/core/routing/route-data.util';
import { RoutePageData } from '@app/core/routing/route-page-data.model';

const APP_NAME = 'Todo App';

@Injectable({ providedIn: 'root' })
export class RoutePageContextService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  private readonly activePageSource$ = merge(
    of(void 0),
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  ).pipe(
    map(() => getLeafRoutePageData(this.router.routerState.snapshot.root)),
    distinctUntilChanged((a, b) => a?.title === b?.title && a?.breadcrumb === b?.breadcrumb),
    // Shared by toSignal + title effect; refCount avoids a forever-hot router sub.
    // See docs/memoization.md §5.4.3.
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Current leaf route page metadata (title + breadcrumb). */
  readonly activePage = toSignal(this.activePageSource$, {
    initialValue: null as RoutePageData | null,
  });

  constructor() {
    effect(() => {
      this.syncDocumentTitle(this.activePage());
    });
  }

  private syncDocumentTitle(page: RoutePageData | null): void {
    if (page?.title) {
      this.title.setTitle(`${page.title} | ${APP_NAME}`);
    } else {
      this.title.setTitle(APP_NAME);
    }
  }
}
