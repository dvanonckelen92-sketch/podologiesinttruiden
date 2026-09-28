import type { APIRoute } from 'astro';
import { site, pages } from '../data/site';

// lastmod komt per pagina uit site.ts, niet uit de builddatum. Zo blijft het
// veld betrouwbaar voor crawlers.
export const GET: APIRoute = () => {
  const urls = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${new URL(p.path, site.url).href}</loc>\n    <lastmod>${p.updated}</lastmod>\n    <priority>${p.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
