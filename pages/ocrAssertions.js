
/**
 * Verify if all expected tabs are visible in the OCR output UI
 */
import { expect } from '../fixtures/sessionFixture';


async function verifyOcrTabs(page) {
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Entities' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Tables' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Raw Text' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Meta' })).toBeVisible();
}

/**
 * Switch to a specific tab in the OCR UI and verify it's active
 */
async function switchToOcrTab(page, tabName) {
  const tab = page.getByRole('tab', { name: tabName });
  await tab.click();
  // Assert tab is active - try different attribute or approach
  try {
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  } catch (error) {
    // Fallback: check if tab is active using class or other indicators
    const isActive = await tab.evaluate(el => 
      el.hasAttribute('aria-selected') && el.getAttribute('aria-selected') === 'true' ||
      el.classList.contains('active') ||
      el.classList.contains('selected')
    );
    expect(isActive).toBeTruthy();
  }
}

/**
 * Check if a specific field is visible and has the expected value
 */
async function assertExtractedField(page, label, expectedValue) {
  const field = page.locator('div', { hasText: new RegExp(`^${label}$`) }).first();
  await expect(field).toBeVisible();
  await field.click();
  const valueLocator = page.locator('.field-value');
  await expect(valueLocator).toBeVisible();
  await expect(valueLocator).toHaveText(expectedValue);
}

/**
 * Verify content in the Raw Text tab
 */
async function verifyRawTextContent(page, expectedTexts) {
  await switchToOcrTab(page, 'Raw Text');
  const rawTextSelector = '.raw-text-view'; // Adjust selector as needed
  const rawTextLocator = page.locator(rawTextSelector);
  await expect(rawTextLocator).toBeVisible();
  const rawText = await rawTextLocator.innerText();
  for (const expectedText of expectedTexts) {
    expect(rawText).toContain(expectedText);
  }
}

/**
 * Verify entities in the Entities tab
 */
async function verifyEntities(page, entities) {
  await switchToOcrTab(page, 'Entities');
  for (const [label, value] of Object.entries(entities)) {
    const entityRow = page.locator('table').locator('tr', { hasText: label }).first();
    await expect(entityRow).toBeVisible();
    await expect(entityRow).toContainText(value);
  }
}

/**
 * Verify metadata in the Meta tab
 */
async function verifyMetadata(page, metadata) {
  await switchToOcrTab(page, 'Meta');
  for (const [label, value] of Object.entries(metadata)) {
    const labelLocator = page.locator(`text=${label}`);
    const valueLocator = page.locator(`text=${value}`);
    await expect(labelLocator).toBeVisible();
    await expect(valueLocator).toBeVisible();
  }
}

export {
  verifyOcrTabs,
  switchToOcrTab,
  assertExtractedField,
  verifyRawTextContent,
  verifyEntities,
  verifyMetadata
};
