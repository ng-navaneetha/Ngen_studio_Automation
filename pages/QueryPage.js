// pages/QueryPage.js
import { expect } from '@playwright/test';

export class QueryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    /* ───────────── stable locators ───────────── */
    this.queryLink        = page.getByRole('link',  { name: 'Query' });
    this.healthQueryHdr   = page.getByRole('heading', { name: 'HealthQuery' });
    this.startHdr         = page.getByRole('heading', { name: 'Start Your Query' });
    this.askBox           = page.getByRole('textbox', { name: /Ask a question about your/i });
    this.generateBtn      = page.locator('form').getByRole('button');  // inside <form>
    this.resetBtn         = page.getByRole('button', { name: 'Reset' });

    // Tabs
    this.tab = (name) => page.getByRole('tab', { name });
    this.dataTab      = this.tab('Data');
    this.chartTab     = this.tab('Chart');
    this.sqlTab       = this.tab('SQL');
    this.reasonTab    = this.tab('Reasoning');

    // Chart buttons
    this.chartBtn = (name) => page.getByRole('button', { name });

    // Canvas for charts
    this.chartCanvas = page.locator('canvas');

    // Table cells in Data tab
    this.tableNameCell        = page.getByRole('cell', { name: 'table name' });
    this.tableDescriptionCell = page.getByRole('cell', { name: 'table description' });
  }

  /* ───────────── high‑level actions ───────────── */

  async goto() {
    await this.queryLink.click();
    await expect(this.healthQueryHdr).toBeVisible();
  }

  async openQuery(queryName) {
    await this.page.getByRole("heading", { name: queryName }).first().click();

  }

  async ask(question) {
    await this.askBox.click();
    await this.askBox.fill(question);
    // await this.askBox.press('Enter');
    await this.generateBtn.click();
  }

  
  async switchToTab(name) {
    const tab = this.tab(name);
    await tab.click();
    return tab;                    // lets callers assert on it
  }

  async chooseChart(type) {
    await this.chartBtn(type).click();
    await expect(this.chartCanvas).toBeVisible();
  }

  async reset() {
    await this.resetBtn.click();
  }
}
