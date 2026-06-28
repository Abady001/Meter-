async (page) => {
  const results = [];
  
  // Navigate to Customers page and wait for full load
  await page.click('button:has-text("Customers")');
  await page.waitForTimeout(8000);
  
  // Find the Actions dropdown trigger in the first row
  const actionsTrigger = page.locator('[role="row"] button, td:last-child button, [class*="DropdownMenuTrigger"]').first();
  if (await actionsTrigger.isVisible().catch(() => false)) {
    await actionsTrigger.click();
    await page.waitForTimeout(500);
    const menuItems = await page.locator('[role="menuitem"], [role="option"]').allTextContents();
    results.push(`CUSTOMERS Dropdown items: ${menuItems.join(', ')}`);
    
    // Try clicking View
    const viewItem = page.locator('[role="menuitem"]:has-text("View"), [role="option"]:has-text("View")');
    if (await viewItem.isVisible().catch(() => false)) {
      await viewItem.click();
      await page.waitForTimeout(2000);
      const body = await page.textContent('main');
      results.push(`CUSTOMERS View clicked → ${body.substring(0, 200)}`);
    }
  }
  
  // Back to Customers list
  await page.click('button:has-text("Customers")');
  await page.waitForTimeout(3000);
  
  // Try Add Customer
  await page.click('button:has-text("Add Customer")');
  await page.waitForTimeout(2000);
  
  // Check what's on screen now - dialog or form fields
  const dialogs = await page.locator('[role="dialog"], [class*="modal"], [class*="overlay"]').count();
  const mainContent = await page.textContent('main');
  const bodyContent = await page.textContent('body');
  results.push(`CUSTOMERS Add: dialogs=${dialogs}, main_len=${mainContent.length}, body_len=${bodyContent.length}`);
  
  // Check for form fields
  const formInputs = await page.locator('form input, [role="dialog"] input, [class*="modal"] input').count();
  results.push(`CUSTOMERS Add: form_inputs=${formInputs}`);
  
  // Press Escape to dismiss any modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // === PROJECTS: Test row actions ===
  await page.click('button:has-text("Projects")');
  await page.waitForTimeout(4000);
  const projActions = page.locator('[role="row"] button, td:last-child button, [class*="DropdownMenuTrigger"]').first();
  if (await projActions.isVisible().catch(() => false)) {
    await projActions.click();
    await page.waitForTimeout(500);
    const projMenu = await page.locator('[role="menuitem"], [role="option"]').allTextContents();
    results.push(`PROJECTS Dropdown items: ${projMenu.join(', ')}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  
  // Create Project button test
  const createBtn = page.locator('button:has-text("Create Project")');
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(2000);
    const projDialogs = await page.locator('[role="dialog"], [class*="modal"], [class*="overlay"]').count();
    results.push(`PROJECTS Create: dialogs=${projDialogs}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
  
  return results.join('\n');
}