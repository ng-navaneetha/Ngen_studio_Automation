/**
 * Sanity Testing - Ngen Studio
 *
 * Sanity tests are a narrow, focused subset of verification performed after
 * receiving a new build or patch. They confirm that the most critical areas
 * of the application function correctly before investing in a full regression
 * run. Each test is tagged `@sanity` so it can be executed in isolation:
 *
 *   npx playwright test --grep @sanity
 */
import { test, expect } from '../fixtures/sessionFixture';
import { loginUrl } from '../constants/login';

test.describe('Sanity Testing - Ngen Studio Core Features', () => {
  test.describe.configure({ timeout: 120000 });

  // ── Application availability ───────────────────────────────────────────────

  test('@sanity SAN-001: Application loads and home page is accessible', async ({ page }) => {
    await test.step('Navigate to the application root', async () => {
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify page title is present and non-empty', async () => {
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    await test.step('Verify the page URL contains the expected host', async () => {
      await expect(page).toHaveURL(/ngen-uat\.ngenux\.app/);
    });
  });

  // ── Authentication ─────────────────────────────────────────────────────────

  test('@sanity SAN-002: Login page renders the sign-in button', async ({ page }) => {
    await test.step('Navigate to the login URL', async () => {
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify Login button is visible', async () => {
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    });
  });

  test('@sanity SAN-003: Authenticated user is redirected to /project', async ({ page }) => {
    await test.step('Navigate to /project with valid session', async () => {
      await page.goto(`${loginUrl}/project`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify authenticated landing area is shown', async () => {
      await expect(
        page.getByRole('heading', { name: /my workspaces/i })
      ).toBeVisible({ timeout: 20000 });
    });

    await test.step('Verify URL is on the project path', async () => {
      await expect(page).toHaveURL(/\/project/);
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  test('@sanity SAN-004: Enterprise Search page loads successfully', async ({ page }) => {
    await test.step('Navigate to enterprise search', async () => {
      await page.goto(`${loginUrl}/project/v2/nterprise-search`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify the chat input area is present', async () => {
      await expect(
        page.locator('textarea[placeholder="Ask me anything..."]')
      ).toBeVisible({ timeout: 20000 });
    });
  });

  test('@sanity SAN-005: Insights (Extract) page loads successfully', async ({ page }) => {
    await test.step('Navigate to the Extract page', async () => {
      await page.goto(`${loginUrl}/project/extract`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify Extract page heading is displayed', async () => {
      await expect(
        page.getByRole('heading', { name: 'Analyze Document - Extract' })
      ).toBeVisible({ timeout: 20000 });
    });
  });

  test('@sanity SAN-006: Summary page loads and lists workspaces', async ({ page }) => {
    await test.step('Navigate to the Summary page', async () => {
      await page.goto(`${loginUrl}/project/summary`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify Summary workspaces heading is visible', async () => {
      await expect(
        page.getByRole('heading', { name: /my workspaces/i })
      ).toBeVisible({ timeout: 20000 });
    });
  });

  test('@sanity SAN-007: Pulse page loads and lists workspaces', async ({ page }) => {
    await test.step('Navigate to the Pulse page', async () => {
      await page.goto(`${loginUrl}/project/pulse`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify Pulse workspaces heading is visible', async () => {
      await expect(
        page.getByRole('heading', { name: /my workspaces/i })
      ).toBeVisible({ timeout: 20000 });
    });
  });

  test('@sanity SAN-008: Query page loads and lists workspaces', async ({ page }) => {
    await test.step('Navigate to the Query page', async () => {
      await page.goto(`${loginUrl}/project/query?tab=text2sql`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify Query workspaces heading is visible', async () => {
      await expect(
        page.getByRole('heading', { name: /my workspaces/i })
      ).toBeVisible({ timeout: 20000 });
    });
  });

  // ── Create workspace dialog ────────────────────────────────────────────────

  test('@sanity SAN-009: Create new workspace dialog opens from /project', async ({ page }) => {
    await test.step('Navigate to /project', async () => {
      await page.goto(`${loginUrl}/project`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Click the "Create new" button', async () => {
      await page.getByRole('button', { name: 'Create new' }).click();
    });

    await test.step('Verify the dialog or form for workspace creation opens', async () => {
      await expect(
        page.getByPlaceholder('Enter workspace name')
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Close the dialog without creating a workspace', async () => {
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(
        page.getByPlaceholder('Enter workspace name')
      ).not.toBeVisible({ timeout: 5000 });
    });
  });
});
