import { test, expect } from "@playwright/test";
import { AIAssistantPage } from "../../pages/KpiDashboardPages/AIAssistant";

test.describe.configure({ timeout: 240000 });
test.describe("AI Assistant Text_Bot Tests", () => {
  let aiAssistant;

  test.beforeEach(async ({ page }) => {
    aiAssistant = new AIAssistantPage(page);
    await aiAssistant.navigateToDashboard();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("@smoke Ask a question and verify results", async () => {
    await test.step("Toggle AI Assistant and ask a question", async () => {
      await aiAssistant.toggleAssistant();
      await aiAssistant.askQuestion("provide top 5 products");
      await aiAssistant.submitQuery();
    });

    await test.step("Wait for processing and verify results", async () => {
      await aiAssistant.waitForProcessing();

      await aiAssistant.verifyTabsAndNoData();
    });
  });

  test("@smoke Start a new chat and verify results", async () => {
    await test.step("Start a new chat and ask a question", async () => {
      await aiAssistant.toggleAssistant();

      await aiAssistant.startNewChat("provide top 5 products");
    });

    await test.step("Verify results in the new chat", async () => {
      // Add assertions for tabs and "No data available" text
      await aiAssistant.verifyTabsAndNoData();
    });
  });
});
