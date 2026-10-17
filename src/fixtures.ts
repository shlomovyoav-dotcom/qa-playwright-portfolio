import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.ts';
import { InventoryPage } from './pages/InventoryPage.ts';
import { CartPage } from './pages/CartPage.ts';
import { CheckoutPage } from './pages/CheckoutPage.ts';
import { users, type UserKey } from './data/users.ts';

interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Which demo persona `loggedIn` signs in as. Override per test with `test.use({ persona: 'problem' })`. */
  persona: UserKey;
  /** An InventoryPage already signed in as `persona`. */
  loggedIn: InventoryPage;
}

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  persona: ['standard', { option: true }],
  loggedIn: async ({ loginPage, inventoryPage, persona }, use) => {
    await loginPage.goto();
    await loginPage.login(users[persona]);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
