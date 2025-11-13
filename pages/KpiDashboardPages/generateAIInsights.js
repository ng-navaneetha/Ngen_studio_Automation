import { expect } from '@playwright/test';

export class GenerateAIInsightsPage {
  constructor(page) {
    this.page = page;
    this.generateInsightsButton = page.getByRole('button', { name: 'Generate AI Insights' });
    this.loadingText = page.locator('div').filter({ hasText: /^Loading\.\.\.$/ });
    this.generatingInsightsText = page.getByText('Generating AI insights…');
    this.resultsContainer = page.locator('.overflow-hidden > .p-4');
  }

  async clickGenerateInsights() {
    await this.generateInsightsButton.click();
  }

  async waitForLoading() {
    await expect(this.loadingText).toBeVisible();
    await expect(this.generatingInsightsText).toBeVisible();
  }

  async verifyResultsContent() {
    await this.page.locator('div').filter({ hasText: /^Loading\.\.\.$/ }).waitFor({ state: 'hidden' });
    const content = await this.resultsContainer.textContent();
    console.log(`🔍 Verifying results content: ${content}`);
   
    await expect(content.split(' ').length).toBeGreaterThan(30);
  }
}
