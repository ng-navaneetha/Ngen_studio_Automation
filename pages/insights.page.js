import { test, expect } from '@playwright/test';

class InsightsPage {
  
  constructor(page) {
    this.page = page;
    
    // Main navigation and page elements
    this.insightsLink = page.getByRole('link', { name: 'Insights' });
    this.queryLink = page.getByRole('link', { name: 'Query' });
    this.pulseLink = page.getByRole('link', { name: 'Pulse' });
    this.summaryLink = page.getByRole('link', { name: 'Summary' });

    this.insightsTitle = page.getByRole('heading', { name: 'My Workspaces' });
    this.createButton = page.getByRole('button', { name: 'Create new' });
    this.workspacesList = page.locator('.absolute.inset-0.bg-gradient-to-tr');
    
    // Create workspace dialog elements
    this.workspaceNameInput = page.getByPlaceholder('Enter workspace name');
    this.workspaceDescInput = page.getByPlaceholder('Enter workspace description');
    this.useCaseDropdown = page.getByRole('combobox').filter({ hasText: 'Select use case' });
    this.departmentDropdown = page.getByRole('combobox').filter({ hasText: 'none' });
    this.accessTypeDropdown = page.getByRole('combobox').filter({ hasText: 'Private' });
    this.createWorkspaceButton = page.getByRole('button', { name: 'Create Workspace' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    
    // Database connection elements for Query use case
    // Using role-based selectors for better accessibility and resilience
    this.dbTypeDropdown = page.getByRole('combobox').filter({ hasText: 'Select database type' });
    this.dbHostInput = page.getByRole('textbox', { name: 'Enter database host' });
    this.dbPortInput = page.locator('input[placeholder="Enter port number"]');
    this.dbNameInput = page.getByRole('textbox', { name: 'Enter database name' });
    this.dbUsernameInput = page.getByRole('textbox', { name: 'Enter username' });
    this.dbPasswordInput = page.getByRole('textbox', { name: 'Enter password' });
    this.dbSchemaInput = page.getByRole('textbox', { name: 'Enter schema name' });
    this.embeddingTypeDropdown = page.getByRole('combobox', { name: 'Select embedding type' });
    
    // Error message elements
    this.nameRequiredError = page.getByText('Workplace name, description, department, use case, and access type are required.');
    this.descriptionRequiredError = page.getByText('Workplace name, description, department, use case, and access type are required.');
    this.useCaseRequiredError = page.getByText('Workplace name, description, department, use case, and access type are required.');

    this.dbErrorMessages = page.getByText('The following database fields are required: Database Type, Database Host, Port, Database Name, Username, Password, Schema');
    
    // Workspace elements
    this.searchInput = page.getByPlaceholder('Search');
    this.searchResults = page.locator('div[class*="search-results"]');
    // Changed from function that clicks to locator that can be used in assertions
    this.getFileItem = (filename) => page.locator(`//li[.='${filename}']`)
    // Keep original method but rename for legacy support
    this.clickFileItem = async (filename) => this.getFileItem(filename).locator('div').click();

    this.settingsButton = page.getByRole('button', { name: 'Settings' });
    
    // Delete workspace elements
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Confirm' });
  }

  /**
   * Navigate to the insights page
   */
  async navigateToInsights() {
    try {
      // Check if insights link exists and is visible
      const isInsightsLinkVisible = await this.insightsLink.isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (!isInsightsLinkVisible) {
        console.log('Insights link not visible, trying alternative navigation');
        
      } else {
        // Click the link if it's visible
        await this.insightsLink.click({ timeout: 10000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      }
      
      // Verify we're on the correct page
      await expect(this.insightsTitle).toBeVisible({ timeout: 20000 });
      await expect(this.createButton).toBeVisible({ timeout: 15000 });
      
      console.log('Successfully navigated to Insights page');
    } catch (error) {
      console.error('Failed to navigate to Insights page:', error);
      await this.page.screenshot({ path: `insights-navigation-error-${Date.now()}.png` });
      throw error;
    }
  }

  
  
  async navigateToSummary() {
    try {
        await this.summaryLink.click({ timeout: 10000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (error) {
        console.error('Failed to navigate to Summary page:', error);
        await this.page.screenshot({ path: `summary-navigation-error-${Date.now()}.png` });
        throw error;
      }
    }
    
    async navigateToPulse() {
      try {
        await this.pulseLink.click({ timeout: 10000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (error) {
        console.error('Failed to navigate to Pulse page:', error);
        await this.page.screenshot({ path: `pulse-navigation-error-${Date.now()}.png` });
        throw error;
      }
    }


    //navigate to query
    async navigateToQuery() {
      try {
        await this.queryLink.click({ timeout: 10000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (error) {
        console.error('Failed to navigate to Query page:', error);
        await this.page.screenshot({ path: `query-navigation-error-${Date.now()}.png` });
        throw error;
      }
    }

  /**
   * Click the create new workspace button
   */
  async clickCreateButton() {
    await this.createButton.click();
    await expect(this.workspaceNameInput).toBeVisible();
  }
  /**
   * Click the fillWorkspaceForm
   */

  async selectDepartment(department) {
    await this.departmentDropdown.click();
    await this.page.getByRole('option', { name: department, exact: true }).click();
  }

  async fillWorkspaceForm(name, description, useCase, dbConfig = null) {
    await this.workspaceNameInput.fill(name);
    await this.workspaceDescInput.fill(description);
    
    // Select use case from dropdown
    await this.useCaseDropdown.click();
    await this.page.getByRole('option', { name: useCase ,  exact: true }).click();

    await this.selectDepartment('Dev & Tech');

    // If it's Query use case and dbConfig is provided, fill in database connection details
    if (useCase === 'Query' && dbConfig) {
      await this.fillDatabaseConnectionDetails(dbConfig);
    }
  }
  
  /**
   * Fill database connection details for Query use case
   */
  async fillDatabaseConnectionDetails(dbConfig) {
    await test.step('Select database type', async () => {
      if (dbConfig.DB_TYPE) {
        await this.dbTypeDropdown.click();
        await this.page.getByRole('option', { name: dbConfig.DB_TYPE }).click();
      }
    });
    
    await test.step('Fill connection details', async () => {
      if (dbConfig.DB_HOST) {
        await this.dbHostInput.fill(dbConfig.DB_HOST);
      }
      
      if (dbConfig.DB_PORT) {
        // await this.dbPortInput.clear();
        await this.dbPortInput.fill(dbConfig.DB_PORT.toString());
      }
      
      if (dbConfig.DB_NAME) {
        await this.dbNameInput.fill(dbConfig.DB_NAME);
      }
      
      if (dbConfig.DB_USERNAME) {
        await this.dbUsernameInput.fill(dbConfig.DB_USERNAME);
      }
      
      if (dbConfig.DB_PASSWORD) {
        await this.dbPasswordInput.fill(dbConfig.DB_PASSWORD);
      }
      
      if (dbConfig.DB_SCHEMA) {
        await this.dbSchemaInput.fill(dbConfig.DB_SCHEMA);
      }
    });
    
  }

  /**
   * Confirm workspace creation
   */
  async confirmWorkspaceCreation() {
    await this.createWorkspaceButton.click();
    // Wait for workspace to be created
    await this.page.waitForTimeout(2000);
  }

  /**
   * Cancel workspace creation
   */
  async cancelWorkspaceCreation() {
    await this.cancelButton.click();
  }


  getWorkspaceByName(name) {
    return this.page.getByRole('heading', { name }).first();
  }


  async openWorkspaceByName(name) {
    await this.getWorkspaceByName(name).click();
    // Wait for workspace to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Search within the workspace
   */
  async searchInWorkspace(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    // Wait for search results
    await this.page.waitForTimeout(1000);
  }

  /**
   * Upload a file to the workspace
   */
  async uploadFile(fileName) {

    await this.page.locator('input#upload').setInputFiles(`${fileName}`);

    // Wait for upload to complete
    await this.page.waitForTimeout(2000);
  }

  /**
   * Open workspace settings
   */
  async openWorkspaceSettings() {
    await this.settingsButton.click();
    // Wait for settings panel to open
    await this.page.waitForTimeout(1000);
  }

  /**
   * Update workspace name in settings
   */
  async updateWorkspaceName(newName) {
    const nameInput = this.page.getByLabel('Workspace Name');
    await nameInput.clear();
    await nameInput.fill(newName);
  }

  /**
   * Save workspace settings
   */
  async saveSettings() {
    await this.page.getByRole('button', { name: 'Save' }).click();
    // Wait for settings to be saved
    await this.page.waitForTimeout(2000);
  }

  /**
   * Delete workspace by name
   */
  async deleteWorkspace(workspaceName) {
    // Find workspace by name
 
    
    await this.page.locator('button:has(svg)').nth(2).click();


    await this.page.getByRole('button', { name: 'Delete Workspace'}).first().click();

    // Click delete option
    await this.deleteButton.click();
  }
}

export { InsightsPage };
