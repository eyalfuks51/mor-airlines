import { expect, test } from '@playwright/test';
import { isAllowedPexelsReferer } from '../api/pexels.js';

test('allows production, localhost, and Mor Airlines Vercel preview referers', () => {
  expect(isAllowedPexelsReferer('https://mor-airlines.vercel.app/')).toBe(true);
  expect(isAllowedPexelsReferer('http://localhost:5173/')).toBe(true);
  expect(isAllowedPexelsReferer('https://mor-airlines-8vf57x1d6-eyalfuks51s-projects.vercel.app/')).toBe(true);
});

test('rejects unrelated referers', () => {
  expect(isAllowedPexelsReferer('https://example.com/')).toBe(false);
  expect(isAllowedPexelsReferer('https://not-mor-airlines-8vf57x1d6-eyalfuks51s-projects.vercel.app/')).toBe(false);
});
