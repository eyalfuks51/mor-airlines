import type { Destination } from '../data/destinations';

export interface WikiData {
  imageUrl: string | null;
  wikiSummary: string;
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.url as string | null) ?? null;
  } catch {
    return null;
  }
}

async function fetchWikipediaData(nameEn: string): Promise<WikiData> {
  try {
    const slug = encodeURIComponent(nameEn.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    if (!res.ok) return { imageUrl: null, wikiSummary: '' };
    const data = await res.json();
    return {
      imageUrl: data.originalimage?.source ?? data.thumbnail?.source ?? null,
      wikiSummary: data.extract || '',
    };
  } catch {
    return { imageUrl: null, wikiSummary: '' };
  }
}

function isWikipediaFallbackImage(imageUrl: string): boolean {
  try {
    return new URL(imageUrl).hostname === 'upload.wikimedia.org';
  } catch {
    return false;
  }
}

export function shouldFetchDestinationMedia(destination: Pick<Destination, 'imageUrl'>): boolean {
  return !destination.imageUrl || isWikipediaFallbackImage(destination.imageUrl);
}

export async function fetchWikiData(nameEn: string): Promise<WikiData | null> {
  const [pexelsImageUrl, wikipediaData] = await Promise.all([
    fetchPexelsImage(nameEn),
    fetchWikipediaData(nameEn),
  ]);
  return {
    imageUrl: pexelsImageUrl ?? wikipediaData.imageUrl,
    wikiSummary: wikipediaData.wikiSummary,
  };
}
