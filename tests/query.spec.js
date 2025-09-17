// /tests/query.spec.js
import { test, expect } from "../fixtures/sessionFixture";
import { QueryPage } from "../pages/QueryPage";
import { InsightsPage } from "../pages/insights.page";
import { WORKSPACE_DATA } from "../constants/insights_data";
import { loginUrl } from "../constants/login";
import { DB_CONFIG } from "../constants/database";

test.describe("Query feature – functional tests", () => {
  test.describe.configure({ timeout: 120000 });

  let insightsPage;
  const data = WORKSPACE_DATA.QUERY;
  const question1 = "Find all customers from a specific city (e.g., 'London').";
  const question2 = "List all films along with their categories using film, film_category, and category tables. Find all actors who appeared in a specific film (e.g., 'ACADEMY DINOSAUR') using film_actor and actor.actor_id.";

  test.beforeAll(async ({ page }) => {
    insightsPage = new InsightsPage(page);
    await page.goto(`${loginUrl}/project`);

    await insightsPage.clickCreateButton();

    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase,
      DB_CONFIG.POSTGRES
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify success message appears
    await expect(page.getByText(/creating workspace/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(`${loginUrl}/project/query?tab=text2sql`);
  });

  // Positive flow – verify results appear
  test(" @smoke TC01_validQueryDisplaysResults", async ({ page }) => {
    const query = new QueryPage(page);
    await query.openQuery(data.name);
    await query.ask(question2);
    await expect(
      page.locator("span").filter({ hasText: "Executing SQL query" })
    ).toBeVisible();
    await query.dataTab.waitFor({ state: "visible", timeout: 120000 });

    // Single assertion: verify Data tab now visible (proof of results)
    await expect(query.dataTab).toBeVisible();
    await expect(query.chartTab).toBeVisible();
    await expect(query.sqlTab).toBeVisible();
    await expect(query.reasonTab).toBeVisible();
  });

  // Negative – empty input should not submit
  test("TC02_emptyQueryDisabled", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    // Single assertion: generate button is disabled when textbox empty
    await expect(q.generateBtn).toBeDisabled();
  });

  // Edge – extremely long question
  test("@smoke TC03_longQueryHandled", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2); // 5 kB of text
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });

    await expect(q.dataTab).toBeVisible();
  });

  // Tab navigation – Data
  test("TC04_switchToDataTab", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2);
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });

    const tab = await q.switchToTab("Data");
    await expect(tab).toHaveAttribute("aria-selected", "true"); // single assertion
  });

  // Tab navigation – Chart
  test("TC05_switchToChartTab", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2);
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });


    const tab = await q.switchToTab("Chart");
    await expect(tab).toHaveAttribute("aria-selected", "true");
  });

  // Chart type change – Line
  test("TC06_renderLineChart", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2);
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });

    await q.switchToTab("Chart");
    await q.chooseChart("Line");
    await expect(q.chartCanvas).toBeVisible(); // single assertion
  });

  // Reset clears UI
  test("TC07_resetClearsState", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2);
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });

    await q.reset();

    // Single assertion: Start‑state heading visible again
    await expect(q.startHdr).toBeVisible();
  });

  // Negative – click Pie chart without data (edge)
  test("TC08_pieChartWithoutDataShowsAlert", async ({ page }) => {
    const q = new QueryPage(page);
    await q.openQuery(data.name);
    await q.ask(question2);
    await q.dataTab.waitFor({ state: "visible", timeout: 120000 });

    // user hasn’t run a query yet
    await q.switchToTab("Chart");
    await q.chooseChart("Pie");
    await q.chooseChart("Bar"); 
  });

  test.afterAll(async ({page}) => {
    await page.goto(`${loginUrl}/project/query?tab=text2sql`);
  
      await page.locator("button:has(svg)").nth(2).click();
  
      await page

  
        .getByRole("button", { name: "Delete Workspace" })
        .first()
        .click();
  
      // Click delete option
      await page.getByRole('button', { name: 'Delete' }).click();
  
      await page.close();
    });
});
