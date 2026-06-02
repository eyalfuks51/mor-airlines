import { expect, test } from '@playwright/test';

test('passport tabs and stamps are wired to the staged reveal effect', async ({ page }) => {
  const duplicateKeyErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('same key')) {
      duplicateKeyErrors.push(message.text());
    }
  });

  await page.goto('/');

  await page.getByRole('button', { name: '📔 דרכון' }).click();
  await expect(page.getByRole('heading', { name: 'כל החותמות' })).toBeVisible();
  await page.waitForTimeout(300);

  await expect(page.locator('[data-passport-motion="tab"]')).toHaveCount(5);
  await expect(page.locator('[data-passport-motion="stamp"]').first()).toBeVisible();
  expect(duplicateKeyErrors).toEqual([]);
});

test('passport reveal remains visibly in motion long enough to notice', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '📔 דרכון' }).click();
  await page.waitForSelector('[data-passport-motion="stamp"]', { state: 'attached' });
  await page.waitForTimeout(80);

  const firstStampStyle = await page.locator('[data-passport-motion="stamp"]').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      filter: style.filter,
      opacity: Number(style.opacity),
    };
  });

  expect(firstStampStyle.opacity).toBeLessThan(0.96);
  expect(firstStampStyle.filter).not.toBe('blur(0px)');
});
