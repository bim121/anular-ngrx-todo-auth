import { environment } from '../../../environments/environment';

/** schema.org WebApplication payload for public marketing/auth pages (Phase 7.5.3). */
export function buildWebApplicationJsonLd(): Record<string, string> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: environment.appName,
    url: environment.siteUrl.replace(/\/$/, ''),
    description: environment.defaultDescription,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
  };
}

/** Public indexable routes that should emit JSON-LD. */
export function isPublicSeoPath(path: string): boolean {
  return /\/(login|register)(\/|$|\?)/.test(path) || path === '/login' || path === '/register';
}

export function syncJsonLdScript(
  head: HTMLHeadElement,
  data: Record<string, string> | null,
): void {
  const scriptId = 'app-json-ld';
  const existing = head.querySelector<HTMLScriptElement>(`#${scriptId}`);

  if (!data) {
    existing?.remove();
    return;
  }

  let script = existing;
  if (!script) {
    script = head.ownerDocument.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}
