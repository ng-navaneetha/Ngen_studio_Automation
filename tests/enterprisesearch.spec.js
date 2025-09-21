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

  test("@smoke TC01:Enterprise Search use case - Verify workspace functionality - upload document", async ({
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
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    try {
      const workspaceName = WORKSPACE_DATA.INSIGHTSEnterpriseSearch.name.trim(); // Remove any trailing spaces
      console.log(`🗑️ Attempting to delete Insights workspace: "${workspaceName}"`);
      
      // Wait for workspace to be visible first
      await page.waitForSelector(`h3:has-text("${workspaceName}")`, { timeout: 10000 });
      
      // Find the specific workspace and its delete button
      const workspaceHeading = page.locator(`h3:has-text("${workspaceName}")`).first();
      const workspaceCard = workspaceHeading.locator('xpath=ancestor::div[contains(@class, "group") or contains(@class, "card") or contains(@class, "workspace")]').first();
      
      // Find and click the delete/menu button (usually the last button with SVG)
      const deleteMenuButton = workspaceCard.locator('button:has(svg)').last();
      await deleteMenuButton.click();
      
      // Wait for delete confirmation dialog
      await page.waitForSelector('button:has-text("Delete Workspace")', { timeout: 5000 });
      await page.getByRole("button", { name: "Delete Workspace" }).first().click();

      // Confirm deletion
      await page.waitForSelector('button:has-text("Delete"):not(:has-text("Workspace"))', { timeout: 5000 });
      await page.getByRole("button", { name: "Delete" }).click();
      
      // Wait for deletion to complete and verify
      await expect(page.locator(`h3:has-text("${workspaceName}")`).first()).not.toBeVisible({ timeout: 15000 });
      console.log("✅ Successfully deleted Insights workspace");
      
    } catch (error) {
      console.log(`⚠️ Error deleting Insights workspace: ${error.message}`);
    }

    // Delete Query workspace (Acme DB project) from /query
    await page.goto(`${loginUrl}/project/query?tab=text2sql`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    try {
      const queryWorkspaceName = WORKSPACE_DATA.QUERYEnterpriseSearch.name.trim();
      console.log(`🗑️ Attempting to delete Query workspace: "${queryWorkspaceName}"`);
      
      // Wait for workspace to be visible first
      await page.waitForSelector(`h3:has-text("${queryWorkspaceName}")`, { timeout: 10000 });
      
      // Find the specific workspace and its delete button
      const queryWorkspaceHeading = page.locator(`h3:has-text("${queryWorkspaceName}")`).first();
      const queryWorkspaceCard = queryWorkspaceHeading.locator('xpath=ancestor::div[contains(@class, "group") or contains(@class, "card") or contains(@class, "workspace")]').first();
      
      // Find and click the delete/menu button
      const queryDeleteMenuButton = queryWorkspaceCard.locator('button:has(svg)').last();
      await queryDeleteMenuButton.click();
      
      // Wait for delete confirmation dialog
      await page.waitForSelector('button:has-text("Delete Workspace")', { timeout: 5000 });
      await page.getByRole("button", { name: "Delete Workspace" }).first().click();

      // Confirm deletion
      await page.waitForSelector('button:has-text("Delete"):not(:has-text("Workspace"))', { timeout: 5000 });
      await page.getByRole("button", { name: "Delete" }).click();
      
      // Wait for deletion to complete and verify
      await expect(page.locator(`h3:has-text("${queryWorkspaceName}")`).first()).not.toBeVisible({ timeout: 15000 });
      console.log("✅ Successfully deleted Query workspace");
      
    } catch (error) {
      console.log(`⚠️ Error deleting Query workspace: ${error.message}`);
    }
    
    console.log("✅ Cleanup completed");
    await page.close();
  });
});
