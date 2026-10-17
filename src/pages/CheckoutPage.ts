import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../data/catalog.ts';

export interface OrderTotals {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
    this.error = page.getByTestId('error');
  }

  async fillShipping(d: { firstName: string; lastName: string; postalCode: string }): Promise<void> {
    await this.firstName.fill(d.firstName);
    await this.lastName.fill(d.lastName);
    await this.postalCode.fill(d.postalCode);
    await this.continueButton.click();
  }

  /** Read the three money lines from the overview step as numbers. */
  async totals(): Promise<OrderTotals> {
    await expect(this.totalLabel).toBeVisible();
    return {
      itemTotal: parsePrice(await this.subtotalLabel.innerText()),
      tax: parsePrice(await this.taxLabel.innerText()),
      total: parsePrice(await this.totalLabel.innerText()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText(/thank you for your order/i);
  }
}
