import { expect } from "@playwright/test";

export class AIAssistantPage {
  constructor(page) {
    this.page = page;
    this.toggleAssistantButton = page.getByRole("button", {
      name: "Toggle AI Assistant",
    });
    this.questionTextbox = page.getByRole("textbox", {
      name: "Ask a question about your",
    });
    this.submitButton = page.locator("form").getByRole("button");
    this.executingSQLText = page.getByText("Executing SQL query");
    this.processingText = page.getByText("Processing");
    this.waitText = page.getByText("Please wait");
    this.resultsGrid = page.locator(".grid.grid-cols-4.gap-1");
    this.dataTab = page.getByRole("tab", { name: "Data" });
    this.productIdCell = page.getByRole("cell", { name: "product id" });
    this.productNameCell = page.getByRole("cell", { name: "product name" });
    this.categoryCell = page.getByRole("cell", { name: "category" });
    this.newChatButton = page.getByRole("button", { name: "New Chat" });
  }

  async navigateToDashboard() {
    await this.page.goto("https://nsight-dev.ngenux.app/project/ai-dashboard");
  }

  async toggleAssistant() {
    await this.toggleAssistantButton.click();
  }

  async askQuestion(question) {
    await this.questionTextbox.click();
    await this.questionTextbox.fill(question);
  }

  async submitQuery() {
    await this.submitButton.click();
  }

  async waitForProcessing() {
    await this.executingSQLText.click();
    await this.processingText.click();
    await this.waitText.click();
  }

  async verifyResults() {
    await expect(this.productIdCell).toBeVisible();
    await expect(this.productNameCell).toBeVisible();
    await expect(this.categoryCell).toBeVisible();
  }

  async startNewChat(question) {
    await this.newChatButton.click();
    await this.askQuestion(question);
    await this.submitQuery();
    await this.waitForProcessing();
  }

  async verifyTabsAndNoData() {
    // Debugging: Log matching elements for "Executing SQL query"
    const matchingElements = await this.page
      .locator("div")
      .filter({ hasText: /^Executing SQL query/ })
      .count();
    console.log(
      `Matching elements for "Executing SQL query": ${matchingElements}`
    );

    // Refine locator to target a specific element
    const sqlQueryLocator = this.page.locator(
      "div.bg-card.border.p-4.rounded-lg.max-w-md"
    );
    await sqlQueryLocator.waitFor({ state: "hidden" });

    await expect(this.page.getByText("Please wait")).not.toBeVisible();

    // Add assertions for tabs and "No data available" text
    await expect(
      this.page.getByRole("tab", { name: "Data" }).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      this.page.getByRole("tab", { name: "Chart" }).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      this.page.getByRole("tab", { name: "SQL" }).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      this.page.getByRole("tab", { name: "Reasoning" }).first()
    ).toBeVisible({ timeout: 15000 });

    // Check if "No data available" text is visible
    const noDataText = this.page.locator(
      "div.text-center.p-4.text-muted-foreground"
    );
    const textContent = await noDataText.textContent();

    if (textContent === "No data available") {
      // Verify the "No data available" text is visible
      await expect(noDataText).toHaveText("No data available");
    } else {
      // Verify product data is visible
      await this.verifyResults();
    }
  }
}
