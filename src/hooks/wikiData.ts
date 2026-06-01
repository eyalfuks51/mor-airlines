export interface WikiData {
  imageUrl: string | null;
  wikiSummary: string;
}

export async function fetchWikiData(nameEn: string): Promise<WikiData | null> {
  try {
    const slug = encodeURIComponent(nameEn.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      imageUrl: data.thumbnail?.source ?? null,
      wikiSummary: data.extract || '',
    };
  } catch {
    return null;
  }
}
