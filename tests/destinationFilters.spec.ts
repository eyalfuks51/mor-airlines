import { test, expect } from '@playwright/test';
import { getTravelDistanceTag, matchesVibeFilters } from '../src/utils/destinationFilters';
import type { Destination } from '../src/data/destinations';

const makeDestination = (
  overrides: Pick<Destination, 'lat' | 'lng' | 'vibeTags'> & Partial<Destination>,
): Destination => ({
  id: overrides.id ?? 'test-destination',
  nameHe: overrides.nameHe ?? 'Test destination',
  nameEn: overrides.nameEn ?? 'Test Destination',
  lat: overrides.lat,
  lng: overrides.lng,
  vibeTags: overrides.vibeTags,
  state: overrides.state ?? 'dream',
  starred: overrides.starred ?? false,
  source: overrides.source ?? 'seed',
  updatedAt: overrides.updatedAt ?? '2026-06-01T00:00:00.000Z',
});

test('classifies nearby Mediterranean and short Europe flights as near', () => {
  expect(getTravelDistanceTag(makeDestination({
    nameEn: 'Cyprus',
    lat: 35.1264,
    lng: 33.4299,
    vibeTags: ['beach'],
  }))).toBe('near');

  expect(getTravelDistanceTag(makeDestination({
    nameEn: 'Rome',
    lat: 41.9028,
    lng: 12.4964,
    vibeTags: ['city', 'food'],
  }))).toBe('near');
});

test('classifies flights above the short-haul threshold as far', () => {
  expect(getTravelDistanceTag(makeDestination({
    nameEn: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    vibeTags: ['city', 'food'],
  }))).toBe('far');

  expect(getTravelDistanceTag(makeDestination({
    nameEn: 'London',
    lat: 51.5074,
    lng: -0.1278,
    vibeTags: ['city'],
  }))).toBe('far');
});

test('treats near and far as a distance axis, not manual vibe tags', () => {
  const tokyo = makeDestination({
    nameEn: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    vibeTags: ['city', 'food'],
  });

  expect(matchesVibeFilters(tokyo, ['far'])).toBe(true);
  expect(matchesVibeFilters(tokyo, ['near'])).toBe(false);
});

test('combines regular vibe tags with near or far using AND semantics', () => {
  const cyprusBeach = makeDestination({
    nameEn: 'Cyprus',
    lat: 35.1264,
    lng: 33.4299,
    vibeTags: ['beach', 'food'],
  });
  const baliBeach = makeDestination({
    nameEn: 'Bali',
    lat: -8.4095,
    lng: 115.1889,
    vibeTags: ['beach', 'adventure', 'food'],
  });

  expect(matchesVibeFilters(cyprusBeach, ['beach', 'near'])).toBe(true);
  expect(matchesVibeFilters(baliBeach, ['beach', 'near'])).toBe(false);
  expect(matchesVibeFilters(baliBeach, ['beach', 'far'])).toBe(true);
  expect(matchesVibeFilters(cyprusBeach, ['city', 'near'])).toBe(false);
});
