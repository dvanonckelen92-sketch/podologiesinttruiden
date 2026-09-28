import type { APIRoute } from 'astro';
import { site } from '../data/site';

// AI-crawlers worden bewust toegelaten: wie niet gecrawld wordt, kan niet
// geciteerd worden in ChatGPT, Perplexity, Copilot of Google AI Overviews.
const bots = [
  'Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot', 'Applebot-Extended', 'Google-Extended',
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'CCBot', 'meta-externalagent',
];

export const GET: APIRoute = () =>
  new Response(
    [
      ...bots.map((b) => `User-agent: ${b}`),
      'Allow: /',
      '',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${site.url}/sitemap.xml`,
      `# Samenvatting voor taalmodellen: ${site.url}/llms.txt`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
