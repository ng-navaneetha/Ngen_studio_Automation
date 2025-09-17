import { test, expect } from "../fixtures/sessionFixture";
import {
  verifyOcrTabs,
  switchToOcrTab,
  verifyRawTextContent,
  assertExtractedField,
  verifyEntities,
  verifyMetadata,
} from "../pages/ocrAssertions.js"; // Add .js extension
import { loginUrl } from "../constants/login";
import path from "path";

const filepath = path.join(
  process.cwd(),
  "test_data/OCR/English_handwritten.pdf"
);

test.describe("Login and Navigation Tests", () => {
  test.describe.configure({ timeout: 120000 });
  test.describe("OCR Document Processing Tests", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the Extract page and upload a test invoice document before each test
      await page.goto(`${loginUrl}/project/extract`);
      await expect(
        page.getByRole("heading", { name: "Analyze Document - Extract" })
      ).toBeVisible();
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByText("Click to upload").click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filepath);
      await page.getByRole("button", { name: "Analyze Documents" }).click();
      await page
        .getByRole("tab", { name: "Overview" })
        .waitFor({ state: "visible" });
    });

    test(" @smoke TC01: Should show all OCR tabs and allow navigation", async ({
      page,
    }) => {
      await verifyOcrTabs(page);
      await switchToOcrTab(page, "Overview");
      await switchToOcrTab(page, "Entities");
      await switchToOcrTab(page, "Tables");
      await switchToOcrTab(page, "Meta");
    });

    test("TC02: Should display correct extracted field values", async ({
      page,
    }) => {
      await assertExtractedField(page, "From", "Vaaljapie Stasie Restaurant");
    });

    test("TC03: Should display correct raw text content", async ({ page }) => {
      await verifyRawTextContent(page, [
        "From",
        "Contact",
        "Email",
        "        From: Vaaljapie Stasie Restaurant        Contact: 044 6965878                Email: e-pos.vaaljapie@itcs.co.za        Date: 11/03/05        VAT No: B.T.W. Gereg. Nr.        Customer: Marlene        2x Orange Juice 16.00        1x Seemanspakkie 89.95        1x Roosetai 38.95        1x Haartrullers 3.95        1x Slaai 6.90        Total: R135.05",
      ]);
    });

    test("TC04: Should extract and display entities", async ({ page }) => {
      await verifyEntities(page, {
        "Vaaljapie Stasie Restaurant": "From: Vaaljapie Stasie Restaurant",
      });
    });

    test("TC05: Should display correct document metadata", async ({ page }) => {
      await verifyMetadata(page, {
        "Pages Processed": "1",
        Language: "af",
      });
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
  });

  test.describe("OCR Document Processing - Edge Cases", () => {
    test("TC01: Should handle invalid document uploads with disabled button", async ({
      page,
    }) => {
      await page.goto(`${loginUrl}/project/extract`);
      await expect(
        page.getByRole("heading", { name: "Analyze Document - Extract" })
      ).toBeVisible();
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByText("Click to upload").click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(
        path.join(process.cwd(), "test_data/art_in8.mp3")
      ); // Using an audio file instead of document
      await expect(
        page.getByRole("button", { name: "Analyze Documents" })
      ).toBeDisabled({
        timeout: 10000,
      });
    });

    test("TC02: Should not handle large document uploads as 50mb is max", async ({
      page,
    }) => {
      await page.goto(`${loginUrl}/project/extract`);
      await expect(
        page.getByRole("heading", { name: "Analyze Document - Extract" })
      ).toBeVisible();
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByText("Click to upload").click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(
        path.join(process.cwd(), "test_data/OCR/large_file.pdf")
      );
      await expect(
        page.getByRole("button", { name: "Analyze Documents" })
      ).toBeDisabled({
        timeout: 10000,
      });
    });

    test("TC03: Should process different document types correctly", async ({
      page,
    }) => {
      test.setTimeout(300000);
      await page.goto(`${loginUrl}/project/extract`);
      await expect(
        page.getByRole("heading", { name: "Analyze Document - Extract" })
      ).toBeVisible();
      // Process Word document
      let fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByText("Click to upload").click();
      let fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(
        path.join(process.cwd(), "test_data/file-sample_100kB.doc")
      );
      await expect(
        page.getByRole("button", { name: "Analyze Documents" })
      ).toBeDisabled({
        timeout: 10000,
      });

      fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByText("Click to upload").click();
      fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(
        path.join(process.cwd(), "test_data/output_1.pdf")
      );

      await page.getByRole("button", { name: "Analyze Documents" }).click();
      await page
        .getByRole("tab", { name: "Overview" })
        .waitFor({ state: "visible" });
      // await page.getByText("Processing Complete").waitFor({ timeout: 30000 });
      await verifyMetadata(page, {
        "Pages Processed": "2",
        Language: "an",
      });
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
  });
});
