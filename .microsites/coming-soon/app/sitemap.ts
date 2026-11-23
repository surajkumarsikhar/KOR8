import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Actual editorial revision date. Change only when homepage content changes.
  return [{ url: 'https://kor8.in/', lastModified: '2026-11-23' }];
}
