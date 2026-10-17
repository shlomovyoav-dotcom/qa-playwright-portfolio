import { test, expect } from '../../src/fixtures.ts';
import { users, PASSWORD } from '../../src/data/users.ts';

test.describe('Login', () => {
  test('standard user reaches the inventory', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard);
    await inventoryPage.expectLoaded();
  });

  test('locked-out user sees the lock message and stays on the login page', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut, PASSWORD);
    await loginPage.expectError(/sorry, this user has been locked out/i);
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  test('empty credentials show a validation error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await loginPage.expectError(/username is required/i);
  });
});
