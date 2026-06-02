import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, merge, of, shareReplay, startWith } from 'rxjs';
import { getLeafRoutePageData } from '@app/core/routing/route-data.util';
import { RoutePageData } from '@app/core/routing/route-page-data.model';

const APP_NAME = 'Todo App';

@Injectable({ providedIn: 'root' })
export class RoutePageContextService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  /** Current leaf route page metadata (title + breadcrumb). */
  readonly activePage$ = merge(
    of(void 0),
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd))
  ).pipe(
    map(() => getLeafRoutePageData(this.router.routerState.snapshot.root)),
    distinctUntilChanged(
      (a, b) => a?.title === b?.title && a?.breadcrumb === b?.breadcrumb
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.activePage$.subscribe((page) => this.syncDocumentTitle(page));
  }

  private syncDocumentTitle(page: RoutePageData | null): void {
    if (page?.title) {
      this.title.setTitle(`${page.title} | ${APP_NAME}`);
    } else {
      this.title.setTitle(APP_NAME);
    }
  }
}
