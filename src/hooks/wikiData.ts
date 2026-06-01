export interface WikiData {
  imageUrl: string | null;
  wikiSummary: string;
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  const key = import.meta.env.VITE_PEXELS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: key } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large) ?? null;
  } catch {
    return null;
  }
}

async function fetchWikiSummary(nameEn: string): Promise<string> {
  try {
    const slug = encodeURIComponent(nameEn.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.extract || '';
  } catch {
    return '';
  }
}

export async function fetchWikiData(nameEn: string): Promise<WikiData | null> {
  const [imageUrl, wikiSummary] = await Promise.all([
    fetchPexelsImage(nameEn),
    fetchWikiSummary(nameEn),
  ]);
  return { imageUrl, wikiSummary };
}
