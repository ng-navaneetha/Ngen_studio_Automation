import { loginUrl } from "../constants/login";
import { test, expect } from "../fixtures/sessionFixture";
import { InsightsPage } from "../pages/insights.page";
import { DB_CONFIG } from "../constants/database";
import {
  WORKSPACE_DATA,
  FILES,
  QUESTIONS,
  Response,
  ERROR_MESSAGES,
  ACCESS_TYPES,
} from "../constants/insights_data";

test.describe("Insights Feature Tests", () => {
  let insightsPage;

  test.beforeEach(async ({ page }) => {
    // Initialize InsightsPage with injected page fixture
    insightsPage = new InsightsPage(page);

    console.log("Navigating to application home...");
    await page.goto(`${loginUrl}/project`, { timeout: 60000 });

    // Wait for page to load completely
    await page.waitForLoadState("networkidle");

    // Check if we're on the correct page
    try {
      await expect(
        page.getByRole("heading", { name: /My Workspaces/i })
      ).toBeVisible({ timeout: 10000 });
      console.log("Successfully loaded project page");
    } catch (error) {
      console.log("Project page not loaded, checking authentication...");

      // Check if we're authenticated by looking for the assistant text
      const isAuthenticated = await page
        .getByText(/How can I assist you today\?/i)
        .isVisible({ timeout: 5000 });

      if (isAuthenticated) {
        console.log("Authenticated but not on project page, navigating...");
        await page.goto(`${loginUrl}/project`, { timeout: 60000 });
        await expect(
          page.getByRole("heading", { name: /My Workspaces/i })
        ).toBeVisible({ timeout: 10000 });
      } else {
        console.log(
          "Not authenticated - this should have been handled by fixture"
        );
      }
    }

    // Navigate to Insights page
    await insightsPage.navigateToInsights();
    console.log("Successfully navigated to Insights page");
  });

  test("TC01: Verify user can navigate to Insights page", async ({ page }) => {
    // Verify insights page is loaded with correct elements
    await expect(insightsPage.insightsTitle).toBeVisible();
    await expect(insightsPage.createButton).toBeVisible();
  });

  test("@smoke @e2e @integration TC02: Create workspace with Insights use case", async ({
    page,
  }) => {
    // Create workspace with Insights use case
    const data = WORKSPACE_DATA.INSIGHTS;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify workspace is created successfully
    await expect(page.getByText(data.name)).toBeVisible();
  });

  test("@e2e @integration TC03: Create workspace with Query use case and database connection", async ({
    page,
  }) => {
    await test.step("Create workspace with Query use case", async () => {
      await insightsPage.clickCreateButton();

      const data = WORKSPACE_DATA.QUERY;

      await insightsPage.fillWorkspaceForm(
        data.name,
        data.description,
        data.useCase,
        DB_CONFIG.POSTGRES
      );
      await insightsPage.confirmWorkspaceCreation();

      // Verify success message appears
      await expect(page.getByText(/creating workspace/i)).toBeVisible({
        timeout: 10000,
      });

      await expect(page.getByText(/creating workspace/i)).toBeHidden({
        timeout: 20000,
      });

      await insightsPage.navigateToQuery();
      await expect(insightsPage.getWorkspaceByName(data.name)).toBeVisible();
    });
  });

  test("@e2e @integration TC04: Create workspace with Pulse use case", async ({
    page,
  }) => {
    // Create workspace with Pulse use case
    const data = WORKSPACE_DATA.PULSE;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify workspace is created successfully
    await insightsPage.navigateToPulse();
    await expect(insightsPage.getWorkspaceByName(data.name)).toBeVisible();
  });

  test("@e2e @integration TC05: Create workspace with Summary use case", async ({
    page,
  }) => {
    // Create workspace with Summary use case
    const data = WORKSPACE_DATA.SUMMARY;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Verify workspace is created successfully
    await insightsPage.navigateToSummary();
    await expect(insightsPage.getWorkspaceByName(data.name)).toBeVisible();
  });

  test("@smoke @e2e @integration TC06:Insights use case - Verify workspace functionality - upload document", async ({
    page,
  }) => {
    // Create a workspace first
    const data = WORKSPACE_DATA.UPLOAD_TEST;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Wait for workspace to be created and open it
    await insightsPage.openWorkspaceByName(data.name);

    // Test file upload
    const pdfFile = FILES.PDF;
    await insightsPage.uploadFile(`test_data/${pdfFile}`);

    // Use the new getFileItem method for assertions
    await expect(insightsPage.getFileItem(pdfFile)).toBeVisible();
    await expect(insightsPage.getFileItem(pdfFile)).toContainText(pdfFile);

    await expect(
      page.locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
    ).toBeVisible();
    await page
      .locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
      .click();

    // Delete the workspace
    await insightsPage.deleteWorkspace(data.name);

    // Verify the workspace is no longer visible
    await expect(insightsPage.getWorkspaceByName(data.name)).not.toBeVisible();
  });

  test("TC07: Verify cancel workspace creation", async ({ page }) => {
    // Start creating a workspace but cancel
    const data = WORKSPACE_DATA.CANCEL_TEST;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.cancelWorkspaceCreation();

    // Verify we're back at the insights page and the workspace was not created
    await expect(insightsPage.insightsTitle).toBeVisible();
    await expect(insightsPage.getWorkspaceByName(data.name)).not.toBeVisible();
  });

  test.skip("TC08: Verify sorting functionality", async ({ page }) => {
    await test.step("Sort workspaces by name if available", async () => {
      // Check if sort controls are available
      const sortButton = page.getByRole("button", { name: /sort/i }).first();
      const sortExists = await sortButton.isVisible().catch(() => false);

      if (sortExists) {
        // Click sort button
        await sortButton.click();

        // Look for name sorting option
        const nameSortOption = page
          .getByRole("option", { name: /name/i })
          .first();
        const nameSortExists = await nameSortOption
          .isVisible()
          .catch(() => false);

        if (nameSortExists) {
          await nameSortOption.click();

          // Wait for sorting to apply
          await page.waitForTimeout(1000);

          // Verify page is still showing workspaces
          await expect(insightsPage.insightsTitle).toBeVisible();
        }
      } else {
        test.info("Sort button not found");
      }
    });

    await test.step("Sort workspaces by date if available", async () => {
      // Check if sort controls are available
      const sortButton = page.getByRole("button", { name: /sort/i }).first();
      const sortExists = await sortButton.isVisible().catch(() => false);

      if (sortExists) {
        // Click sort button
        await sortButton.click();

        // Look for date sorting option
        const dateSortOption = page
          .getByRole("option", { name: /date|created/i })
          .first();
        const dateSortExists = await dateSortOption
          .isVisible()
          .catch(() => false);

        if (dateSortExists) {
          await dateSortOption.click();

          // Wait for sorting to apply
          await page.waitForTimeout(1000);

          // Verify page is still showing workspaces
          await expect(insightsPage.insightsTitle).toBeVisible();
        }
      } else {
        test.info("Sort button not found");
      }
    });
  });

  test("TC09: Verify navigation between sections", async ({ page }) => {
    await test.step("Navigate to Query section", async () => {
      await insightsPage.navigateToQuery();

      // Verify Query section is displayed
      await expect(
        page.getByRole("heading", { name: "My Workspaces" })
      ).toBeVisible();
    });

    await test.step("Navigate to Pulse section", async () => {
      await insightsPage.navigateToPulse();

      // Verify Pulse section is displayed
      await expect(
        page.getByRole("heading", { name: "My Workspaces" })
      ).toBeVisible();
    });

    await test.step("Navigate to Summary section", async () => {
      await insightsPage.navigateToSummary();

      // Verify Summary section is displayed
      await expect(
        page.getByRole("heading", { name: "My Workspaces" })
      ).toBeVisible();
    });

    await test.step("Return to Insights section", async () => {
      await insightsPage.navigateToInsights();

      // Verify back on Insights section
      await expect(insightsPage.insightsTitle).toBeVisible();
    });
  });

  test("TC10: Verify workspace details view", async ({ page }) => {
    // Check if any workspace exists to open
    const workspaceExists = await insightsPage.workspacesList
      .first()
      .isVisible()
      .catch(() => false);

    if (!workspaceExists) {
      test.skip("No workspaces available to test details view");
      return;
    }

    await test.step("Open workspace details", async () => {
      // Click on first workspace
      const data = WORKSPACE_DATA.UPLOAD_TEST;
      await insightsPage.clickCreateButton();
      await insightsPage.fillWorkspaceForm(
        data.name,
        data.description,
        data.useCase
      );
      await insightsPage.confirmWorkspaceCreation();

      // Wait for workspace to be created and open it
      await insightsPage.openWorkspaceByName(data.name);
      // Wait for workspace details to load
      await page.waitForLoadState("networkidle");

      // Verify workspace details page is displayed
      const fileResourcesHeading = page.getByRole("heading", {
        name: /File Resources/i,
      });
      await expect(fileResourcesHeading).toBeVisible();
    });

    await test.step("Check workspace details components", async () => {
      // Look for common workspace detail elements

      // Files or documents section
      const filesSection = page.getByText(/files|documents|uploads/i).first();
      const hasFilesSection = await filesSection.isVisible().catch(() => false);

      if (hasFilesSection) {
        test.info("Files/Documents section is displayed");
      }

      // Upload functionality
      const uploadButton = page.getByRole("button", { name: /upload/i });
      const hasUpload = await uploadButton.isVisible().catch(() => false);

      if (hasUpload) {
        test.info("Upload button is displayed");
      }

      // Additional visibility checks as requested
      await expect(page.getByText("Select files to start a")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "File Resources" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Chat History" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Workplace Configuration" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Save Configuration" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Model Configuration" })
      ).toBeVisible();
      await expect(page.getByText("Rewrite Query")).toBeVisible();
      await expect(page.getByText("Reranking")).toBeVisible();

      await expect(
        page.locator(
          "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
        )
      ).toBeVisible();
      await page
        .locator(
          "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
        )
        .click();
  
      // Delete the workspace
      await insightsPage.deleteWorkspace(data.name);
  
      // Verify the workspace is no longer visible
      await expect(insightsPage.getWorkspaceByName(data.name)).not.toBeVisible();
    });
  });

  test("TC11: Verify required fields validation on workspace creation", async ({
    page,
  }) => {
    // Try to create workspace with missing fields
    await insightsPage.clickCreateButton();
    // Leave fields empty
    await insightsPage.confirmWorkspaceCreation();

    // Verify error messages are shown
    await expect(insightsPage.nameRequiredError).toBeVisible();
    await expect(insightsPage.descriptionRequiredError).toBeVisible();
    await expect(insightsPage.useCaseRequiredError).toBeVisible();
  });

  test("TC13: Verify required fields validation on query workspace creation", async ({
    page,
  }) => {
    // Try to create workspace with missing fields
    const data = WORKSPACE_DATA.QUERY;
    await insightsPage.clickCreateButton();
    await insightsPage.workspaceNameInput.fill(data.name);
    await insightsPage.workspaceDescInput.fill(data.description);

    // Select use case from dropdown
    await insightsPage.useCaseDropdown.click();
    await page.getByRole("option", { name: data.useCase, exact: true }).click();
    // Leave fields empty
    await insightsPage.confirmWorkspaceCreation();

    // Verify error messages are shown
    await expect(insightsPage.dbErrorMessages).toBeVisible();
  });

  test("TC14: Verify workspace deletion", async ({ page }) => {
    // Create a workspace first
    const data = WORKSPACE_DATA.DELETE_TEST;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    await expect(
      page.locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
    ).toBeVisible();
    await page
      .locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
      .click();

    // Delete the workspace
    await insightsPage.deleteWorkspace(data.name);

    // Verify the workspace is no longer visible
    await expect(insightsPage.getWorkspaceByName(data.name)).not.toBeVisible();
  });

  test("@e2e @integration TC15: Verify file upload, chat, and new chat flow", async ({
    page,
  }) => {
    test.setTimeout(240000); // Set the timeout for this test
    const data = WORKSPACE_DATA.UPLOAD_TEST;
    await insightsPage.clickCreateButton();
    await insightsPage.fillWorkspaceForm(
      data.name,
      data.description,
      data.useCase
    );
    await insightsPage.confirmWorkspaceCreation();

    // Wait for workspace to be created and open it
    await insightsPage.openWorkspaceByName(data.name);

    // Verify the textbox is disabled when no file is uploaded
    const messageTextbox = page.getByRole("textbox", { name: "Type your message and press" });
    await expect(messageTextbox).toBeDisabled();

    // Test file upload
    const InsightsPDF = FILES.InsightsPDF;
    await insightsPage.uploadFile(`test_data/${InsightsPDF}`);

    // Use the new getFileItem method for assertions
    await expect(insightsPage.getFileItem(InsightsPDF)).toBeVisible();
    await expect(insightsPage.getFileItem(InsightsPDF)).toContainText(InsightsPDF);

    const fileItem = insightsPage.getFileItem(InsightsPDF);

    // Find the checkbox inside the file item and check it
    const checkbox = fileItem.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();


    await checkbox.check();

    // Interact with chat
    await page
      .getByRole("textbox", { name: "Type your message and press" })
      .click();
    await page
      .getByRole("textbox", { name: "Type your message and press" })
      .fill(QUESTIONS[1]);
    await page
      .getByRole("textbox", { name: "Type your message and press" })
      .press("Enter");

    // Handle response message if appears
    // Debugging: Log page content before waiting for the response

    // Retry logic for waiting for the response
    for (let i = 0; i < 3; i++) {
      try {
        await page.getByText(Response[1], { exact: false }).waitFor({ timeout: 150000 }); // Retry with a timeout of 60 seconds
        break; // Exit loop if successful
      } catch (error) {
        console.error(`Retry ${i + 1} failed:`, error);
        if (i === 2) throw error; // Throw error after 3 retries
      }
    }

    const responseMessage = page.getByText(Response[1], { exact: false });
    await expect(responseMessage).toContainText(Response[1]);

    // Start a new chat
    await page.getByRole("button", { name: "New Chat" }).click();
    await page
      .getByRole("textbox", { name: "Type your message and press" })
      .click();
    await page
      .getByRole("textbox", { name: "Type your message and press" })
      .fill(QUESTIONS[3]);
    await page.getByRole("button", { name: "Send" }).click();

    await page.getByText(Response[3], { exact: false }).waitFor();
    const responseMessage2 = page.getByText(Response[3], { exact: false });
    await expect(responseMessage2).toContainText(Response[3]);

    // Assert chat textbox is visible after new chat
    await expect(
      page.getByRole("textbox", { name: "Type your message and press" })
    ).toBeVisible();
    // Assert file is still present
    await expect(insightsPage.getFileItem(InsightsPDF)).toBeVisible();

    // Refresh the page
    await page.reload();

    // Verify chat history is visible
    await expect(page.getByRole("heading", { name: "Chat History" })).toBeVisible();
    await expect(page.getByText(QUESTIONS[1])).toBeVisible();
    await expect(page.getByText(QUESTIONS[3])).toBeVisible();

    await expect(
      page.locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
    ).toBeVisible();
    await page
      .locator(
        "(//button[contains(@class, 'inline-flex') and contains(@class, 'items-center')])[3]"
      )
      .click();

    // Delete the workspace
    await insightsPage.deleteWorkspace(data.name);

    // Verify the workspace is no longer visible
    await expect(insightsPage.getWorkspaceByName(data.name)).not.toBeVisible();
  });

 
});
