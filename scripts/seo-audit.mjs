/**
 * Statische SEO-audit van een gebouwde site.
 *
 *   node seo-audit.mjs <dist-map> [--brand-suffix " | Merknaam"]
 *
 * Leest alle .html-bestanden onder de opgegeven map en rapporteert de dingen
 * die je met het blote oog over het hoofd ziet zodra een site meer dan tien
 * pagina's heeft: te lange titles, dubbele descriptions, koppen die een niveau
 * overslaan, afbeeldingen zonder alt, dode interne links en de verdeling van
 * interne linkkracht.
 *
 * Bewust zonder dependencies: regexen over statische HTML zijn hier goed genoeg
 * en het script moet in elk project zonder installatie kunnen draaien.
 */
import fs from 'fs';
import path from 'path';

const dist = process.argv[2];
if (!dist || !fs.existsSync(dist)) {
  console.error('Gebruik: node seo-audit.mjs <dist-map> [--brand-suffix " | Merknaam"]');
  process.exit(1);
}
const suffixArg = process.argv.indexOf('--brand-suffix');
const brandSuffix = suffixArg > -1 ? process.argv[suffixArg + 1] : '';

const LIMITS = { titleMax: 60, titleMin: 30, descMax: 160, descMin: 110 };

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []
  );
}

const pages = [];
for (const file of walk(dist)) {
  const h = fs.readFileSync(file, 'utf8');
  const rel =
    '/' +
    path
      .relative(dist, file)
      .split(path.sep)
      .join('/')
      .replace(/\.html$/, '')
      .replace(/(^|\/)index$/, '$1');
  const one = (re) => (h.match(re) || [])[1] || '';

  // Let op: `alt` zonder waarde is geldige HTML en betekent alt="". Dat is de
  // juiste manier om een decoratieve afbeelding te markeren, dus die mag hier
  // niet als fout binnenlopen. Vandaar \balt\b en niet \balt\s*=.
  const imgs = [...h.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);

  pages.push({
    rel: rel === '/' ? '/' : rel.replace(/\/$/, ''),
    title: one(/<title>([^<]*)<\/title>/),
    desc: one(/<meta name="description" content="([^"]*)"/),
    canonical: one(/<link rel="canonical" href="([^"]*)"/),
    ogImage: one(/<meta property="og:image" content="([^"]*)"/),
    ogTitle: one(/<meta property="og:title" content="([^"]*)"/),
    twitter: one(/<meta name="twitter:card" content="([^"]*)"/),
    robots: one(/<meta name="robots" content="([^"]*)"/),
    lang: one(/<html[^>]*lang="([^"]*)"/),
    viewport: /<meta name="viewport"/.test(h),
    h1s: [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()),
    headings: [...h.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({
      lvl: +m[1],
      text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    })),
    imgCount: imgs.length,
    imgNoAlt: imgs.filter((t) => !/\balt\b/.test(t)).length,
    imgNoDims: imgs.filter((t) => !/\bwidth\s*=/.test(t) || !/\bheight\s*=/.test(t)).length,
    schema: schemaTypes(h),
    links: [...h.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]),
    words: wordCount(h),
  });
}

function schemaTypes(h) {
  const out = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const collect = (o) => {
        if (Array.isArray(o)) return o.forEach(collect);
        if (o && typeof o === 'object') {
          if (o['@type']) out.push(Array.isArray(o['@type']) ? o['@type'].join('/') : o['@type']);
          if (o['@graph']) collect(o['@graph']);
        }
      };
      collect(JSON.parse(m[1]));
    } catch {
      out.push('PARSE_ERROR');
    }
  }
  return out;
}

/** Zichtbare woorden, zonder header en footer: dat is wat de bezoeker leest. */
function wordCount(h) {
  const body = h
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');
  return body.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').split(/\s+/).filter(Boolean).length;
}

const routes = new Set(pages.map((p) => p.rel));
const indexable = pages.filter((p) => !/noindex/.test(p.robots));
const section = (t) => console.log(`\n=== ${t} ===`);

console.log(`Pagina's: ${pages.length} (indexeerbaar: ${indexable.length})`);

