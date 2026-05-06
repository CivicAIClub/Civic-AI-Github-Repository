import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tourStops, getTourStopBySlug } from '@/lib/data/tour-stops';
import TourStopView from './TourStopView';

// Pre-render every tour stop page so QR scans never hit a 404.
export function generateStaticParams() {
  return tourStops.map((stop) => ({ locationSlug: stop.slug }));
}

export async function generateMetadata(
  { params }: { params: { locationSlug: string } }
): Promise<Metadata> {
  const stop = getTourStopBySlug(params.locationSlug);
  if (!stop) {
    return { title: 'Tour Stop Not Found' };
  }
  return {
    title: `${stop.locationName} · Campus Tour`,
    description: stop.quickSummary.en.slice(0, 155),
    openGraph: {
      title: `${stop.locationName} · Pomfret Campus Tour`,
      description: stop.quickSummary.en,
    },
  };
}

export default function TourStopPage({ params }: { params: { locationSlug: string } }) {
  const stop = getTourStopBySlug(params.locationSlug);
  if (!stop) {
    notFound();
  }
  return <TourStopView stop={stop} />;
}
