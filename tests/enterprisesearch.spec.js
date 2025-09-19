import { test, expect } from "../fixtures/sessionFixture";
import { loginUrl } from "../constants/login";
import path from "path";
import { FILES, WORKSPACE_DATA } from "../constants/insights_data";
import { InsightsPage } from "../pages/insights.page";
import { AcmeDB } from "../constants/database";

test.describe.configure({ timeout: 300000 });
test.describe("Enterprise Search Processing Tests", () => {
  let insightsPage;
  test.describe.configure({ timeout: 120000 });
  test.beforeAll(async ({ page }) => {
    insightsPage = new InsightsPage(page);

    await page.goto(`${loginUrl}/project`);
    const data = WORKSPACE_DATA.INSIGHTSEnterpriseSearch;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify workspace is created successfully
    await expect(page.getByText(data.name)).toBeVisible();
    // Test file upload
    const pdfFile = FILES.PDF;
    await insightsPage.uploadFile(`test_data/${pdfFile}`);
    await expect(
      page.locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
    ).toBeVisible();
    await page
      .locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
      .click();

    const data1 = WORKSPACE_DATA.QUERYEnterpriseSearch;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data1.name,
      data1.description,
      data1.useCase,
      AcmeDB.POSTGRES
    );
    await insightsPage.confirmWorkspaceCreation();
    await page.goto(`${loginUrl}/project/query?tab=text2sql`);

    // Verify workspace is created successfully
    await expect(page.getByText(data1.name).first()).toBeVisible();
  });

  test.only("@smoke TC01:Enterprise Search use case - Verify workspace functionality - upload document", async ({
    page,
  }) => {
    // Navigate to the app
    await page.goto(`${loginUrl}/project/v2/nterprise-search`);
    //placeholder Ask me anything...
    await expect(
      page.locator("//textarea[@placeholder='Ask me anything...']")
    ).toBeVisible();
    // fill questions
    const questions = [
      "What is the current OTIF (On-Time In-Full) score by region/product",
    ];

    for (const question of questions) {
      await page
        .locator('textarea[placeholder="Ask me anything..."]')
        .fill(question);
      await page.locator('button[aria-label="Send message"]').click();

      // verify table is visible for 1st question
      if (question.includes("OTIF")) {
        await page.waitForSelector("table", { timeout: 120000 });
        await expect(page.locator("table")).toBeVisible();
      }

      if (question.includes("party name")) {
        await page.waitForSelector(
          "div[class='space-y-2'] p[class='whitespace-pre-wrap']",
          { timeout: 120000 }
        );
        await expect(
          page.getByText(
            /The party name mentioned on the invoice is "Acme Corporation"./i
          )
        ).toBeVisible();
      }
    }
  });

  test.afterAll(async ({ page }) => {
    // Delete Insights workspace from /project
    await page.goto(`${loginUrl}/project`);

    await page.locator("button:has(svg)").nth(2).click();

    await page
      .getByRole("button", { name: "Delete Workspace" })
      .first()
      .click();

    // Click delete option
    await page.getByRole("button", { name: "Delete" }).click();
    // Verify Insights workspace is deleted successfully
    await expect(
      page.getByText(WORKSPACE_DATA.INSIGHTSEnterpriseSearch.name).first()
    ).not.toBeVisible();

    // Delete Query workspace (Acme DB project) from /query
    await page.goto(`${loginUrl}/project/query?tab=text2sql`);

    await page.locator("button:has(svg)").nth(2).click();

    await page
      .getByRole("button", { name: "Delete Workspace" })
      .first()
      .click();

    // Click delete option
    await page.getByRole("button", { name: "Delete" }).click();
    // Verify Query workspace is deleted successfully
    await expect(
      page.getByText(WORKSPACE_DATA.QUERYEnterpriseSearch.name).first()
    ).not.toBeVisible();
    console.log("✅ Deleted all workspaces created during the test run.");
    await page.close();
  });
});
