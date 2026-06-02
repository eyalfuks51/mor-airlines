import { expect, test } from '@playwright/test';
import { fetchWikiData, shouldFetchDestinationMedia } from '../src/hooks/wikiData';
import type { Destination } from '../src/data/destinations';

const makeDestination = (overrides: Partial<Destination>): Destination => ({
  id: 'test-destination',
  nameHe: 'יעד בדיקה',
  nameEn: 'Test Destination',
  lat: 0,
  lng: 0,
  vibeTags: ['city'],
  state: 'dream',
  starred: false,
  source: 'seed',
  updatedAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
});

test('falls back to Wikipedia original image when Pexels has no photo', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.startsWith('/api/pexels')) {
      return Response.json({ url: null });
    }
    if (url.startsWith('https://en.wikipedia.org/api/rest_v1/page/summary/')) {
      return Response.json({
        extract: 'A cached encyclopedia summary.',
        originalimage: { source: 'https://upload.wikimedia.org/test.jpg' },
      });
    }
    return new Response(null, { status: 404 });
  };

  try {
    await expect(fetchWikiData('Cappadocia')).resolves.toEqual({
      imageUrl: 'https://upload.wikimedia.org/test.jpg',
      wikiSummary: 'A cached encyclopedia summary.',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requests destination media when a summary is cached but the image is missing', () => {
  expect(shouldFetchDestinationMedia(makeDestination({
    wikiSummary: 'Already cached summary.',
  }))).toBe(true);

  expect(shouldFetchDestinationMedia(makeDestination({
    imageUrl: 'https://images.pexels.com/photo.jpg',
    wikiSummary: 'Already cached summary.',
  }))).toBe(false);
});

test('retries Pexels when the cached image is a Wikipedia fallback', () => {
  expect(shouldFetchDestinationMedia(makeDestination({
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/test.jpg',
    wikiSummary: 'Already cached summary.',
  }))).toBe(true);
});
