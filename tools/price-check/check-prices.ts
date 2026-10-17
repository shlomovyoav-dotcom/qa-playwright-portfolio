/**
 * Nightly catalog check, public version.
 *
 * Logs into the demo store, reads every listed name + price, diffs against
 * src/data/catalog.ts (the stand-in for a billing catalog of record), writes
 * tools/price-check/report.json, exits 1 on any mismatch.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { catalog, parsePrice } from '../../src/data/catalog.ts';
import { PASSWORD, users } from '../../src/data/users.ts';

const here = dirname(fileURLToPath(import.meta.url));
const reportPath = join(here, 'report.json');

interface Row {
  name: string;
  catalogUsd: number | null;
  pageUsd: number | null;
  ok: boolean;
}

const run = async (): Promise<number> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Sauce Demo hooks are data-test="…", not data-testid. The test runner sets this
  // via playwright.config.ts; this script is outside the runner.
  const by = (id: string) => page.locator(`[data-test="${id}"]`);
  await page.goto('https://www.saucedemo.com/');
  await by('username').fill(users.standard);
  await by('password').fill(PASSWORD);
  await by('login-button').click();
  await by('inventory-item').first().waitFor();

  const listed = await by('inventory-item').evaluateAll((nodes) =>
    nodes.map((node) => {
      const name = node.querySelector('[data-test="inventory-item-name"]')?.textContent?.trim() ?? '';
      const price = node.querySelector('[data-test="inventory-item-price"]')?.textContent?.trim() ?? '';
      return { name, price };
    }),
  );
  await browser.close();

  const pageByName = new Map(
    listed.map((row) => [row.name, parsePrice(row.price)]),
  );

  const rows: Row[] = catalog.map((item) => {
    const pageUsd = pageByName.get(item.name) ?? null;
    return {
      name: item.name,
      catalogUsd: item.priceUsd,
      pageUsd,
      ok: pageUsd === item.priceUsd,
    };
  });

  for (const [name, pageUsd] of pageByName) {
    if (!catalog.some((item) => item.name === name)) {
      rows.push({ name, catalogUsd: null, pageUsd, ok: false });
    }
  }

  const mismatches = rows.filter((row) => !row.ok);
  const report = {
    checkedAt: new Date().toISOString(),
    store: 'https://www.saucedemo.com',
    catalogCount: catalog.length,
    pageCount: listed.length,
    mismatchCount: mismatches.length,
    rows,
  };
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  if (mismatches.length) {
    console.error(`Price check failed: ${mismatches.length} mismatch(es)`);
    for (const row of mismatches) {
      console.error(`  ${row.name}: catalog=${row.catalogUsd} page=${row.pageUsd}`);
    }
    return 1;
  }
  console.log(`Price check ok: ${rows.length} items match the catalog.`);
  return 0;
};

process.exit(await run());
