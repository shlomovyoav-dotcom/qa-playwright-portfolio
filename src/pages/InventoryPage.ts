import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../data/catalog.ts';

export interface ListedItem {
  name: string;
  priceUsd: number;
}

export class InventoryPage {
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.items.first()).toBeVisible();
  }

  addButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  removeButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async addToCart(slug: string): Promise<void> {
    await this.addButton(slug).click();
  }

  async expectCartCount(n: number): Promise<void> {
    if (n === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(n));
  }

  /** Scrape every listed product and its displayed price — what the customer actually sees. */
  async listedItems(): Promise<ListedItem[]> {
    const count = await this.items.count();
    const out: ListedItem[] = [];
    for (let i = 0; i < count; i++) {
      const item = this.items.nth(i);
      const name = (await item.getByTestId('inventory-item-name').innerText()).trim();
      const priceText = (await item.getByTestId('inventory-item-price').innerText()).trim();
      out.push({ name, priceUsd: parsePrice(priceText) });
    }
    return out;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
