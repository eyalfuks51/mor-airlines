export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? '';
  if (!query) return Response.json({ url: null });

  const key = process.env.PEXELS_API_KEY;
  if (!key) return Response.json({ url: null });

  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: key } },
    );
    if (!r.ok) return Response.json({ url: null });
    const data = await r.json();
    const url = data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large ?? null;
    return Response.json({ url });
  } catch {
    return Response.json({ url: null });
  }
}
