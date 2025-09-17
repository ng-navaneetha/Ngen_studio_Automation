// tests/pulse.spec.js
import { test, expect } from "../fixtures/sessionFixture";
import { PulsePage } from "../pages/PulsePage";
import { InsightsPage } from "../pages/insights.page";
import { WORKSPACE_DATA } from "../constants/insights_data";
import { loginUrl } from "../constants/login";

test.describe("Pulse sentiment analysis – functional flow", () => {
  test.describe.configure({ timeout: 120000 });

  let insightsPage;
  let pulse;
  const data = WORKSPACE_DATA.PULSE;
  const pulseText = "Happy customers mean a lot!";
  const PDFfile = "test_data/pulse/PDF-Invoice-Templates-US-Template-01.pdf";
  const TXTfile = "test_data/pulse/conversation 2.txt";
  const unsupportedFileType = "test_data/pulse/image1.jpg";
  const largeFile = "test_data/pulse/large_file.pdf";

  const dataset = [
    { text: "I love this product!", expected: "positive" },
    { text: "This is terrible.", expected: "negative" },
    { text: "It’s okay, nothing special", expected: "neutral" },
    { text: "Not bad at all", expected: "positive" },
    { text: "Worst experience ever 😡", expected: "negative" },
    { text: "g00d!!!", expected: "positive" },
    { text: "meh 😒", expected: "negative" },  // robustness: emoji
    { text: "SOOOOO GOOD!!", expected: "positive" }, // robustness: casing, emphasis
  ];

  test.beforeAll(async ({ page }) => {
    insightsPage = new InsightsPage(page);
    await page.goto(`${loginUrl}/project`);

    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify workspace is created successfully
    // await insightsPage.navigateToPulse();
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(`${loginUrl}/project/pulse`);
  });

  test(" @smoke TC001_generateSentimentFromText", async ({ page }) => {
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);

    await pulse.analyseText(pulseText);
    await pulse.overallsentiment();
    await pulse.expectSentimentVisible();
    // ✅ single assertion in this block
    expect(["Positive", "Neutral", "Negative"]).toContain(
      await pulse.getSentimentValue()
    );
  });

  test("TC002_generateSentimentFromPDF", async ({ page }) => {
    test.setTimeout(120000);
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);

    await pulse.uploadAndAnalyse(PDFfile);
    await pulse.overallsentiment();

    await pulse.expectSentimentVisible();

    expect(["Positive", "Neutral", "Negative"]).toContain(
      await pulse.getSentimentValue()
    );
  });

  test("TC003_generateSentimentFromTXT", async ({ page }) => {
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);

    await pulse.uploadAndAnalyse(TXTfile);
    await pulse.overallsentiment();

    await pulse.expectSentimentVisible();

    expect(["Positive", "Neutral", "Negative"]).toContain(
      await pulse.getSentimentValue()
    );
  });

  test("TC004_emptyTextValidation", async ({ page }) => {
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);

    await pulse.textRadio.check();
    // No text filled
    await expect(pulse.generateBtn).toBeDisabled(); // single assertion
  });

  test("TC005_unsupportedFileType", async ({ page }) => {
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);
    await pulse.uploadAndAnalyse(unsupportedFileType);

    // Assuming your app raises toast / text alert for invalid type
    await expect(
      page.getByText(
        "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
      )
    ).toBeVisible(); // single assertion
  });

  test("TC006_fileTooLarge", async ({ page }) => {
    const pulse = new PulsePage(page);

    await pulse.openPulse(data.name);

    await pulse.uploadRadio.check();

    // Prefer setting files directly on the hidden input to avoid filechooser race/closure
    const inputInDrop = pulse.fileDropTarget
      .locator('input[type="file"]')
      .first();
    const hasScopedInput = (await inputInDrop.count()) > 0;

    if (hasScopedInput) {
      await inputInDrop.setInputFiles(largeFile);
    } else if ((await pulse.fileInput.count()) > 0) {
      await pulse.fileInput.setInputFiles(largeFile);
    } else {
      // Fallback: click the drop zone to ensure input is attached, then retry
      await pulse.fileDropTarget.click();
      await pulse.page.waitForSelector('input[type="file"]', { timeout: 5000 });
      await pulse.page
        .locator('input[type="file"]')
        .first()
        .setInputFiles(largeFile);
    }
    await expect(
      page.getByText("File size must be less than 50MB")
    ).toBeVisible(); // single assertion
  });

  test("TC007_resetClearsState", async ({ page }) => {
    const pulse = new PulsePage(page);
    await pulse.openPulse(data.name);

    await pulse.analyseText(pulseText);
    await pulse.overallsentiment();

    await pulse.reset();

    // Verify result section disappears
    await expect(pulse.sentimentHeading).toBeHidden(); // single assertion
  });


  test("TC008_validateSentimentModelAccuracy", async ({ page }) => {
    let correct = 0;
    let total = dataset.length;
    const pulse = new PulsePage(page);
    await pulse.openPulse(data.name);
    
    for (const sample of dataset) {
      await test.step(`Analyzing text: "${sample.text}"`, async () => {

        await pulse.analyseText(sample.text);
        await pulse.overallsentiment();
        await pulse.expectSentimentVisible();

        // Using more precise locator based on the heading and adjacent sentiment div
        const sentimentElement = page
          .getByRole('heading', { name: 'Overall Sentiment' })
          .locator('xpath=../div[contains(@class, "rounded-full")]');
        await expect(sentimentElement).toBeVisible();
        
        // expect(["Positive", "Neutral", "Negative"]).toContain(
        //   await pulse.getSentimentValue()
        // );
        const result = (await sentimentElement.textContent()).toLowerCase();
        
        if (result === sample.expected) {
          correct++;
          console.log(`✅ Correct: "${sample.text}" → ${result}`);
        } else {
          console.warn(`❌ Wrong: "${sample.text}" → got ${result}, expected ${sample.expected}`);
        }
      });

      await pulse.reset();

    }
  
    const accuracy = correct / total;
    console.log(`\n📊 Model Accuracy: ${(accuracy * 100).toFixed(2)}%`);
    
    // Threshold check with detailed message
    expect(accuracy, `Model accuracy ${(accuracy * 100).toFixed(2)}% is below threshold of 85%`)
      .toBeGreaterThanOrEqual(0.85);
  });

  test.afterAll(async ({page}) => {
    await page.goto(`${loginUrl}/project/pulse`);

    await page.locator("button:has(svg)").nth(2).click();

    await page
      .getByRole("button", { name: "Delete Workspace" })
      .first()
      .click();

    // Click delete option
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.close();
  });

});
