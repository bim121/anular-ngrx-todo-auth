import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';
import { absoluteUrl } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    (['', '/pricing', '/docs'] as const).map((path) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, absoluteUrl(alt, path)]),
        ),
      },
    })),
  );
}
