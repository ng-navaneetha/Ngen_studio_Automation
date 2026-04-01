/**
 * Regression Testing - Ngen Studio
 *
 * Regression tests guard against previously observed failures and edge-case
 * behaviours re-appearing after code changes. Each test is tagged `@regression`
 * so they can be run as a dedicated suite:
 *
 *   npx playwright test --grep @regression
 *
 * Tests cover:
 *   - Login edge cases (empty fields, invalid formats, whitespace, long inputs)
 *   - Workspace creation validation (required-field errors, cancel flow)
 *   - File upload guards (unsupported type, oversized file)
 *   - UI state management (error messages clear on correction, password masking)
 *   - Navigation consistency (URL matches expected paths after key actions)
 */
import { test, expect } from '../fixtures/loginFixture';
import { test as sessionTest } from '../fixtures/sessionFixture';
import {
  validEmail,
  validPassword,
  invalidEmail,
  invalidPassword,
  loginUrl,
} from '../constants/login';

// ─────────────────────────────────────────────────────────────────────────────
// Login regressions
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Regression - Login Page', () => {
  test.describe.configure({ timeout: 60000 });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-001: Login with empty email and password shows error', async ({ login, page }) => {
    await test.step('Attempt login with both fields empty', async () => {
      await login('', '');
    });

    await test.step('Verify error message is displayed', async () => {
      await expect(page.getByText(/Login failed/i)).toBeVisible({ timeout: 10000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-002: Login with empty email only shows error', async ({ login, page }) => {
    await test.step('Attempt login with empty email', async () => {
      await login('', validPassword);
    });

    await test.step('Verify error is shown', async () => {
      await expect(page.getByText(/Login failed/i)).toBeVisible({ timeout: 10000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-003: Login with empty password only shows error', async ({ login, page }) => {
    await test.step('Attempt login with empty password', async () => {
      await login(validEmail, '');
    });

    await test.step('Verify error is shown', async () => {
      await expect(
        page.getByText('Wrong email or password.')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-004: Login with invalid email format shows error', async ({ login, page }) => {
    await test.step('Attempt login with malformed email address', async () => {
      await login('notanemail', validPassword);
    });

    await test.step('Verify wrong email error is shown', async () => {
      await expect(
        page.getByText('Wrong email or password.')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-005: Login with invalid credentials shows error', async ({ login, page }) => {
    await test.step('Attempt login with valid email but wrong password', async () => {
      await login(validEmail, invalidPassword);
    });

    await test.step('Verify wrong-credentials error is displayed', async () => {
      await expect(
        page.getByText(/wrong email or password|invalid/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test('@regression REG-006: Password field is masked (type="password")', async ({ page }) => {
    await test.step('Open the login dialog', async () => {
      await page.goto(loginUrl);
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForSelector('#login-password');
    });

    await test.step('Verify password input has type="password"', async () => {
      await expect(page.locator('#login-password')).toHaveAttribute('type', 'password', { timeout: 5000 });
    });
  });

  test('@regression REG-007: Email and password inputs have "required" attribute', async ({ page }) => {
    await test.step('Open the login dialog', async () => {
      await page.goto(loginUrl);
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForSelector('#login-email');
    });

    await test.step('Verify email input is required', async () => {
      await expect(page.locator('#login-email')).toHaveAttribute('required', '', { timeout: 5000 });
    });

    await test.step('Verify password input is required', async () => {
      await expect(page.locator('#login-password')).toHaveAttribute('required', '', { timeout: 5000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-008: Error message clears after supplying correct credentials', async ({ login, page }) => {
    await test.step('Trigger error with wrong password', async () => {
      await login(validEmail, invalidPassword);
      await expect(
        page.getByText('Wrong email or password.')
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Correct the password and log in successfully', async () => {
      await page.locator('#login-password').fill(validPassword);
      await page.locator('#btn-login').click();
      await page.waitForSelector("//span[text()='How can I assist you today?']", { timeout: 30000 });
      await expect(page).toHaveURL(/nterprise-search/i, { timeout: 15000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-009: Login with very long email shows error, does not crash', async ({ login, page }) => {
    const longEmail = 'a'.repeat(100) + '@example.com';

    await test.step('Attempt login with a 112-character email', async () => {
      await login(longEmail, validPassword);
    });

    await test.step('Verify an error is displayed (not a 5xx or blank screen)', async () => {
      await expect(
        page.getByText('Wrong email or password.')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // @ts-expect-error: login is a custom fixture
  test('@regression REG-010: Login with special characters in email shows error', async ({ login, page }) => {
    await test.step('Attempt login using special characters as email', async () => {
      await login('!@#$%^&*()', validPassword);
    });

    await test.step('Verify error is shown', async () => {
      await expect(
        page.getByText('Wrong email or password.')
      ).toBeVisible({ timeout: 10000 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Workspace creation regressions
// ─────────────────────────────────────────────────────────────────────────────

sessionTest.describe('Regression - Workspace Creation Validation', () => {
  sessionTest.describe.configure({ timeout: 90000 });

  sessionTest.beforeEach(async ({ page }) => {
    await page.goto(`${loginUrl}/project`, { waitUntil: 'domcontentloaded' });
  });

  sessionTest('@regression REG-011: Creating workspace without required fields shows validation error', async ({ page }) => {
    await sessionTest.step('Open the create-workspace dialog', async () => {
      await page.getByRole('button', { name: 'Create new' }).click();
      await expect(page.getByPlaceholder('Enter workspace name')).toBeVisible();
    });

    await sessionTest.step('Submit without filling any field', async () => {
      await page.getByRole('button', { name: 'Create Workspace' }).click();
    });

    await sessionTest.step('Verify validation error is displayed', async () => {
      await expect(
        page.getByText(/Workplace name, description, department, use case, and access type are required/i)
      ).toBeVisible({ timeout: 10000 });
    });

    await sessionTest.step('Dismiss dialog', async () => {
      await page.getByRole('button', { name: 'Cancel' }).click();
    });
  });

  sessionTest('@regression REG-012: Cancelling create-workspace dialog does not create a workspace', async ({ page }) => {
    const testWorkspaceName = 'Canceled Workspace Should Not Exist';

    await sessionTest.step('Open the create-workspace dialog and fill in a name', async () => {
      await page.getByRole('button', { name: 'Create new' }).click();
      await page.getByPlaceholder('Enter workspace name').fill(testWorkspaceName);
    });

    await sessionTest.step('Click Cancel', async () => {
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByPlaceholder('Enter workspace name')).not.toBeVisible({ timeout: 5000 });
    });

    await sessionTest.step('Verify the workspace was NOT created', async () => {
      await expect(
        page.getByRole('heading', { name: testWorkspaceName })
      ).not.toBeVisible({ timeout: 5000 });
    });
  });

  sessionTest('@regression REG-013: Workspace name input accepts text correctly', async ({ page }) => {
    const sampleName = 'Regression Test Workspace';

    await sessionTest.step('Open create dialog and type workspace name', async () => {
      await page.getByRole('button', { name: 'Create new' }).click();
      await page.getByPlaceholder('Enter workspace name').fill(sampleName);
    });

    await sessionTest.step('Verify typed name is reflected in the input', async () => {
      await expect(page.getByPlaceholder('Enter workspace name')).toHaveValue(sampleName);
    });

    await sessionTest.step('Dismiss dialog', async () => {
      await page.getByRole('button', { name: 'Cancel' }).click();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// File upload regressions (Extract page)
// ─────────────────────────────────────────────────────────────────────────────

sessionTest.describe('Regression - File Upload Validation (Extract)', () => {
  sessionTest.describe.configure({ timeout: 90000 });

  sessionTest.beforeEach(async ({ page }) => {
    await page.goto(`${loginUrl}/project/extract`, { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: 'Analyze Document - Extract' })
    ).toBeVisible({ timeout: 20000 });
  });

  sessionTest('@regression REG-014: Uploading unsupported file type keeps Analyze button disabled', async ({ page }) => {
    await sessionTest.step('Upload an MP3 file (unsupported type)', async () => {
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Click to upload').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('test_data/art_in8.mp3');
    });

    await sessionTest.step('Verify Analyze button remains disabled', async () => {
      await expect(
        page.getByRole('button', { name: 'Analyze Documents' })
      ).toBeDisabled({ timeout: 10000 });
    });
  });

  sessionTest('@regression REG-015: Uploading an oversized file keeps Analyze button disabled', async ({ page }) => {
    await sessionTest.step('Upload a large PDF file (> 50 MB limit)', async () => {
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Click to upload').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('test_data/OCR/large_file.pdf');
    });

    await sessionTest.step('Verify Analyze button remains disabled', async () => {
      await expect(
        page.getByRole('button', { name: 'Analyze Documents' })
      ).toBeDisabled({ timeout: 10000 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Navigation / URL regressions
// ─────────────────────────────────────────────────────────────────────────────

sessionTest.describe('Regression - Navigation and URL Integrity', () => {
  sessionTest.describe.configure({ timeout: 60000 });

  sessionTest('@regression REG-016: /project/extract URL is correct after page load', async ({ page }) => {
    await sessionTest.step('Navigate to extract page', async () => {
      await page.goto(`${loginUrl}/project/extract`, { waitUntil: 'domcontentloaded' });
    });

    await sessionTest.step('Verify URL contains /project/extract', async () => {
      await expect(page).toHaveURL(/\/project\/extract/);
    });
  });

  sessionTest('@regression REG-017: /project/summary URL is correct after page load', async ({ page }) => {
    await sessionTest.step('Navigate to summary page', async () => {
      await page.goto(`${loginUrl}/project/summary`, { waitUntil: 'domcontentloaded' });
    });

    await sessionTest.step('Verify URL contains /project/summary', async () => {
      await expect(page).toHaveURL(/\/project\/summary/);
    });
  });

  sessionTest('@regression REG-018: /project/pulse URL is correct after page load', async ({ page }) => {
    await sessionTest.step('Navigate to pulse page', async () => {
      await page.goto(`${loginUrl}/project/pulse`, { waitUntil: 'domcontentloaded' });
    });

    await sessionTest.step('Verify URL contains /project/pulse', async () => {
      await expect(page).toHaveURL(/\/project\/pulse/);
    });
  });

  sessionTest('@regression REG-019: /project/query URL is correct after page load', async ({ page }) => {
    await sessionTest.step('Navigate to query page', async () => {
      await page.goto(`${loginUrl}/project/query?tab=text2sql`, { waitUntil: 'domcontentloaded' });
    });

    await sessionTest.step('Verify URL contains /project/query', async () => {
      await expect(page).toHaveURL(/\/project\/query/);
    });
  });

  sessionTest('@regression REG-020: Enterprise search page URL is correct', async ({ page }) => {
    await sessionTest.step('Navigate to enterprise search page', async () => {
      await page.goto(`${loginUrl}/project/v2/nterprise-search`, { waitUntil: 'domcontentloaded' });
    });

    await sessionTest.step('Verify URL contains nterprise-search', async () => {
      await expect(page).toHaveURL(/nterprise-search/i);
    });
  });
});
