import { expect, test } from '@playwright/test';

test('passport tabs and stamps are wired to the staged reveal effect', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '📔 דרכון' }).click();
  await expect(page.getByRole('heading', { name: 'כל החותמות' })).toBeVisible();

  await expect(page.locator('[data-passport-motion="tab"]')).toHaveCount(5);
  await expect(page.locator('[data-passport-motion="stamp"]').first()).toBeVisible();
});
