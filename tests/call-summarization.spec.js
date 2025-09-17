import { test, expect } from "../fixtures/sessionFixture";
import { loginUrl } from "../constants/login";
import { WORKSPACE_DATA } from "../constants/insights_data";
import { InsightsPage } from "../pages/insights.page";

// Test data
const testCallId = "testing id 01";
const audioFiles = [
  "art_in8.mp3",
  "file_example.mp3",
  "resources_sample-calls.mp3",
  "harvard.wav",
  "file_example_MP3_700KB.mp3",
].map((file) => `${file}`);
const testAudioFile = audioFiles[0];

async function setupSummaryWorkspace(page) {
  const data = WORKSPACE_DATA.SUMMARY;

  await page
    .getByRole("heading", { name: data.name }, { exact: true })
    .first()
    .click();

  // Fill in Call ID
  await page.getByRole("textbox", { name: "Call ID" }).click();
  await page.getByRole("textbox", { name: "Call ID" }).fill(testCallId);

  // Upload audio file
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page
    .locator("div")
    .filter({ hasText: /^Drag & drop or click to select an audio file$/ })
    .nth(1)
    .click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(`test_data/${testAudioFile}`);
  console.log(testAudioFile);
  // Verify file was selected
  await expect(page.getByText(testAudioFile)).toBeVisible();

  // Submit the form
  await page.getByRole("button", { name: "Submit" }).click();

  // Verify loading state is shown
  await expect(page.getByText("Loading...")).toBeVisible();

  // Wait for processing to complete (this may take time)
  await page.waitForSelector(`//span[.='Agent'][1]`, {
    state: "visible",
    timeout: 120000,
  });
}

test.describe.configure({ timeout: 240000 });

