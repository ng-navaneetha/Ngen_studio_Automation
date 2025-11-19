import { test, expect } from "@playwright/test";
import { GenerateAIInsightsPage } from "../../pages/KpiDashboardPages/generateAIInsights";
import { AiDashboardPage } from "../../pages/KpiDashboardPages/aiDashboard";
import { URL_OF_YOUR_KPI_DASHBOARD } from "../../constants/kpiConstants";

test.describe.configure({ timeout: 600000 });

test.describe("Generate AI Insights Tests", () => {
  let generateAIInsights;
  let aiDashboard;

  test.beforeEach(async ({ page }) => {
    generateAIInsights = new GenerateAIInsightsPage(page);
    aiDashboard = new AiDashboardPage(page);
    await aiDashboard.goto(URL_OF_YOUR_KPI_DASHBOARD);
  });

  test("@smoke Generate AI Insights and verify results", async () => {
    await test.step("Navigate to Supply Chain Head and open OTIF metrics", async () => {
      console.log("\n🎯 COMPREHENSIVE TIME PERIOD METRIC TEST - OTIF");

      await aiDashboard.switchRole("Supply Chain Head");
      await aiDashboard.waitForPageReady();

      // Open OTIF metric with verification
      await aiDashboard.openMetric("OTIF (On-Time In-Full)");
      const isCorrectMetric = await aiDashboard.verifyCorrectMetricOpened(
        "OTIF (On-Time In-Full)"
      );
      console.log(isCorrectMetric);
      await expect(isCorrectMetric).toBe(true);
      console.log("✅ Successfully opened OTIF metric detail view");
    });

    await test.step("Click Generate AI Insights button", async () => {
      await generateAIInsights.clickGenerateInsights();
    });

    await test.step("Wait for loading and verify results", async () => {
      await generateAIInsights.waitForLoading();
      await generateAIInsights.verifyResultsContent();
    });
  });
});
