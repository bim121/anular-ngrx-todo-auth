/**
 * Client-only document meta for analytics-mfe (Phase 7 / V.7.2).
 * Keep robots=noindex so the Vite SPA is not indexed; shell owns SEO when embedded.
 */
export function ensureAnalyticsNoIndex(): void {
  if (typeof document === 'undefined') {
    return;
  }

  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    document.head.appendChild(robots);
  }
  robots.setAttribute('content', 'noindex, nofollow');
}

export function setDocumentTitle(title: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.title = title;
}
