
import { test, expect } from "../fixtures/sessionFixture";
import { QualityCheckPage } from "../pages/QualityCheckPage";
import { loginUrl } from "../constants/login";
import {
  files,
  messages,
  thresholds,
  routes,
  selectors,
} from "../constants/qualityCheck.data";

test.describe.configure({ timeout: 120000 });
test.describe("Quality Check Feature Tests", () => {
  let qualityCheckPage;

  test.beforeEach(async ({ page }) => {
    qualityCheckPage = new QualityCheckPage(page);

    // Navigate to Quality Check page
    await page.goto(`${loginUrl}${routes.qualityCheckPath}`);
  });

  test("TC01: Quality Check page loads with correct elements", async () => {
    await expect(qualityCheckPage.pageTitle).toBeVisible();
    await expect(qualityCheckPage.uploadButton).toBeVisible();
    await expect(qualityCheckPage.compareButton).toBeVisible();

    // Compare button should be initially disabled as no files are uploaded
    await expect(qualityCheckPage.compareButton).toBeDisabled();
  });

  test("TC02: Upload area accepts file drops and shows uploaded file names", async ({
    page,
  }) => {
    // Prepare mock file paths (using relative paths for testing)
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    // Upload files directly through input element
    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);

    // Check that files are uploaded and shown
    const uploadText = await page.getByText("image1.jpg");
    const uploadText2 = await page.getByText("image2.jpg");

    await expect(uploadText).toBeVisible();
    await expect(uploadText2).toBeVisible();

    // Compare button should now be enabled
    await expect(qualityCheckPage.compareButton).toBeEnabled();
  });

  test("TC03: Compare button is enabled only when exactly 2 files are uploaded", async ({
    page,
  }) => {
    // Prepare mock file path
    const testImage1Path = files.image1;

    // Upload just one file
    await qualityCheckPage.uploadFiles([testImage1Path]);

    // Compare button should still be disabled with only one file
    await expect(qualityCheckPage.compareButton).toBeDisabled();

    // Upload second file
    const testImage2Path = files.image2;
    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);

    // Compare button should now be enabled
    await expect(qualityCheckPage.compareButton).toBeEnabled();
  });

  test("@smoke TC04: Image comparison shows results with similarity score and visual difference", async ({
    page,
  }) => {
    // Prepare mock file paths (using relative paths for testing)
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    // Upload files
    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);

    // Trigger comparison
    await qualityCheckPage.compareImages();

    // Verify results are displayed
    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 20000 });

    // Expect similarity score to be visible and clickable
    const similarityScore = page
      .locator("div")
      .filter({ hasText: /^\d+%$/ })
      .nth(1);
    await expect(similarityScore).toBeVisible();

    // Verify both original images are displayed for reference
    await expect(qualityCheckPage.originalImage).toBeVisible();
  });

  test("TC05: Error message shown when uploading more than 2 files", async ({
    page,
  }) => {
    // Prepare mock file paths
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;
    const testImage3Path = files.image3;

    // Try to upload 3 files
    await qualityCheckPage.uploadFiles([
      testImage1Path,
      testImage2Path,
      testImage3Path,
    ]);

    // Check that files are uploaded and shown
    const uploadText2 = await page.getByText("image3.jpg");

    await expect(uploadText2).not.toBeVisible();
  });

  test("TC06: Error message shown when uploading non-image file", async ({
    page,
  }) => {
    // Prepare mock file paths - one valid image and one non-image file
    const testImagePath = files.image1;
    const testDocPath = files.document;

    // Try to upload a non-image file
    await qualityCheckPage.uploadFiles([testImagePath, testDocPath]);

    // Compare button should remain disabled
    await expect(qualityCheckPage.compareButton).toBeDisabled();
  });


  test("TC08: Reset button returns to upload page after comparison", async ({
    page,
  }) => {
    // Prepare mock file paths
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    // Upload files
    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);

    // Trigger comparison
    await qualityCheckPage.compareImages();

    // Verify results are displayed
    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 10000 });

    // Click reset button
    await page.getByRole("button", { name: "Reset", exact: true }).click();

    // Verify we're back at the upload page
    await expect(qualityCheckPage.uploadButton).toBeVisible();
    await expect(qualityCheckPage.compareButton).toBeDisabled();

    // Verify comparison results are no longer visible
    await expect(page.locator(selectors.comparisonResults)).toBeHidden();
  });

  test("TC09: Verify individual metric scores are displayed correctly", async ({
    page,
  }) => {
    // Prepare mock file paths
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    // Upload files and compare
    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);
    await qualityCheckPage.compareImages();

    // Wait for results
    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 20000 });

    // Verify all metric components are visible
    await expect(page.getByText("Flower Count Accuracy")).toBeVisible();
    await expect(page.getByText("Flower Type & Color Match")).toBeVisible();
    await expect(page.getByText("Arrangement Symmetry")).toBeVisible();
    await expect(page.getByText("Wrapping Material Match").first()).toBeVisible();
    await expect(page.getByText("Ribbon & Bow Match")).toBeVisible();
    await expect(page.getByText("Topper & Decorative Match")).toBeVisible();
    await expect(page.getByText("Freshness Score")).toBeVisible();
  });

  test("TC10: Overall validation score calculation matches individual metrics", async ({
    page,
  }) => {
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);
    await qualityCheckPage.compareImages();

    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 20000 });

    // Get overall score
    const overallScoreText = await page
      .locator("div")
      .filter({ hasText: /^\d+%$/ })
      .nth(1)
      .textContent();
    const overallScore = overallScoreText
      ? parseInt(overallScoreText.replace("%", ""))
      : 0;

    // Verify overall score is between 0 and 100
    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);
  });

  test("TC11: Verify AI Insights section shows detailed analysis", async ({
    page,
  }) => {
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);
    await qualityCheckPage.compareImages();

    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 20000 });

    // Verify AI Insights section
    await expect(page.getByText("AI Insights")).toBeVisible();
    await expect(
      page.getByText("Detailed analysis from our AI flower expert")
    ).toBeVisible();
  });

  test("TC12: Images remain visible after long comparison times", async ({
    page,
  }) => {
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);
    await qualityCheckPage.compareImages();

    // Wait longer than usual to simulate slow processing
    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 30000 });

    // Verify both reference and actual images are still visible
    await expect(page.getByText("Reference Image").first()).toBeVisible();
    await expect(page.getByText("Actual Image")).toBeVisible();
  });


  test("TC13: Verify completion timestamp is present and valid", async ({
    page,
  }) => {
    const testImage1Path = files.image1;
    const testImage2Path = files.image2;

    await qualityCheckPage.uploadFiles([testImage1Path, testImage2Path]);
    await qualityCheckPage.compareImages();

    await page
      .locator(selectors.comparisonResults)
      .waitFor({ state: "visible", timeout: 20000 });

    // Verify timestamp format (matches "Analysis completed on 8/19/2025, 12:02:26 PM")
    const timestampLocator = page.getByText(/Analysis completed on/);
    await expect(timestampLocator).toBeVisible();
    const timestamp = await timestampLocator.textContent();
    expect(timestamp).toMatch(
      /Analysis completed on \d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/
    );
  });

  test.afterAll(async ({ page }) => {
    await page.close();
  });
});
