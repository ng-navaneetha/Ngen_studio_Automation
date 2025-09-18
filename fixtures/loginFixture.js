import { test as base } from '@playwright/test';
import { expect } from '@playwright/test';
import { loginUrl } from '../constants/login';

 const test = base.extend({
  login: async ({ page }, use) => {
    await use(async (email, password) => {
      await page.goto(loginUrl);
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForSelector('#login-email');
      await page.locator('#login-email').fill(email);
      await page.locator('#login-password').fill(password);
      await page.locator('#btn-login').click();
      await page.waitForLoadState('networkidle'); // Optional: wait for page to settle
    });
  },
});

export { test, expect };

