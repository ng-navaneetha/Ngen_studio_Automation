import { test, expect } from '../fixtures/sessionFixture.js';
import { loginUrl } from '../constants/login.js';
import { WORKSPACE_DATA } from '../constants/insights_data.js';

test.describe.configure({ timeout: 2400000 });

test.describe('Workspace Cleanup', () => {
  test("Delete all workspaces matching project names", async ({ page }) => {
    console.log("🧹 Starting comprehensive workspace cleanup...");
    
    // Function to delete all workspaces with matching name from a specific page
    async function deleteAllWorkspacesWithName(page, workspaceName, pageUrl, pageType) {
      console.log(`🔍 Checking ${pageType} page for workspaces named: "${workspaceName}"`);
      
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      try {
        // Find all workspaces with the matching name
        const workspaceHeadings = page.locator(`h3:has-text("${workspaceName}")`);
        const count = await workspaceHeadings.count();
        
        if (count === 0) {
          console.log(`✅ No workspaces found with name "${workspaceName}" on ${pageType} page`);
          return;
        }
        
        console.log(`🗑️ Found ${count} workspace(s) with name "${workspaceName}" on ${pageType} page`);
        
        // Delete each workspace found
        for (let i = 0; i < count-1; i++) {
          try {
            // Re-query to get fresh locators (DOM might have changed after deletions)
            const currentWorkspaces = page.locator(`h3:has-text("${workspaceName}")`);
            const currentCount = await currentWorkspaces.count();
            
            if (currentCount === 1) {
              console.log(`✅ All workspaces with name "${workspaceName}" have been deleted from ${pageType}`);
              break;
            }
            
            // Always work with the first matching workspace
            const workspaceHeading = currentWorkspaces.first();
            const workspaceCard = workspaceHeading.locator('xpath=ancestor::div[contains(@class, "group") or contains(@class, "card") or contains(@class, "workspace")]').first();
            
            console.log(`🗑️ Deleting workspace ${i + 1}/${count}: "${workspaceName}" from ${pageType}`);
            
            // Find and click the delete/menu button
            const deleteMenuButton = workspaceCard.locator('button:has(svg)').last();
            await deleteMenuButton.click();
            
            // Wait for delete confirmation dialog
            await page.waitForSelector('button:has-text("Delete")', { timeout: 5000 });
            await page.getByRole("button", { name: "Delete" }).first().click();

            // Confirm deletion
            await page.waitForSelector('button:has-text("Delete"):not(:has-text("Workspace"))', { timeout: 5000 });
            await page.getByRole("button", { name: "Delete" }).click();
            
            // Wait for deletion to complete
            await page.waitForTimeout(2000); // Give some time for the deletion to process
            
            console.log(`✅ Successfully deleted workspace "${workspaceName}" from ${pageType}`);
            
          } catch (error) {
            console.log(`⚠️ Error deleting workspace ${i + 1} with name "${workspaceName}" from ${pageType}: ${error.message}`);
          }
        }
        
        // Final verification that all matching workspaces are gone
        const remainingWorkspaces = await page.locator(`h3:has-text("${workspaceName}")`).count();
        if (remainingWorkspaces === 0) {
          console.log(`✅ Verified: All workspaces with name "${workspaceName}" removed from ${pageType}`);
        } else {
          console.log(`⚠️ Warning: ${remainingWorkspaces} workspace(s) with name "${workspaceName}" still remain on ${pageType}`);
        }
        
      } catch (error) {
        console.log(`⚠️ Error during cleanup on ${pageType} page: ${error.message}`);
      }
    }
    
    // Delete all Insights workspaces from /project
    const insightsWorkspaceName = WORKSPACE_DATA.INSIGHTSEnterpriseSearch.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      insightsWorkspaceName, 
      `${loginUrl}/project`, 
      "insights Project"
    );
    const insightsWorkspaceName1 = WORKSPACE_DATA.INSIGHTSWorkspace.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      insightsWorkspaceName1, 
      `${loginUrl}/project`, 
      "insights Project"
    );
    const insightsWorkspaceName2 = WORKSPACE_DATA.UPLOAD_TEST.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      insightsWorkspaceName2, 
      `${loginUrl}/project`, 
      "insights Project"
    );
    
    // Delete all Query workspaces from /project/query
    const queryWorkspaceName = WORKSPACE_DATA.QUERYEnterpriseSearch.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      queryWorkspaceName, 
      `${loginUrl}/project/query?tab=text2sql`, 
      "query Project"
    );
    const queryneon = WORKSPACE_DATA.QUERYNeon.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      queryneon, 
      `${loginUrl}/project/query?tab=text2sql`, 
      "query Project"
    );
    
    // Delete all Insights workspaces from /project
    const summaryWorkspaceName = WORKSPACE_DATA.SUMMARYEnterpriseSearch.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      summaryWorkspaceName, 
      `${loginUrl}/project/summary`, 
      "summary Project"
    );
    
    // Delete all Query workspaces from /project/query
    const pulseWorkspaceName = WORKSPACE_DATA.PULSEEnterpriseSearch.name.trim();
    await deleteAllWorkspacesWithName(
      page, 
      pulseWorkspaceName, 
      `${loginUrl}/project/pulse`, 
      "pulse Project"
    );
    
    console.log("🎉 Comprehensive workspace cleanup completed!");
  });
});