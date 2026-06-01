export const config = { runtime: 'edge' };

const ALLOWED_ORIGINS = [
  'https://mor-airlines.vercel.app',
  'http://localhost',
];

export default async function handler(req) {
  const referer = req.headers.get('referer') ?? '';
  if (referer && !ALLOWED_ORIGINS.some((o) => referer.startsWith(o))) {
    return new Response('Forbidden', { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('query') ?? '';
  const query = raw.slice(0, 100).trim();
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
