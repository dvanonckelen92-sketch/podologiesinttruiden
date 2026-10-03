/**
 * Eén bron van waarheid voor alle harde feiten: contactgegevens, tarieven en
 * pagina's. De pagina's, de JSON-LD, llms.txt en de sitemap lezen allemaal
 * hieruit, zodat een prijswijziging op één plek gebeurt en nergens uit de pas
 * loopt.
 */

export const site = {
  name: 'Podologie Sint-Truiden',
  url: 'https://podologiesttruiden.be',
  practitioner: 'Sarah Thoelen',
  jobTitle: 'Podoloog',
  riziv: '5-71012-27-701',
  // Ondernemingsnummer (KBO), eenmanszaak op naam van Sarah Thoelen.
  kbo: '0835.812.178',
  phone: '0473 44 67 47',
  phoneIntl: '+32473446747',
  email: 'info@podologiesttruiden.be',
  address: {
    street: 'Bevingen-Centrum 7',
    postalCode: '3800',
    locality: 'Sint-Truiden',
    district: 'Bevingen',
    region: 'Limburg',
    country: 'BE',
  },
  geo: { lat: 50.7985137, lng: 5.1771445 },
  // Telefonische bereikbaarheid, niet de consultatie-uren.
  phoneHours: { days: 'maandag t.e.m. vrijdag', opens: '09:00', closes: '16:00' },
  bookingUrl: 'https://bookings.crossuite.app/e03ea36d-d8b3-4ac2-bc91-00aea878e5cb',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Podologie+Sint-Truiden+Bevingen-Centrum+7+3800+Sint-Truiden',
  areaServed: ['Sint-Truiden', 'Bevingen', 'Brustem', 'Zepperen', 'Velm', 'Gingelom', 'Nieuwerkerken', 'Landen'],
} as const;

export type Price = {
  id: string;
  label: string;
  /** Vaste prijs in euro. */
  price?: number;
  /** Twee mogelijke prijzen ("€ 15 of € 25"), alleen als de prijs echt afhangt van iets. */
  min?: number;
  max?: number;
  note?: string;
  page?: string;
};

export type PriceGroup = { title: string; items: Price[] };

export const prices: PriceGroup[] = [
  {
    title: 'Onderzoek en zolen',
    items: [
      { id: 'onderzoek-volw', label: 'Biomechanisch onderzoek + ganganalyse (volwassenen)', price: 70, page: '/biomechanisch-onderzoek/' },
      { id: 'onderzoek-kind', label: 'Biomechanisch onderzoek + ganganalyse (kinderen t.e.m. 16 jaar)', price: 45, page: '/podoloog-kinderen/' },
      { id: 'zolen-volw', label: 'Podologische zolen (volwassenen)', price: 195, note: 'Gratis controle na 6 weken, met aanpassingen', page: '/podologische-zolen/' },
      { id: 'zolen-kind', label: 'Podologische zolen (kinderen t.e.m. 16 jaar)', price: 150, note: 'Gratis controle na 6 weken, met aanpassingen', page: '/podoloog-kinderen/' },
      { id: 'zolen-tweede', label: 'Tweede paar identieke zolen (besteld binnen het jaar)', price: 145, page: '/podologische-zolen/' },
    ],
  },
  {
    title: 'Voetzorg',
    items: [
      { id: 'voetverzorging', label: 'Podologische voetverzorging', price: 45, page: '/diabetische-voetzorg/' },
      { id: 'diabetes', label: 'Diabetesscreening (zorgtraject of diabetesconventie)', price: 45, page: '/diabetische-voetzorg/' },
    ],
  },
  {
    title: 'Specialisatietechnieken nagels',
    items: [
      { id: 'ross-fraser', label: 'Ross Fraser nagelbeugel', price: 20, page: '/ingegroeide-teennagel/' },
      { id: 'fotopolymerisatie', label: 'Fotopolymerisatie beugel', price: 15, page: '/ingegroeide-teennagel/' },
      { id: 'orthese', label: 'Orthese (teenstukje op maat)', min: 15, max: 25, note: 'Afhankelijk van de grootte', page: '/ingegroeide-teennagel/' },
      { id: 'gelacy', label: 'Nagelreconstructie met Gelacy', price: 20, page: '/ingegroeide-teennagel/' },
      { id: 'unguisan', label: 'Nagelreconstructie met Unguisan', price: 15, page: '/ingegroeide-teennagel/' },
    ],
  },
];

export const allPrices = prices.flatMap((g) => g.items);

export function priceOf(id: string): Price {
  const p = allPrices.find((x) => x.id === id);
  if (!p) throw new Error(`Onbekende prijs: ${id}`);
  return p;
}

export function euro(p: Price): string {
  if (p.price !== undefined) return `€ ${p.price}`;
  return `€ ${p.min} of € ${p.max}`;
}

/**
 * Alle indexeerbare pagina's. `updated` is de datum waarop de inhoud van die
 * pagina het laatst echt wijzigde. Die komt in de sitemap als lastmod, dus pas
 * hem alleen aan als de tekst verandert, niet bij elke deploy.
 */