section('META-PROBLEMEN (alleen indexeerbare pagina\'s)');
let metaIssues = 0;
for (const p of indexable) {
  const iss = [];
  if (!p.title) iss.push('geen title');
  else if (p.title.length > LIMITS.titleMax) iss.push(`title ${p.title.length} tekens`);
  else if (p.title.length < LIMITS.titleMin) iss.push(`title kort (${p.title.length})`);
  if (!p.desc) iss.push('geen description');
  else if (p.desc.length > LIMITS.descMax) iss.push(`desc ${p.desc.length} tekens`);
  else if (p.desc.length < LIMITS.descMin) iss.push(`desc kort (${p.desc.length})`);
  if (!p.canonical) iss.push('geen canonical');
  if (!p.ogTitle) iss.push('geen og:title');
  if (!p.ogImage) iss.push('geen og:image');
  if (!p.twitter) iss.push('geen twitter:card');
  if (!p.viewport) iss.push('geen viewport');
  if (!p.lang) iss.push('geen lang-attribuut');
  if (p.h1s.length !== 1) iss.push(`${p.h1s.length} h1`);
  if (iss.length) {
    metaIssues++;
    console.log(p.rel.padEnd(52), iss.join(' | '));
  }
}
if (!metaIssues) console.log('geen');

if (brandSuffix) {
  section(`SEOTITLE-BUDGET (suffix "${brandSuffix}" = ${brandSuffix.length} tekens)`);
  console.log(`Houd de losse seoTitle onder ${LIMITS.titleMax - brandSuffix.length} tekens.`);
}

section('DUBBELE TITLES EN DESCRIPTIONS');
let dupes = 0;
for (const key of ['title', 'desc']) {
  const m = {};
  indexable.forEach((p) => p[key] && (m[p[key]] ||= []).push(p.rel));
  Object.entries(m)
    .filter(([, v]) => v.length > 1)
    .forEach(([k, v]) => {
      dupes++;
      console.log(`${key}: "${k.slice(0, 55)}" -> ${v.join(', ')}`);
    });
}
if (!dupes) console.log('geen');

section('KOPPENHIERARCHIE');
let headIssues = 0;
for (const p of pages) {
  let prev = 0;
  const bad = [];
  for (const h of p.headings) {
    if (prev && h.lvl > prev + 1) bad.push(`h${prev} -> h${h.lvl} "${h.text.slice(0, 35)}"`);
    if (!h.text) bad.push(`lege h${h.lvl}`);
    prev = h.lvl;
  }
  if (bad.length) {
    headIssues++;
    console.log(p.rel.padEnd(52), bad.slice(0, 3).join(' | '));
  }
}
if (!headIssues) console.log('geen');

section('AFBEELDINGEN');
let imgIssues = 0;
for (const p of pages) {
  if (p.imgNoAlt || p.imgNoDims) {
    imgIssues++;
    console.log(p.rel.padEnd(52), `${p.imgCount} imgs, ${p.imgNoAlt} zonder alt, ${p.imgNoDims} zonder width/height`);
  }
}
if (!imgIssues) console.log('geen');

section('SCHEMA PER PAGINA');
for (const p of pages) console.log(p.rel.padEnd(52), p.schema.join(', ') || '>>> GEEN <<<');

section('DODE INTERNE LINKS');
const inbound = {};
pages.forEach((p) => (inbound[p.rel] = 0));
let dead = 0;
for (const p of pages) {
  const seen = new Set();
  for (const href of p.links) {
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href)) continue;
    const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    if (/\.(xml|txt|png|jpe?g|webp|avif|svg|ico|pdf|json|webmanifest|css|js)$/.test(clean)) continue;
    if (!routes.has(clean)) {
      dead++;
      console.log('DOOD:', p.rel, '->', href);
    } else if (clean !== p.rel && !seen.has(clean)) {
      inbound[clean]++;
      seen.add(clean);
    }
  }
}
if (!dead) console.log('geen');

section('INTERNE LINKKRACHT (laag bovenaan)');
console.log('Je landingspagina\'s met koopintentie horen hier niet onderaan te staan.');
Object.entries(inbound)
  .sort((a, b) => a[1] - b[1])
  .forEach(([r, n]) => console.log(String(n).padStart(4), r));

section('ZICHTBARE WOORDEN PER PAGINA (header/footer eruit)');
[...pages]
  .sort((a, b) => b.words - a.words)
  .forEach((p) => console.log(String(p.words).padStart(6), p.rel));
