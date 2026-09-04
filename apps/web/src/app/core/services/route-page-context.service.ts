import { DestroyRef, inject, Injectable, DOCUMENT } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, merge, of, shareReplay } from 'rxjs';
import { getLeafRoutePageData } from '@app/core/routing/route-data.util';
import { RoutePageData } from '@app/core/routing/route-page-data.model';
import {
  buildCanonicalUrl,
  buildDocumentTitle,
  buildPageDescription,
} from '@app/core/seo/seo-meta.util';
import {
  buildWebApplicationJsonLd,
  isPublicSeoPath,
  syncJsonLdScript,
} from '@app/core/seo/json-ld.util';
import { localizeRoutePage } from '@app/core/i18n/route-i18n';
import {
  syncCanonicalLink,
  syncHreflangLinks,
} from '@app/core/i18n/hreflang.util';

@Injectable({ providedIn: 'root' })
export class RoutePageContextService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activePageSource$ = merge(
    of(void 0),
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  ).pipe(
    map(() => getLeafRoutePageData(this.router.routerState.snapshot.root)),
    map((page) => (page ? localizeRoutePage(page) : null)),
    distinctUntilChanged(
      (a, b) =>
        a?.title === b?.title &&
        a?.breadcrumb === b?.breadcrumb &&
        a?.description === b?.description,
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Current leaf route page metadata (title + breadcrumb + description). */
  readonly activePage = toSignal(this.activePageSource$, {
    initialValue: null as RoutePageData | null,
  });

  constructor() {
    this.activePageSource$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        const path = this.router.url.split('?')[0] ?? '/';
        this.syncSeoMeta(page, path);
      });
  }

  private syncSeoMeta(page: RoutePageData | null, path: string): void {
    const head = this.document.head;
    if (!head) {
      return;
    }

    const documentTitle = buildDocumentTitle(page);
    const description = buildPageDescription(page);
    const canonicalUrl = buildCanonicalUrl(path);

    this.title.setTitle(documentTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: documentTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: documentTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    syncCanonicalLink(head, canonicalUrl);
    syncHreflangLinks(head, path);
    syncJsonLdScript(
      head,
      isPublicSeoPath(path) ? buildWebApplicationJsonLd() : null,
    );
  }
}