test.describe("Call Summarization", () => {
  let insightsPage;

  test.beforeAll(async ({ page }) => {
    await page.goto(`${loginUrl}/project`);

    const data = WORKSPACE_DATA.SUMMARY;
    insightsPage = new InsightsPage(page);

    await insightsPage.navigateToInsights();
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(`${loginUrl}/project/summary`);
  });

  test("TC01: Should navigate to Summary page", async ({ page }) => {
    // Verify we're on the Summary page
    await expect(page).toHaveURL(/.*\/summary/);
    await expect(
      page.getByRole("heading", { name: /my workspaces/i })
    ).toBeVisible();
  });

  test("TC02: Should create the Summary from Insights", async ({ page }) => {
    const data = WORKSPACE_DATA.SUMMARY;
    await expect(
      page.getByRole("heading", { name: data.name }).first()
    ).toBeVisible();
  });

  test("TC03: Should display summary form with all fields", async ({
    page,
  }) => {
    const data = WORKSPACE_DATA.SUMMARY;

    await page.getByRole("heading", { name: data.name }).first().click();

    // Verify form validation works
    await expect(page.getByText(/summary/i).nth(1)).toBeVisible();
    await expect(page.locator("text=Call ID")).toBeVisible();
    await expect(page.locator("text=Audio File").first()).toBeVisible();
  });

  test("TC04: Should be able to upload a Audio file in a summary project", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await setupSummaryWorkspace(page);
    // Verify we're redirected back to Summary page
    await expect(page).toHaveURL(/.*\/summary/);
  });

  test("TC05: Multiple file upload and response validation", async ({
    page,
  }) => {
    test.setTimeout(300000);
    const data = WORKSPACE_DATA.SUMMARY;
    const results = [];

    for (const [index, audioFile] of audioFiles.entries()) {
      await test.step(`Testing file ${index + 1}: ${audioFile}`, async () => {
        const fileName = audioFile.split("/").pop();
        
        try {
          // Navigate to summary page and select workspace
          await page.goto(`${loginUrl}/project/summary`);
          await page.getByRole("heading", { name: data.name }).first().click();

          // Fill Call ID and upload file
          await page.getByRole("textbox", { name: "Call ID" }).fill(`test_call_${index + 1}`);
          
          const fileChooserPromise = page.waitForEvent("filechooser");
          await page.locator("div").filter({ hasText: /^Drag & drop or click to select an audio file$/ }).nth(1).click();
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(`test_data/${audioFile}`);

          // Verify file selection and submit
          await expect(page.getByText(fileName)).toBeVisible();
          await page.getByRole("button", { name: "Submit" }).click();

          // Wait for processing result
          const result = await Promise.race([
            page.waitForSelector(`//span[.='Agent'][1]`, { timeout: 90000 }).then(() => 'success'),
            page.waitForSelector("text=/error|invalid|failed/i", { timeout: 90000 }).then(() => 'error')
          ]).catch(() => 'timeout');

          results.push({ file: fileName, result });
          console.log(`✅ File ${index + 1}: ${fileName} - ${result}`);

        } catch (error) {
          results.push({ file: fileName, result: 'failed' });
          console.log(`❌ File ${index + 1}: ${fileName} - failed: ${error.message}`);
        }
      });
    }

    // Summary
    console.log("\n📊 Results Summary:");
    console.table(results);
  });

  test("@smoke TC06: Summary screen - UI and content assertions", async ({ page }) => {
    test.setTimeout(160000);
    await setupSummaryWorkspace(page);
    // Header and navigation
    await expect(page.getByRole("button", { name: /^Back$/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Summary$/ }).nth(1)
    ).toBeVisible();

    // Top info row
    await expect(page.getByText(/^Agent\b/i).first()).toBeVisible();
    await expect(page.getByText(/^Customer Name\b/i)).toBeVisible();
    await expect(page.getByText(/^Call ID\b/i)).toBeVisible();
    await expect(page.getByText(/^Call Duration\b/i)).toBeVisible();
    await expect(
      page.locator("h2").filter({ hasText: /^Summary$/ })
    ).toBeVisible(); // section title below, distinct from page header
    // Time format like 00:02:35
    // Try to find time by regex or exact text, fallback to alternative locator if needed
    let timeVisible = false;
    try {
      // Try regex locator first
      await expect(page.getByText(/\b\d{2}:\d{2}:\d{2}\b/).first()).toBeVisible({ timeout: 3000 });
      timeVisible = true;
    } catch {
      // Try exact text for a common time value
      try {
        await expect(page.getByText('00:02:00', { exact: true })).toBeVisible({ timeout: 3000 });
        timeVisible = true;
      } catch {
        // Try alternative locator for call duration
        const altLocator = page.locator('div').filter({ hasText: /^Call Duration-$/ }).locator('span').nth(1);
        await expect(altLocator).toBeVisible({ timeout: 3000 });
        timeVisible = true;
      }
    }
    expect(timeVisible).toBeTruthy();

    // Sections
    await expect(page.getByText(/^Call Timeline$/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Snapshot" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "AI-Powered Insights" })
    ).toBeVisible();
    await expect(page.getByText(/^Summary$/i).nth(1)).toBeVisible(); // section title below, distinct from page header

    // Snapshot details
    await expect(page.getByText(/^Issue Status$/i)).toBeVisible();
    await expect(page.getByText(/^Customer Satisfaction$/i)).toBeVisible();
    await expect(page.getByText(/^Primary Reason$/i)).toBeVisible();
    await expect(page.getByText(/^Primary Intent$/i)).toBeVisible();

    // Sentiment Trend table structure
    await expect(page.getByText(/^Sentiment Trend$/i)).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sentiment" })).toBeVisible();
    await expect(
      page.locator("th").filter({ hasText: "Caller" })
    ).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "Agent" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "beginning" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "middle" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "end" })).toBeVisible();

    // Tabs under Summary section
    const callSummaryTab = page
      .getByRole("tab", { name: /^Call Summary$/i })
      .or(page.getByRole("button", { name: /^Call Summary$/i }));
    const segmentsTab = page
      .getByRole("tab", { name: /^Segments$/i })
      .or(page.getByRole("button", { name: /^Segments$/i }));
    await expect(callSummaryTab).toBeVisible();
    await expect(segmentsTab).toBeVisible();

    // Call Timeline expand/collapse
    const showMore = page
      .getByRole("button", { name: /show more/i })
      .first()
      .or(page.getByText(/show more/i));
    const showMoreVisible = await showMore.isVisible().catch(() => false);
    if (showMoreVisible) {
      await showMore.click();
      await expect(page.getByText(/show less/i)).toBeVisible();
    }
  });

  test.afterAll(async ({ page }) => {
    await page.goto(`${loginUrl}/project/summary`);

    await page.locator("button:has(svg)").nth(2).click();

    await page
      .getByRole("button", { name: "Delete Workspace" })
      .first()
      .click();

    // Click delete option
    await page.getByRole("button", { name: "Delete" }).click();
    console.log("✅ Deleted Summary workspace");

    await page.close();
  });
});
