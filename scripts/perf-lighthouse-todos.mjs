/**
 * Lighthouse on /todos with pre-hydrated auth localStorage.
 * Usage: node scripts/perf-lighthouse-todos.mjs <localstorage.json> <output-stem> [baseUrl]
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'docs', 'perf');
mkdirSync(outDir, { recursive: true });

const storagePath = process.argv[2];
const outputStem = process.argv[3] ?? 'lh-todos';
const baseUrl = (process.argv[4] ?? 'http://localhost:4173').replace(/\/$/, '');

if (!storagePath) {
  console.error('Usage: node scripts/perf-lighthouse-todos.mjs <localstorage.json> <stem>');
  process.exit(1);
}

const storage = JSON.parse(readFileSync(storagePath, 'utf8'));

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--remote-debugging-port=9222', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((data) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, value);
    }
  }, storage);

  const result = await lighthouse(
    `${baseUrl}/todos`,
    {
      port: 9222,
      output: ['json', 'html'],
      onlyCategories: ['performance'],
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 },
    },
    undefined
  );

  const { writeFileSync } = await import('node:fs');
  writeFileSync(join(outDir, `${outputStem}.report.json`), result.report[0]);
  writeFileSync(join(outDir, `${outputStem}.report.html`), result.report[1]);

  const lhr = result.lhr;
  const audits = lhr.audits;
  const summary = {
    score: lhr.categories.performance.score,
    LCP: audits['largest-contentful-paint']?.displayValue,
    INP: audits['interaction-to-next-paint']?.displayValue ?? null,
    CLS: audits['cumulative-layout-shift']?.displayValue,
    TBT: audits['total-blocking-time']?.displayValue,
    FCP: audits['first-contentful-paint']?.displayValue,
    SI: audits['speed-index']?.displayValue,
  };
  writeFileSync(
    join(outDir, `${outputStem}-summary.json`),
    `${JSON.stringify(summary, null, 2)}\n`
  );
  console.log(JSON.stringify(summary, null, 2));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
