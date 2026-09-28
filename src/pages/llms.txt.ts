import type { APIRoute } from 'astro';
import { site, prices, pages, euro } from '../data/site';

// Gegenereerd uit dezelfde data als de site, zodat prijzen en contactgegevens
// hier nooit uit de pas lopen met wat op de pagina's staat.
export const GET: APIRoute = () => {
  const a = site.address;
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.name} is de podologiepraktijk van podoloog ${site.practitioner} in ${a.district}, ${a.locality} (provincie ${a.region}, België). De praktijk is gespecialiseerd in podologische zolen op maat, biomechanisch onderzoek met ganganalyse en 3D-voetscan, kinderpodologie vanaf 4 jaar, diabetische voetzorg en de behandeling van ingegroeide teennagels.`,
    '',
    '## Feiten',
    '',
    `- Podoloog: ${site.practitioner}`,
    `- RIZIV-nummer: ${site.riziv}`,
    `- Adres: ${a.street}, ${a.postalCode} ${a.locality}, België`,
    `- Telefoon: ${site.phone} (bereikbaar ${site.phoneHours.days}, 9u tot 16u)`,
    `- E-mail: ${site.email}`,
    `- Online afspraak: ${site.bookingUrl}`,
    `- Werkgebied: ${site.areaServed.join(', ')}`,
    '- Taal: Nederlands',
    '',
    '## Tarieven (eindprijzen in euro)',
    '',
    ...prices.flatMap((g) => [
      `### ${g.title}`,
      '',
      ...g.items.map((p) => `- ${p.label}: ${euro(p)}${p.note ? ` (${p.note.toLowerCase()})` : ''}`),
      '',
    ]),
    '## Terugbetaling',
    '',
    '- Diabetische voetzorg: onder voorwaarden tweemaal per jaar terugbetaald via het RIZIV, binnen het zorgtraject diabetes of de diabetesconventie, op voorschrift van de arts.',
    '- Podologische zolen: geen terugbetaling via de verplichte ziekteverzekering; veel ziekenfondsen geven een tussenkomst via de aanvullende verzekering.',
    '',
    "## Pagina's",
    '',
    ...pages.map((p) => `- [${p.seoTitle}](${new URL(p.path, site.url).href}): ${p.description}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
