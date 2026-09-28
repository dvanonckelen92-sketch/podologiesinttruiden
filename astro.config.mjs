// @ts-check
import { defineConfig } from 'astro/config';

// De bestaande WordPress-site gebruikt URL's met een slash op het einde
// (/voor-wie/, /tarieven/, /contact/). Die houden we aan zodat bestaande
// posities en links in Google niet verloren gaan.
export default defineConfig({
  site: 'https://podologiesttruiden.be',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
