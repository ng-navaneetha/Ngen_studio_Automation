// pages/PulsePage.js
import { expect } from "@playwright/test";

export class PulsePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ---------- stable locators (getByRole / getByTestId) ----------
    this.pulseLink = page.getByRole("link", { name: "Pulse" });
    this.textRadio = page.getByRole("radio", { name: "Enter Text" });
    this.uploadRadio = page.getByRole("radio", { name: "Upload File" });
    this.pulseCardByName = (name) =>
      page.locator("div").filter({ hasText: name }).nth(1);

    this.textArea = page.getByRole("textbox", {
      name: "Enter your text here...",
    });
    this.generateBtn = page.getByRole("button", { name: "Generate" });
    this.resetBtn = page.getByRole("button", { name: "Reset" });

    this.sentimentHeading = page.getByRole("heading", {
      name: "Overall Sentiment",
    });
    this.sentimentOutcome = page.getByText(/Positive|Negative|Neutral/).first();

    // Upload drop area and file input
    this.fileDropTarget = page
      .locator("div")
      .filter({ hasText: /Drop a file here|click to upload/i })
      .first();
    this.fileInput = page.locator('input[type="file"]').first();
  }

  /* ---------- high‑level actions ---------- */

  async openPulse(pulseName) {
    await this.page.getByRole("heading", { name: pulseName }).first().click();
  }

  async analyseText(text) {
    await this.textRadio.check();
    await this.textArea.fill(text);
    await this.generateBtn.click();
  }

  async uploadAndAnalyse(filePath) {
    await this.uploadRadio.check();

    // Prefer setting files directly on the hidden input to avoid filechooser race/closure
    const inputInDrop = this.fileDropTarget
      .locator('input[type="file"]')
      .first();
    const hasScopedInput = (await inputInDrop.count()) > 0;

    if (hasScopedInput) {
      await inputInDrop.setInputFiles(filePath);
    } else if ((await this.fileInput.count()) > 0) {
      await this.fileInput.setInputFiles(filePath);
    } else {
      // Fallback: click the drop zone to ensure input is attached, then retry
      await this.fileDropTarget.click();
      await this.page.waitForSelector('input[type="file"]', { timeout: 5000 });
      await this.page
        .locator('input[type="file"]')
        .first()
        .setInputFiles(filePath);
    }

    await this.generateBtn.click();
  }

  async overallsentiment() {
    // Wait for the sentiment heading using the Locator API (not a selector string)
    await this.sentimentHeading.waitFor({ state: "visible" });
  }

  async reset() {
    await this.resetBtn.click();
  }

  /* ---------- getters / assertions ---------- */
  async expectSentimentVisible() {
    await expect(this.sentimentHeading).toBeVisible();
    await expect(this.sentimentOutcome).toBeVisible();
  }

  async getSentimentValue() {
    return this.sentimentOutcome.textContent();
  }
}
