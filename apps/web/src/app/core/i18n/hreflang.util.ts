import { buildCanonicalUrl } from '@app/core/seo/seo-meta.util';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from './locale.constants';
import { swapLocaleInPath } from './locale.util';

function upsertLink(
  head: HTMLHeadElement,
  selector: string,
  attrs: Record<string, string>
): void {
  let link = head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = head.ownerDocument.createElement('link');
    head.appendChild(link);
  }

  for (const [key, value] of Object.entries(attrs)) {
    link.setAttribute(key, value);
  }
}

export function syncHreflangLinks(head: HTMLHeadElement, path: string): void {
  head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((node) => node.remove());

  for (const locale of SUPPORTED_LOCALES) {
    const href = buildCanonicalUrl(swapLocaleInPath(path, locale));
    upsertLink(head, `link[rel="alternate"][hreflang="${locale}"]`, {
      rel: 'alternate',
      hreflang: locale,
      href,
    });
  }

  const xDefaultHref = buildCanonicalUrl(
    swapLocaleInPath(path, DEFAULT_LOCALE)
  );
  upsertLink(head, 'link[rel="alternate"][hreflang="x-default"]', {
    rel: 'alternate',
    hreflang: 'x-default',
    href: xDefaultHref,
  });
}

export function syncCanonicalLink(head: HTMLHeadElement, canonicalUrl: string): void {
  upsertLink(head, 'link[rel="canonical"]', {
    rel: 'canonical',
    href: canonicalUrl,
  });
}
