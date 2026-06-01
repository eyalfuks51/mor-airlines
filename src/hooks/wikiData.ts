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
