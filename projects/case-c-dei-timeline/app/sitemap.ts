import type { MetadataRoute } from 'next';
import { profiles } from '@/lib/data/profiles';
import { tourStops } from '@/lib/data/tour-stops';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const staticRoutes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/timeline', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/humans-of-pomfret', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/humans-of-pomfret/heads-of-school', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/archive', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/archive/civil-rights-era', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/archive/mission-accomplished', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/famous-figures', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/tour', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/ai-bias', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const profileEntries: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${siteUrl}/humans-of-pomfret/${p.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const tourEntries: MetadataRoute.Sitemap = tourStops.map((s) => ({
    url: `${siteUrl}/tour/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticEntries, ...profileEntries, ...tourEntries];
}
