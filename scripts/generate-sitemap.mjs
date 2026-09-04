#!/usr/bin/env node
/**
 * Phase 7.5.2 — generate sitemap.xml for prerendered public routes.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *   SITE_URL=https://example.com node scripts/generate-sitemap.mjs
 *
 * Writes to apps/web/public/sitemap.xml and, when present, dist/web/browser/sitemap.xml.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = (process.env.SITE_URL ?? 'https://example.com').replace(/\/$/, '');
const locales = ['en', 'ru'];
const prerenderedPaths = ['login', 'register'];

const lastmod = new Date().toISOString().slice(0, 10);

const urlEntries = locales.flatMap((locale) =>
  prerenderedPaths.map((path) => {
    const loc = `${siteUrl}/${locale}/${path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

const targets = [
  join(root, 'apps/web/public/sitemap.xml'),
  join(root, 'dist/web/browser/sitemap.xml'),
];

for (const target of targets) {
  const dir = dirname(target);
  if (target.includes('dist') && !existsSync(dir)) {
    continue;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(target, xml, 'utf8');
  console.log(`Wrote ${target} (${locales.length * prerenderedPaths.length} URLs)`);
}
