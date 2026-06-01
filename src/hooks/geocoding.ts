export interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
}

export async function geocodePlace(query: string): Promise<GeocodingResult | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return null;
    return { lat: r.latitude, lng: r.longitude, name: r.name };
  } catch {
    return null;
  }
}
