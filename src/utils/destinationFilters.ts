import type { Destination, VibeTag } from '../data/destinations';

const BEN_GURION = {
  lat: 32.0114,
  lng: 34.8867,
};

// Roughly maps to a four-hour short-haul flight from Ben Gurion.
const SHORT_FLIGHT_DISTANCE_KM = 3000;

export const REGULAR_VIBE_TAGS: VibeTag[] = ['beach', 'city', 'adventure', 'food'];
export const DISTANCE_VIBE_TAGS: VibeTag[] = ['near', 'far'];

export function isRegularVibeTag(tag: VibeTag): boolean {
  return REGULAR_VIBE_TAGS.includes(tag);
}

export function getTravelDistanceTag(destination: Pick<Destination, 'lat' | 'lng'>): Extract<VibeTag, 'near' | 'far'> {
  return getDistanceFromIsraelKm(destination) <= SHORT_FLIGHT_DISTANCE_KM ? 'near' : 'far';
}

export function matchesVibeFilters(destination: Destination, activeVibes: VibeTag[]): boolean {
  if (activeVibes.length === 0) return true;

  const regularFilters = activeVibes.filter(isRegularVibeTag);
  const distanceFilters = activeVibes.filter(tag => DISTANCE_VIBE_TAGS.includes(tag));

  const regularMatch =
    regularFilters.length === 0 ||
    regularFilters.some(tag => destination.vibeTags.includes(tag));

  const distanceMatch =
    distanceFilters.length === 0 ||
    distanceFilters.includes(getTravelDistanceTag(destination));

  return regularMatch && distanceMatch;
}

function getDistanceFromIsraelKm(destination: Pick<Destination, 'lat' | 'lng'>): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - BEN_GURION.lat);
  const dLng = toRadians(destination.lng - BEN_GURION.lng);
  const originLat = toRadians(BEN_GURION.lat);
  const destLat = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destLat) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
