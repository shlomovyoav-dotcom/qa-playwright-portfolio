import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectItemNames(names: string[]): Promise<void> {
    await expect(this.items.getByTestId('inventory-item-name')).toHaveText(names);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
