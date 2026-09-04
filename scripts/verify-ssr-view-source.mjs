#!/usr/bin/env node
/**
 * Phase 7.3–7.5 — smoke-check SSR/prerender HTML + SEO artifacts
 * (run while serve:ssr is up).
 * Usage: node scripts/verify-ssr-view-source.mjs [baseUrl]
 */
const baseUrl = (process.argv[2] ?? 'http://localhost:4000').replace(/\/$/, '');

const checks = [
  {
    path: '/robots.txt',
    name: 'robots.txt',
    assert(body) {
      const failures = [];
      if (!body.includes('User-agent:')) {
        failures.push('missing User-agent');
      }
      if (!body.includes('Allow:') || !/Allow:.*login/i.test(body)) {
        failures.push('missing Allow login');
      }
      if (!body.includes('Disallow:') || !/Disallow:.*todos/i.test(body)) {
        failures.push('missing Disallow todos');
      }
      if (!body.includes('Sitemap:')) {
        failures.push('missing Sitemap directive');
      }
      return failures;
    },
  },
  {
    path: '/sitemap.xml',
    name: 'sitemap.xml',
    assert(body) {
      const failures = [];
      if (!body.includes('<urlset')) {
        failures.push('missing urlset');
      }
      for (const path of ['/en/login', '/ru/login', '/en/register', '/ru/register']) {
        if (!body.includes(path)) {
          failures.push(`missing ${path}`);
        }
      }
      return failures;
    },
  },
  {
    path: '/en/login',
    name: 'en login prerender',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      if (!/Login|Sign in/i.test(html)) {
        failures.push('missing login copy');
      }
      if (!html.includes('property="og:title"')) {
        failures.push('missing og:title meta');
      }
      if (!html.includes('rel="canonical"')) {
        failures.push('missing canonical link');
      }
      if (!html.includes('hreflang="en"')) {
        failures.push('missing hreflang=en');
      }
      if (!html.includes('hreflang="ru"')) {
        failures.push('missing hreflang=ru');
      }
      if (!html.includes('application/ld+json') || !html.includes('WebApplication')) {
        failures.push('missing JSON-LD WebApplication');
      }
      return failures;
    },
  },
  {
    path: '/ru/login',
    name: 'ru login prerender',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      if (!/Вход|Login/i.test(html)) {
        failures.push('missing login copy');
      }
      if (!html.includes('application/ld+json')) {
        failures.push('missing JSON-LD');
      }
      return failures;
    },
  },
  {
    path: '/en/register',
    name: 'en register prerender',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      if (!/Create Account|register/i.test(html)) {
        failures.push('missing register copy');
      }
      if (!html.includes('WebApplication')) {
        failures.push('missing JSON-LD WebApplication');
      }
      return failures;
    },
  },
  {
    path: '/en/todos',
    name: 'todos SSR shell',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      if (html.length < 200) {
        failures.push('response too small');
      }
      return failures;
    },
  },
];

let failed = 0;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, { redirect: 'manual' });
    const html = await response.text();
    const issues = check.assert(html);

    if (issues.length === 0) {
      console.log(`✓ ${check.name} (${response.status}) ${url}`);
    } else {
      failed += 1;
      console.error(`✗ ${check.name} (${response.status}) ${url}`);
      for (const issue of issues) {
        console.error(`  - ${issue}`);
      }
    }
  } catch (error) {
    failed += 1;
    console.error(`✗ ${check.name} ${url}`);
    console.error(`  - ${error instanceof Error ? error.message : error}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. Is the SSR server running? npm run serve:ssr`);
  process.exit(1);
}

console.log('\nAll view-source smoke checks passed.');