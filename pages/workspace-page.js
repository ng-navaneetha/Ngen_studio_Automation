import { expect } from '@playwright/test';

/**
 * Page object representing the workspace management page
 */
export class WorkspacePage {
  constructor(page) {
    this.page = page;
    this.createNewButton = page.getByRole('button', { name: 'Create New' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.confirmCancelButton = page.getByRole('button', { name: 'Yes, cancel' });
    this.fileUploadInput = page.getByLabel('Upload File');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Confirm Delete' });
    this.projectList = page.getByRole('list', { name: 'Projects' });
    this.successMessage = page.getByRole('alert').filter({ hasText: /success/i });
    this.errorMessage = page.getByRole('alert').filter({ hasText: /error|denied/i });
  }

  async goto() {
    await this.page.goto('/workspace');
  }

  async startNewWorkspaceCreation() {
    await this.createNewButton.click();
  }

  async uploadFile(filePath) {
    await this.fileUploadInput.setInputFiles(filePath);
    await this.nextButton.click();
  }

  async cancelWorkspaceCreation() {
    await this.cancelButton.click();
    await this.confirmCancelButton.click();
  }

  async createWorkspace() {
    await this.createButton.click();
  }

  async deleteProject(projectName) {
    const projectItem = this.page.getByRole('listitem', { name: projectName });
    await projectItem.hover();
    await projectItem.getByRole('button', { name: 'Delete' }).click();
    await this.confirmDeleteButton.click();
  }

  async expectProjectExists(projectName) {
    await expect(this.page.getByRole('listitem', { name: projectName })).toBeVisible();
  }

  async expectProjectNotExists(projectName) {
    await expect(this.page.getByRole('listitem', { name: projectName })).not.toBeVisible();
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectErrorMessage(message) {
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    } else {
      await expect(this.errorMessage).toBeVisible();
    }
  }
}
