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
    // Original tests
    { text: "I love this product!", expected: "positive" },
    { text: "This is terrible.", expected: "negative" },
    { text: "It's okay, nothing special", expected: "neutral" },
    { text: "Not bad at all", expected: "positive" },
    { text: "Worst experience ever 😡", expected: "negative" },
    { text: "g00d!!!", expected: "positive" },
    { text: "meh 😒", expected: "negative" },
    { text: "SOOOOO GOOD!!", expected: "positive" },

    // Additional positive sentiments
    { text: "Absolutely fantastic service!", expected: "positive" },
    { text: "Exceeded my expectations", expected: "positive" },
    { text: "Highly recommend this! 👍", expected: "positive" },
    { text: "Perfect solution for my needs", expected: "positive" },
    { text: "Amazing quality and fast delivery", expected: "positive" },

    // Additional negative sentiments
    { text: "Complete waste of money", expected: "negative" },
    { text: "Very disappointed with the results", expected: "negative" },
    { text: "Poor customer support", expected: "negative" },
    { text: "Would not recommend to anyone", expected: "negative" },
    { text: "Broken and unusable 😠", expected: "negative" },

    // Additional neutral sentiments
    { text: "It works as described", expected: "neutral" },
    { text: "Average product, nothing more", expected: "neutral" },
    { text: "Meets basic requirements", expected: "neutral" },
    { text: "Standard quality", expected: "neutral" },
    { text: "It's fine I guess", expected: "neutral" },

    // Edge cases - mixed signals
    { text: "Good but could be better", expected: "neutral" },
    { text: "Not great but not bad either", expected: "neutral" },
    { text: "Has pros and cons", expected: "neutral" },

    // Edge cases - sarcasm/context (challenging)
    { text: "Yeah, sure, 'great' product...", expected: "negative" },
    { text: "Just what I needed... NOT", expected: "negative" },

    // Edge cases - short text
    { text: "Love it!", expected: "positive" },
    { text: "Hate it", expected: "negative" },
    { text: "OK", expected: "neutral" },

    // Edge cases - emphasis and repetition
    { text: "BAD BAD BAD!!!", expected: "negative" },
    { text: "So so so happy!!!", expected: "positive" },
    { text: ".................", expected: "neutral" },
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

  test("@smoke @e2e @integration TC001_generateSentimentFromText", async ({ page }) => {
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Analyze text and verify sentiment', async () => {
      await pulse.analyseText(dataset[0].text);
      await pulse.overallsentiment();
      await pulse.expectSentimentVisible();
      
      const result = (await pulse.getSentimentValue()).toLowerCase();
      await expect(result).toBe(dataset[0].expected);
      console.log(`✅ Correct: "${dataset[0].text}" → ${result}`);
    });
  });

  test("TC002_generateSentimentFromPDF", async ({ page }) => {
    test.setTimeout(120000);
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Upload PDF and analyze sentiment', async () => {
      await pulse.uploadAndAnalyse(PDFfile);
      await pulse.overallsentiment();
      await pulse.expectSentimentVisible();
    });

    await test.step('Verify sentiment is generated', async () => {
      const result = (await pulse.getSentimentValue()).toLowerCase();
      // Verify sentiment is one of the valid values
      await expect(['positive', 'negative', 'neutral']).toContain(result);
      console.log(`✅ PDF sentiment analysis result: ${result}`);
    });
  });

  test("TC003_generateSentimentFromTXT", async ({ page }) => {
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Upload TXT file and analyze sentiment', async () => {
      await pulse.uploadAndAnalyse(TXTfile);
      await pulse.overallsentiment();
      await pulse.expectSentimentVisible();
    });

    await test.step('Verify sentiment is generated', async () => {
      const result = (await pulse.getSentimentValue()).toLowerCase();
      // Verify sentiment is one of the valid values
      await expect(['positive', 'negative', 'neutral']).toContain(result);
      console.log(`✅ TXT sentiment analysis result: ${result}`);
    });
  });
  });

  test("TC004_emptyTextValidation", async ({ page }) => {
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Verify generate button is disabled for empty text', async () => {
      await pulse.textRadio.check();
      // No text filled
      await expect(pulse.generateBtn).toBeDisabled();
    });
  });

  test("TC005_unsupportedFileType", async ({ page }) => {
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Upload unsupported file type', async () => {
      await pulse.uploadAndAnalyse(unsupportedFileType);
    });

    await test.step('Verify error message is displayed', async () => {
      // Check for error message (using partial match for flexibility)
      await expect(
        page.getByText(/error occurred|unsupported|invalid file/i)
      ).toBeVisible();
    });
  });

  test("TC006_fileTooLarge", async ({ page }) => {
    const pulse = new PulsePage(page);

    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Select upload option', async () => {
      await pulse.uploadRadio.check();
    });

    await test.step('Attempt to upload large file', async () => {
      const inputInDrop = pulse.fileDropTarget.locator('input[type="file"]').first();
      const hasScopedInput = (await inputInDrop.count()) > 0;

      if (hasScopedInput) {
        await inputInDrop.setInputFiles(largeFile);
      } else if ((await pulse.fileInput.count()) > 0) {
        await pulse.fileInput.setInputFiles(largeFile);
      } else {
        await pulse.fileDropTarget.click();
        await pulse.page.waitForSelector('input[type="file"]', { timeout: 5000 });
        await pulse.page.locator('input[type="file"]').first().setInputFiles(largeFile);
      }
    });

    await test.step('Verify file size error message', async () => {
      await expect(
        page.getByText(/file size.*50MB|too large|exceeds.*limit/i)
      ).toBeVisible();
    });
  });

  test("@e2e TC007_resetClearsState", async ({ page }) => {
    const pulse = new PulsePage(page);
    
    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    await test.step('Generate sentiment analysis', async () => {
      await pulse.analyseText(dataset[0].text);
      await pulse.overallsentiment();
      await pulse.expectSentimentVisible();
    });

    await test.step('Reset and verify state is cleared', async () => {
      await pulse.reset();
      // Verify result section disappears
      await expect(pulse.sentimentHeading).toBeHidden();
    });
  });

  test("@e2e @integration TC008_validateSentimentModelAccuracy", async ({ page }) => {
    let correct = 0;
    let total = dataset.length;
    const pulse = new PulsePage(page);
    
    await test.step('Open pulse workspace', async () => {
      await pulse.openPulse(data.name);
    });

    for (const sample of dataset) {
      await test.step(`Analyzing text: "${sample.text}"`, async () => {
        await pulse.analyseText(sample.text);
        await pulse.overallsentiment();
        await pulse.expectSentimentVisible();

        const result = (await pulse.getSentimentValue()).toLowerCase();

        if (result === sample.expected) {
          correct++;
          console.log(`✅ Correct: "${sample.text}" → ${result}`);
        } else {
          console.warn(
            `❌ Wrong: "${sample.text}" → got ${result}, expected ${sample.expected}`
          );
        }
      });

      await pulse.reset();
    }

    await test.step('Verify model accuracy meets threshold', async () => {
      const accuracy = correct / total;
      console.log(`\n📊 Model Accuracy: ${(accuracy * 100).toFixed(2)}%`);

      // Threshold check with detailed message
      await expect(
        accuracy,
        `Model accuracy ${(accuracy * 100).toFixed(2)}% is below threshold of 85%`
      ).toBeGreaterThanOrEqual(0.85);
    });
  });

  test.afterAll(async ({ page }) => {
    await test.step('Navigate to pulse page', async () => {
      await page.goto(`${loginUrl}/project/pulse`);
    });

    await test.step('Delete workspace', async () => {
      // Click workspace options menu
      await page.getByRole('button', { name: /options|menu|more/i }).or(
        page.locator('button:has(svg)').filter({ hasText: '' })
      ).first().click();

      // Click delete workspace option
      await page.getByRole("button", { name: "Delete Workspace" }).first().click();

      // Confirm deletion
      await page.getByRole("button", { name: "Delete" }).click();
    });

    await page.close();
  });
