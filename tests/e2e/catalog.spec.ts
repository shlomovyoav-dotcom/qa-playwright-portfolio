import { test, expect } from '../../src/fixtures.ts';
import { catalog } from '../../src/data/catalog.ts';

test.describe('Catalog of record vs storefront', () => {
  test('every listed name and price matches the catalog', async ({ loggedIn }) => {
    const listed = await loggedIn.listedItems();
    const listedByName = new Map(listed.map((item) => [item.name, item.priceUsd]));

    expect(listed).toHaveLength(catalog.length);

    for (const item of catalog) {
      expect(listedByName.get(item.name), `missing or wrong price for ${item.name}`).toBe(
        item.priceUsd,
      );
    }
  });
});