export type PageMeta = {
  path: string;
  /**
   * Titel zonder merksuffix. Het suffix " | Podologie Sint-Truiden" kost 25
   * tekens, dus max. 35 om onder de 60 te blijven. De plaatsnaam zit al in
   * het suffix en hoeft hier niet nog eens.
   */
  seoTitle: string;
  /** Volledige title zonder automatisch suffix (alleen homepage). */
  fullTitle?: string;
  description: string;
  navLabel?: string;
  updated: string;
  priority: number;
};

const e = (id: string) => euro(priceOf(id));

export const pages: PageMeta[] = [
  {
    path: '/',
    seoTitle: 'Podoloog in Sint-Truiden',
    fullTitle: 'Podologie Sint-Truiden | Podoloog Sarah Thoelen',
    description:
      'Podoloog in Sint-Truiden voor podologische zolen, biomechanisch onderzoek met ganganalyse, kinderpodologie en diabetische voetzorg. Online afspraak maken.',
    updated: '2026-09-28',
    priority: 1.0,
  },
  {
    path: '/podologische-zolen/',
    seoTitle: 'Podologische zolen op maat',
    description:
      `Podologische zolen op maat in Sint-Truiden, gemaakt na 3D-scan en ganganalyse. ${e('zolen-volw')} voor volwassenen, ${e('zolen-kind')} voor kinderen, gratis controle na 6 weken.`,
    navLabel: 'Zolen',
    updated: '2026-09-28',
    priority: 0.9,
  },
  {
    path: '/biomechanisch-onderzoek/',
    seoTitle: 'Biomechanisch onderzoek voeten',
    description:
      `Biomechanisch onderzoek met ganganalyse op de loopband en 3D-voetscan in Sint-Truiden. Voor voet-, knie- of rugklachten. ${e('onderzoek-volw')} voor volwassenen.`,
    navLabel: 'Onderzoek',
    updated: '2026-09-28',
    priority: 0.9,
  },
  {
    path: '/podoloog-kinderen/',
    seoTitle: 'Podoloog voor kinderen',
    description:
      `Kinderpodologie in Sint-Truiden vanaf 4 jaar. Onderzoek bij vaak struikelen, vermoeide voeten of een afwijkend stappatroon. Onderzoek ${e('onderzoek-kind')}, zolen ${e('zolen-kind')}.`,
    navLabel: 'Kinderen',
    updated: '2026-09-28',
    priority: 0.8,
  },
  {
    path: '/diabetische-voetzorg/',
    seoTitle: 'Diabetische voetzorg bij podoloog',
    description:
      'Erkende diabetische voetzorg en diabetesscreening in Sint-Truiden, binnen het zorgtraject of de diabetesconventie. Tweemaal per jaar terugbetaald via het RIZIV.',
    navLabel: 'Diabetes',
    updated: '2026-09-28',
    priority: 0.8,
  },
  {
    path: '/ingegroeide-teennagel/',
    seoTitle: 'Ingegroeide teennagel behandelen',
    description:
      'Ingegroeide teennagel behandelen zonder operatie in Sint-Truiden: Ross Fraser nagelbeugel, fotopolymerisatie, orthese op maat en nagelreconstructie.',
    navLabel: 'Nagels',
    updated: '2026-09-28',
    priority: 0.8,
  },
  {
    path: '/voor-wie/',
    seoTitle: 'Voor wie is een podoloog?',
    description:
      'Voor wie is een bezoek aan de podoloog zinvol? Bij voet-, knie- of rugklachten, voor schoenadvies, voor kinderen vanaf 4 jaar en voor mensen met diabetes.',
    navLabel: 'Voor wie',
    updated: '2026-09-28',
    priority: 0.7,
  },
  {
    path: '/tarieven/',
    seoTitle: 'Tarieven podoloog en terugbetaling',
    description:
      `Alle tarieven van Podologie Sint-Truiden: onderzoek ${e('onderzoek-volw')}, podologische zolen ${e('zolen-volw')}, voetverzorging ${e('voetverzorging')}, nagelbeugel vanaf ${e('fotopolymerisatie')}. Met info over terugbetaling.`,
    navLabel: 'Tarieven',
    updated: '2026-09-28',
    priority: 0.8,
  },
  {
    path: '/contact/',
    seoTitle: 'Contact en afspraak podoloog',
    description:
      'Contact met Podologie Sint-Truiden, Bevingen-Centrum 7. Telefonisch bereikbaar ma t.e.m. vr van 9u tot 16u op 0473 44 67 47, of maak online een afspraak.',
    navLabel: 'Contact',
    updated: '2026-09-28',
    priority: 0.7,
  },
  {
    path: '/privacyverklaring/',
    seoTitle: 'Privacyverklaring',
    description:
      'Hoe Podologie Sint-Truiden omgaat met je gegevens: welke gegevens in je patiëntendossier komen, hoe lang ze bewaard worden en welke rechten je hebt.',
    updated: '2026-10-03',
    priority: 0.2,
  },
];

export function pageMeta(path: string): PageMeta {
  const p = pages.find((x) => x.path === path);
  if (!p) throw new Error(`Geen metadata voor ${path}`);
  return p;
}

export const nav = pages.filter((p) => p.navLabel);
