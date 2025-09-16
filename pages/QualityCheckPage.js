// @ts-check
import { expect } from '@playwright/test';

export class QualityCheckPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Main elements
    this.pageTitle = page.getByRole('heading', { name: 'Quality Check' });
    this.uploadButton = page.getByRole('button', { name: /Click to upload/ });
    this.fileInput = page.locator('input#file-upload');
    this.compareButton = page.getByRole('button', { name: 'Compare Images' });
    
    // Result elements (these will be visible after comparison)
    this.resultSection = page.locator("//div[.='Reference Image']");
    this.differenceImage = page.locator('.difference-image');
    this.originalImage = page.getByText('Actual Image');
    this.comparisonImage = page.locator('.comparison-image');

    // Quality metrics
    this.qualityMetrics = {
      flowerCount: page.locator('div').filter({ hasText: /^🌸 Flower Count Accuracy/ }).locator('span').nth(1),
      flowerTypeColor: page.locator('div').filter({ hasText: /^🎨 Flower Type & Color Match/ }).locator('span').nth(1),
      arrangement: page.locator('div').filter({ hasText: /^⚖️ Arrangement Symmetry/ }).locator('span').nth(1),
      wrapping: page.locator('div').filter({ hasText: /^🎁 Wrapping Material Match/ }).locator('span').nth(1),
      ribbon: page.locator('div').filter({ hasText: /^🎀 Ribbon & Bow Match/ }).locator('span').nth(1),
      topper: page.locator('div').filter({ hasText: /^✨ Topper & Decorative Match/ }).locator('span').nth(1),
      freshness: page.locator('div').filter({ hasText: /^🍃 Freshness Score/ }).locator('span').nth(1)
    };
  }

  /**
   * Navigate to Quality Check page
   */
  async goto() {
    // From the main project page, navigate to Quality Check
    await this.page.getByRole('link', { name: /Quality Check/i }).click();
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Upload files for comparison
   */
  async uploadFiles(filePaths) {
    await this.fileInput.setInputFiles(filePaths);
  }

  /**
   * Click the upload area to trigger file selection dialog
   */
  async clickUploadArea() {
    await this.uploadButton.click();
  }

  /**
   * Click the compare button to start comparison
   */
  async compareImages() {
    await this.compareButton.click();
  }

  /**
   * Check if the compare button is enabled
   */
  async isCompareButtonEnabled() {
    return await this.compareButton.isEnabled();
  }

  /**
   * Check if results are displayed
   */
  async expectResultsDisplayed() {
    await expect(this.resultSection).toBeVisible();
    // Check that at least one metric is visible
    await expect(this.qualityMetrics.flowerCount).toBeVisible();
    await expect(this.differenceImage).toBeVisible();
  }

  /**
   * Get all quality metrics
   * @returns {Promise<{[key: string]: number}>} Object with all quality scores
   */
  /**
   * Get all quality metrics
   * @returns {Promise<{[key: string]: number}>} Object with metric names as keys and scores as values
   */
  async getQualityMetrics() {
    /** @type {{[key: string]: number}} */
    const metrics = {};
    for (const [key, locator] of Object.entries(this.qualityMetrics)) {
      const text = await locator.textContent() || '0%';
      const match = text.match(/(\d+(?:\.\d+)?)%?/);
      metrics[key] = match ? parseFloat(match[1]) : 0;
    }
    return metrics;
  }

  /**
   * Check if all quality metrics match expected values
   * @param {number} expectedValue - The expected percentage value
   */
  async expectAllMetrics(expectedValue) {
    const metrics = await this.getQualityMetrics();
    for (const [key, value] of Object.entries(metrics)) {
      if (value !== expectedValue) {
        throw new Error(
          `Expected ${key} to be ${expectedValue}%, but got ${value}%`
        );
      }
    }
    return true;
  }

  /**
   * Get a specific quality metric value
   * @param {string} metricName - Name of the metric to check
   * @returns {Promise<number>} The metric value as a percentage
   */
  async getMetricValue(metricName) {
    if (!this.qualityMetrics[metricName]) {
      throw new Error(`Unknown metric: ${metricName}`);
    }
    const text = await this.qualityMetrics[metricName].textContent() || '0%';
    const match = text.match(/(\d+(?:\.\d+)?)%?/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Verify error message is displayed for incorrect number of files
  
   */
  async expectErrorMessage(errorMessage) {
    const errorElement = this.page.getByText(errorMessage);
    await expect(errorElement).toBeVisible();
  }
}
