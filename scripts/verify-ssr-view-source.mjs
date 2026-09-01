#!/usr/bin/env node
/**
 * Phase 7.3.2 — smoke-check SSR/prerender HTML (run while serve:ssr is up).
 * Usage: node scripts/verify-ssr-view-source.mjs [baseUrl]
 */
const baseUrl = (process.argv[2] ?? 'http://localhost:4000').replace(/\/$/, '');

const checks = [
  {
    path: '/login',
    name: 'login prerender',
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
      return failures;
    },
  },
  {
    path: '/register',
    name: 'register prerender',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      if (!/Create Account|register/i.test(html)) {
        failures.push('missing register copy');
      }
      return failures;
    },
  },
  {
    path: '/todos',
    name: 'todos SSR shell',
    assert(html) {
      const failures = [];
      if (!html.includes('<app-root')) {
        failures.push('missing <app-root>');
      }
      // Unauthenticated users may get redirect HTML or login shell — still SSR output.
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
