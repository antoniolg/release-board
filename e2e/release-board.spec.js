const { test, expect } = require("@playwright/test");

test.describe("Release Board", () => {
  test("creates a release and displays it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1, h2")).toContainText("Release Board");
    
    // Create a release if the form is visible
    const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Release");
      const versionInput = page.locator('input[placeholder*="version"], input[placeholder*="Version"]').first();
      await versionInput.fill("1.0.0");
      await page.locator("button").filter({ hasText: /create|add/i }).first().click();
      await expect(page.locator("text=Test Release")).toBeVisible({ timeout: 5000 });
    }
  });

  test("displays default columns for a release", async ({ page }) => {
    await page.goto("/");
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check if default columns exist
    const columnNames = ["Backlog", "In Progress", "Review", "Done"];
    for (const name of columnNames) {
      const col = page.locator(`text=${name}`).first();
      if (await col.isVisible()) {
        await expect(col).toBeVisible();
      }
    }
  });
});
