/**
 * Helper functions for Call Summary UI output assertions
 */

async function createSummaryWorkspace(page) {
  // Leave name empty, fill other fields
  await page.getByPlaceholder('Enter workspace name').fill('summary-test-workspace');
  await page.getByPlaceholder('Enter workspace description').fill('summary-test-workspace');
  await page.getByRole('combobox', { name: /use case/i }).click();
  await page.getByRole('option', { name: /summary/i }).click();
  await page.getByRole('combobox', { name: /access type/i }).click();
  await page.getByRole('option', { name: /private/i }).click();
  // Try to submit
  await page.getByRole('button', { name: /create workspace/i }).click();
}


async function verifyCallTimeline(page) {
  await page.locator('text=Call Timeline').waitFor({ state: 'visible' });
  // Check for timeline markers
  await page.locator('.timeline-marker').first().waitFor();
  // Check for timeline data
  await page.locator('.timeline-data').first().waitFor();
}

/**
 * Verify if the Snapshot section is visible with expected cards
 */
async function verifySnapshotSection(page) {
  await page.locator('text=Snapshot').waitFor({ state: 'visible' });

  // Check for common snapshot cards
  await page.locator('text=Issue Status').waitFor();
  await page.locator('text=Primary Reason').waitFor();
  await page.locator('text=Sentiment Trend').waitFor();

  // Verify card contents
  await page.locator('.snapshot-card').first().waitFor();

  // Check sentiment indicators are visible
  await page.locator('.sentiment-indicator').first().waitFor();
}

/**
 * Verify if the Summary section is visible with expected tabs
 */
async function verifySummarySection(page) {
  await page.locator('text=Summary').waitFor({ state: 'visible' });

  // Check for summary tabs
  await page.getByRole('tab', { name: 'Call Summary' }).waitFor();
  await page.getByRole('tab', { name: 'Segments' }).waitFor();

  // Verify tab content appears when clicked
  await page.getByRole('tab', { name: 'Call Summary' }).click();
  await page.locator('.summary-content').waitFor();
}

/**
 * Verify if the summary table contains expected data
 */
async function verifySummaryTable(page, expectedRows) {
  // Make sure we're on the Call Summary tab
  await page.getByRole('tab', { name: 'Call Summary' }).click();

  // Check column headers
  await page.locator('text=Speaker').waitFor();
  await page.locator('text=Description').waitFor();
  await page.locator('text=Excerpt').waitFor();

  // Check each expected row
  for (const row of expectedRows) {
    const { speaker, description, excerpt } = row;

    // Find a table row that contains the description
    const tableRow = page.locator('tr', { has: page.locator(`text="${description}"`) });
    await tableRow.waitFor();

    // Verify speaker in the row
    const speakerCell = tableRow.locator('td').first();
    const actualSpeaker = await speakerCell.innerText();
    if (actualSpeaker !== speaker) {
      throw new Error(`Expected speaker "${speaker}" but found "${actualSpeaker}"`);
    }

    // If excerpt is specified, verify it
    if (excerpt) {
      const excerptCell = tableRow.locator('td').nth(2);
      const actualExcerpt = await excerptCell.innerText();
      if (!actualExcerpt.includes(excerpt)) {
        throw new Error(`Expected excerpt to contain "${excerpt}" but found "${actualExcerpt}"`);
      }
    }
  }
}

/**
 * Verify AI-Powered Insights section
 */
async function verifyAIInsights(page) {
  await page.locator('text=AI-Powered Insights').waitFor();
  // Check for common insights sections
  await page.locator('text=Key Points').waitFor();
  await page.locator('text=Action Items').waitFor();
  await page.locator('text=Questions').waitFor();

  // Verify content exists in the sections
  await page.locator('.insight-item').first().waitFor();
}

/**
 * Verify segments tab content
 */
async function verifySegmentsTab(page) {
  // Switch to segments tab
  await page.getByRole('tab', { name: 'Segments' }).click();

  // Verify segment timeline appears
  await page.locator('.segment-timeline').waitFor();

  // Verify segment list appears
  await page.locator('.segment-list').waitFor();

  // Check for segment items
  await page.locator('.segment-item').first().waitFor();

  // Verify segment time markers
  await page.locator('.segment-time').first().waitFor();
}

/**
 * Verify sentiment trend card details
 */
async function verifySentimentTrend(page, expected = {}) {
  await page.locator('text=Sentiment Trend').waitFor();

  // Verify the sentiment chart is visible
  await page.locator('.sentiment-chart').waitFor();

  // Check sentiment values if provided
  if (expected.beginning) {
    await expect(page.locator('.sentiment-beginning')).toContainText(expected.beginning);
  }

  if (expected.middle) {
    await expect(page.locator('.sentiment-middle')).toContainText(expected.middle);
  }

  if (expected.end) {
    await expect(page.locator('.sentiment-end')).toContainText(expected.end);
  }
}

/**
 * Verify call metadata
 */
async function verifyCallMetadata(page, expected = {}) {
  await page.locator('text=Call Details').waitFor();

  if (expected.callId) {
    await expect(page.locator('.call-id')).toContainText(expected.callId);
  }

  if (expected.duration) {
    await expect(page.locator('.call-duration')).toContainText(expected.duration);
  }

  if (expected.date) {
    await expect(page.locator('.call-date')).toContainText(expected.date);
  }
}

/**
 * Verify the form to create a new summary
 */
async function verifyCreateSummaryForm(page) {
  await page.locator('text=Create Summary').waitFor();

  // Check for form fields
  await page.getByRole('textbox', { name: 'Call ID' }).waitFor();
  await page.locator('div').filter({ hasText: /^Drag & drop or click to select an audio file$/ }).waitFor();

  // Check submit button
  await page.getByRole('button', { name: 'Submit' }).waitFor();
}

export {
  verifyCallTimeline,
  verifySnapshotSection,
  verifySummarySection,
  verifySummaryTable,
  verifyAIInsights,
  verifySegmentsTab,
  verifySentimentTrend,
  verifyCallMetadata,
  verifyCreateSummaryForm,
  createSummaryWorkspace
};
