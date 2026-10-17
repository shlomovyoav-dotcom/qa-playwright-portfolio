/**
 * Catalog of record for the demo store — the equivalent of the billing system's price book.
 * The nightly price check and the checkout math tests both read from here, so a price drift on
 * the page is caught as a mismatch against this list, not against a hard-coded string in a test.
 */
export interface CatalogItem {
  slug: string;
  name: string;
  priceUsd: number;
}

export const catalog: CatalogItem[] = [
  { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', priceUsd: 29.99 },
  { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', priceUsd: 9.99 },
  { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', priceUsd: 15.99 },
  { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', priceUsd: 49.99 },
  { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', priceUsd: 7.99 },
  { slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', priceUsd: 15.99 },
];

/** Sales tax applied by the demo checkout. Kept here so the expected total is computed, not copied. */
export const TAX_RATE = 0.08;

export const money = (n: number): number => Math.round(n * 100) / 100;

/** Parse a displayed price like "$29.99" into a number. */
export const parsePrice = (text: string): number => {
  const m = text.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) throw new Error(`Could not parse price from "${text}"`);
  return Number(m[1]);
};

export const bySlug = (slug: string): CatalogItem => {
  const item = catalog.find((c) => c.slug === slug);
  if (!item) throw new Error(`Unknown catalog slug: ${slug}`);
  return item;
};
