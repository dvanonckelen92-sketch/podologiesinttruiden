import { site, allPrices, type Price, type PageMeta } from './site';

const BASE = site.url;
export const ORG_ID = `${BASE}/#praktijk`;
export const PERSON_ID = `${BASE}/#sarah-thoelen`;
export const WEBSITE_ID = `${BASE}/#website`;

export type Faq = { q: string; a: string };
export type Crumb = { name: string; path: string };

const abs = (path: string) => new URL(path, BASE).href;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: site.address.street,
  postalCode: site.address.postalCode,
  addressLocality: site.address.locality,
  addressRegion: site.address.region,
  addressCountry: site.address.country,
};

/** De praktijk, de podoloog en de website. Staat op elke pagina. */
export function baseGraph(logoUrl: string, imageUrl: string) {
  return [
    {
      // MedicalClinic is zowel LocalBusiness (via MedicalBusiness) als MedicalOrganization;
      // alleen die laatste kent medicalSpecialty.
      '@type': 'MedicalClinic',
      '@id': ORG_ID,
      name: site.name,
      url: `${BASE}/`,
      logo: logoUrl,
      image: imageUrl,
      telephone: site.phoneIntl,
      email: site.email,
      medicalSpecialty: 'https://schema.org/Podiatric',
      priceRange: '€15 - €195',
      currenciesAccepted: 'EUR',
      identifier: { '@type': 'PropertyValue', propertyID: 'KBO-ondernemingsnummer', value: site.kbo },
      address: postalAddress,
      geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      hasMap: site.mapsUrl,
      sameAs: [site.social.facebook],
      areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })),
      founder: { '@id': PERSON_ID },
      employee: { '@id': PERSON_ID },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'afspraken en informatie',
        telephone: site.phoneIntl,
        email: site.email,
        availableLanguage: ['nl'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: site.phoneHours.opens,
          closes: site.phoneHours.closes,
        },
      },
      potentialAction: {
        '@type': 'ReserveAction',
        name: 'Online afspraak maken',
        target: { '@type': 'EntryPoint', urlTemplate: site.bookingUrl, actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] },
      },
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: site.practitioner,
      jobTitle: site.jobTitle,
      sameAs: [site.social.linkedin],
      worksFor: { '@id': ORG_ID },
      identifier: { '@type': 'PropertyValue', propertyID: 'RIZIV-nummer', value: site.riziv },
      knowsAbout: ['podologie', 'podologische zolen', 'biomechanisch onderzoek', 'ganganalyse', 'diabetische voet', 'ingegroeide teennagel'],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${BASE}/`,
      name: site.name,
      inLanguage: 'nl-BE',
      publisher: { '@id': ORG_ID },
    },
  ];
}

export function webPage(meta: PageMeta, title: string, imageUrl?: string, type = 'WebPage') {
  return {
    '@type': type,
    '@id': `${abs(meta.path)}#webpage`,
    url: abs(meta.path),
    name: title,
    description: meta.description,
    inLanguage: 'nl-BE',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    dateModified: meta.updated,
    ...(imageUrl ? { primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl } } : {}),
    ...(meta.path !== '/' ? { breadcrumb: { '@id': `${abs(meta.path)}#breadcrumb` } } : {}),
  };
}

export function breadcrumbs(path: string, crumbs: Crumb[]) {
  const all = [{ name: 'Home', path: '/' }, ...crumbs];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(path)}#breadcrumb`,
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function faqPage(path: string, faqs: Faq[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(path)}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function offer(p: Price) {
  const spec =
    p.price !== undefined
      ? { price: p.price }
      : { priceSpecification: { '@type': 'PriceSpecification', minPrice: p.min, maxPrice: p.max, priceCurrency: 'EUR', valueAddedTaxIncluded: true } };
  return {
    '@type': 'Offer',
    name: p.label,
    ...spec,
    priceCurrency: 'EUR',
    valueAddedTaxIncluded: true,
    availability: 'https://schema.org/InStock',
    url: site.bookingUrl,
    ...(p.note ? { description: p.note } : {}),
  };
}

/** Een dienst met de bijhorende tarieven uit site.ts. */
export function service(path: string, name: string, serviceType: string, description: string, priceIds: string[]) {
  const items = priceIds.map((id) => allPrices.find((p) => p.id === id)!).filter(Boolean);
  return {
    '@type': 'Service',
    '@id': `${abs(path)}#dienst`,
    name,
    serviceType,
    description,
    url: abs(path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'City', name: site.address.locality },
    ...(items.length
      ? {
          offers: items.length === 1 ? offer(items[0]) : items.map(offer),
        }
      : {}),
  };
}
