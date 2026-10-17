import { test, expect } from '../../src/fixtures.ts';
import { shipping } from '../../src/data/users.ts';
import { bySlug, money, TAX_RATE } from '../../src/data/catalog.ts';

const BACKPACK = 'sauce-labs-backpack';
const LIGHT = 'sauce-labs-bike-light';

test.describe('Checkout money path', () => {
  test('two items: cart names, subtotal, tax and total match the catalog', async ({
    loggedIn,
    cartPage,
    checkoutPage,
  }) => {
    const expectedSubtotal = money(bySlug(BACKPACK).priceUsd + bySlug(LIGHT).priceUsd);
    const expectedTax = money(expectedSubtotal * TAX_RATE);
    const expectedTotal = money(expectedSubtotal + expectedTax);

    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(LIGHT);
    await loggedIn.expectCartCount(2);
    await loggedIn.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItemNames([bySlug(BACKPACK).name, bySlug(LIGHT).name]);
    await cartPage.checkout();

    await checkoutPage.fillShipping(shipping);
    const totals = await checkoutPage.totals();

    expect(totals.itemTotal).toBe(expectedSubtotal);
    expect(totals.tax).toBe(expectedTax);
    expect(totals.total).toBe(expectedTotal);

    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test('checkout with a blank first name stays on the form', async ({
    loggedIn,
    cartPage,
    checkoutPage,
  }) => {
    await loggedIn.addToCart(BACKPACK);
    await loggedIn.openCart();
    await cartPage.checkout();
    await checkoutPage.fillShipping({ firstName: '', lastName: 'QA', postalCode: '6100000' });
    await expect(checkoutPage.error).toContainText(/first name is required/i);
  });
});
