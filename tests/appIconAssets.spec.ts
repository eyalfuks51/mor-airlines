import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

test('app shell and PWA config use the PNG logo assets', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/icon.png');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/png');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');

  const viteConfig = await readFile('vite.config.ts', 'utf8');

  expect(viteConfig).toContain("includeAssets: ['apple-touch-icon.png', 'icon.png', 'mor-airlines-logo.png']");
  expect(viteConfig).toContain("src: 'pwa-192.png'");
  expect(viteConfig).toContain("src: 'pwa-512.png'");
  expect(viteConfig).toContain("type: 'image/png'");
  expect(viteConfig).toContain("purpose: 'any maskable'");
  expect(viteConfig).not.toContain('icon.svg');
});

test('generated logo assets are square and sized for their install targets', async () => {
  const expectedAssets = [
    ['public/mor-airlines-logo.png', 1254],
    ['public/icon.png', 512],
    ['public/pwa-512.png', 512],
    ['public/pwa-192.png', 192],
    ['public/apple-touch-icon.png', 180],
  ] as const;

  for (const [assetPath, size] of expectedAssets) {
    const metadata = await sharp(assetPath).metadata();

    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(size);
    expect(metadata.height).toBe(size);
  }
});
