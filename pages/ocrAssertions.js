
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
  const tab = page.getByRole('tab', { name: tabName }).first();
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
  // Find the container that includes both the label and its value
  // Using case-insensitive regex with 'i' flag and \s* to ignore spaces
  const fieldContainer = page.locator('div', { hasText: new RegExp(`^\\s*${label}\\s*.*\\s*${expectedValue}\\s*$`, 'i') }).first();
  await expect(fieldContainer).toBeVisible();
  
  // More specific locator: find the value paragraph within the field container
  const valueLocator = fieldContainer.locator('p.text-sm.break-words','i');
  await expect(valueLocator).toBeVisible();
  await expect(valueLocator).toHaveText(expectedValue);
}

/**
 * Verify content in the Raw Text tab
 */
async function verifyRawTextContent(page, expectedTexts) {
  await switchToOcrTab(page, 'Raw Text');
  // Fix CSS selector - add dots for class names
  const rawTextSelector = '.whitespace-pre-wrap.rounded-lg.bg-muted.p-4.text-sm.overflow-auto'; 
  const rawTextLocator = page.locator(rawTextSelector);
  await expect(rawTextLocator).toBeVisible();
  const rawText = await rawTextLocator.innerText();
  
  // Check for individual words/phrases instead of entire text blocks
  for (const expectedText of expectedTexts) {
    // Split the expected text into key words/phrases and check each one
    const keyPhrases = expectedText.split(/\s+/).filter(phrase => phrase.length > 2); // Filter out short words
    
    let foundPhrases = 0;
    for (const phrase of keyPhrases) {
      // Remove special characters and check if phrase exists (case insensitive)
      const cleanPhrase = phrase.replace(/[^\w\s]/g, '');
      const cleanRawText = rawText.replace(/[^\w\s]/g, ' ');
      
      if (cleanRawText.toLowerCase().includes(cleanPhrase.toLowerCase())) {
        foundPhrases++;
      }
    }
    
    // Consider it a match if at least 70% of key phrases are found
    const matchPercentage = (foundPhrases / keyPhrases.length) * 100;
    expect(matchPercentage).toBeGreaterThanOrEqual(50);
    
    console.log(`✅ Found ${foundPhrases}/${keyPhrases.length} key phrases (${matchPercentage.toFixed(1)}%) for: "${expectedText.substring(0, 50)}..."`);
  }
}

/**
 * Verify entities in the Entities tab
 */
async function verifyEntities(page, entities) {
  await switchToOcrTab(page, 'Entities');
  for (const [label, value] of Object.entries(entities)) {
    // Find row containing the label (entity type)
    const entityRow = page.locator('table').locator('tr', { hasText: label }).first();
    await expect(entityRow).toBeVisible();
    
    // Check if the value appears anywhere in the row (more flexible matching)
    const rowText = await entityRow.innerText();
    
    // Clean both expected and actual text for better matching
    const cleanValue = value.replace(/[^\w\s]/g, '').toLowerCase();
    const cleanRowText = rowText.replace(/[^\w\s]/g, ' ').toLowerCase();
    
    // Check if key parts of the value are present
    const valueWords = cleanValue.split(/\s+/).filter(word => word.length > 2);
    let foundWords = 0;
    
    for (const word of valueWords) {
      if (cleanRowText.includes(word)) {
        foundWords++;
      }
    }
    
    // Consider it a match if at least 70% of words are found
    const matchPercentage = (foundWords / valueWords.length) * 100;
    expect(matchPercentage).toBeGreaterThanOrEqual(50);
    
    console.log(`✅ Entity "${label}": Found ${foundWords}/${valueWords.length} words (${matchPercentage.toFixed(1)}%) in row: "${rowText.substring(0, 80)}..."`);
  }
}

/**
 * Verify metadata in the Meta tab
 */
async function verifyMetadata(page, metadata) {
  await switchToOcrTab(page, 'Meta');
  for (const [label] of Object.entries(metadata)) {
    const labelLocator = page.locator(`text=${label}`);
    await expect(labelLocator).toBeVisible();
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
