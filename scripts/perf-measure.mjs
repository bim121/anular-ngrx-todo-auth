/**
 * Perf baseline helper: login → /todos → screenshot + list render timing.
 * Usage: node scripts/perf-measure.mjs [label] [baseUrl]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'docs', 'perf');
mkdirSync(outDir, { recursive: true });

const label = process.argv[2] ?? 'run';
const baseUrl = (process.argv[3] ?? 'http://localhost:4173').replace(/\/$/, '');

const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const metrics = {
    label,
    baseUrl,
    measuredAt: new Date().toISOString(),
  };

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.screenshot({
    path: join(outDir, `${label}-login.png`),
    fullPage: true,
  });

  const email = await page.$('#email, input[type="email"]');
  const password = await page.$('#password, input[type="password"]');
  if (!email || !password) {
    throw new Error('Login form inputs not found');
  }

  await email.click({ clickCount: 3 });
  await email.type(EMAIL, { delay: 5 });
  await password.click({ clickCount: 3 });
  await password.type(PASSWORD, { delay: 5 });

  const submit = await page.$('button[type="submit"]');
  if (!submit) {
    throw new Error('Login submit button not found');
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60_000 }),
    submit.click(),
  ]);

  if (!page.url().includes('/todos')) {
    await page.goto(`${baseUrl}/todos`, {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    });
  }

  await page.waitForSelector('.todo-count', { timeout: 60_000 });

  // Cold-ish reload: time from todos API response → DOM list ready.
  let todosApiEnd = null;
  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (url.includes('/todos') && response.request().method() === 'GET') {
        todosApiEnd = Date.now();
      }
    } catch {
      // ignore
    }
  });

  const navStart = Date.now();
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });

  await page.waitForFunction(
    () => {
      const labelText = document.querySelector('.todo-count')?.textContent ?? '';
      const match = labelText.match(/(\d+)\s+items/);
      const count = match ? Number(match[1]) : 0;
      const items = document.querySelectorAll('app-todo-item').length;
      return count > 0 && items > 0;
    },
    { timeout: 120_000 }
  );
  const listReadyAt = Date.now();

  const paint = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const nav = performance.getEntriesByType('navigation')[0];
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const resources = performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('/todos'))
      .map((e) => ({
        name: e.name,
        duration: e.duration,
        responseEnd: e.responseEnd,
      }));
    return {
      fcp: entries.find((e) => e.name === 'first-contentful-paint')?.startTime ?? null,
      lcp: lcpEntries.at(-1)?.startTime ?? null,
      domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
      loadEventEnd: nav?.loadEventEnd ?? null,
      todoItemCount: document.querySelectorAll('app-todo-item').length,
      todoCountLabel: document.querySelector('.todo-count')?.textContent ?? null,
      todoResources: resources,
      longTasks: performance.getEntriesByType('longtask').map((e) => ({
        startTime: e.startTime,
        duration: e.duration,
      })),
    };
  });

  metrics.listReadyWallMs = listReadyAt - navStart;
  metrics.apiToDomMs =
    todosApiEnd != null ? Math.max(0, listReadyAt - todosApiEnd) : null;
  metrics.todosApiEndOffsetMs =
    todosApiEnd != null ? todosApiEnd - navStart : null;
  metrics.paint = paint;

  await page.screenshot({
    path: join(outDir, `${label}-todos.png`),
    fullPage: false,
  });
  await page.screenshot({
    path: join(outDir, `${label}-todos-full.png`),
    fullPage: true,
  });

  await page.evaluate(async () => {
    for (let i = 0; i < 12; i++) {
      window.scrollBy(0, 800);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });

  await page.screenshot({
    path: join(outDir, `${label}-todos-after-scroll.png`),
    fullPage: false,
  });

  // Capture storage for authenticated Lighthouse runs.
  const storage = await page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) out[key] = localStorage.getItem(key);
    }
    return out;
  });
  writeFileSync(
    join(outDir, `${label}-localstorage.json`),
    `${JSON.stringify(storage, null, 2)}\n`,
    'utf8'
  );

  const jsonPath = join(outDir, `${label}-metrics.json`);
  writeFileSync(jsonPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(metrics, null, 2));
  console.log(`Wrote ${jsonPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
