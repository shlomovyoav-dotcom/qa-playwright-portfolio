import { expect, type Locator, type Page } from '@playwright/test';
import { PASSWORD } from '../data/users.ts';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string = PASSWORD): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toContainText(message);
  }
}
