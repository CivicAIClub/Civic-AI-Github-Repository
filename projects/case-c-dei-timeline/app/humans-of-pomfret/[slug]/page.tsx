import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { profiles, getProfileBySlug } from '@/lib/data/profiles';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Pre-render a page for every profile slug so the dynamic route is fully static.
export function generateStaticParams() {
  return profiles.map((profile) => ({ slug: profile.slug }));
}

// Per-profile metadata for SEO and social sharing.
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const profile = getProfileBySlug(params.slug);
  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }
  return {
    title: `${profile.name}${profile.classYear ? ` ${profile.classYear}` : ''}`,
    description: profile.bio.slice(0, 155),
    openGraph: {
      title: `${profile.name} · Humans of Pomfret`,
      description: profile.bio.slice(0, 200),
      type: 'profile',
      images: profile.image ? [{ url: profile.image }] : undefined,
    },
  };
}

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = getProfileBySlug(params.slug);
  if (!profile) {
    notFound();
  }

  // schema.org Person for each profile. Helps search engines build knowledge-graph
  // entries for historically significant Pomfret alumni and faculty.
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: profile.bio,
    image: profile.image ? `${siteUrl}${profile.image}` : undefined,
    url: `${siteUrl}/humans-of-pomfret/${profile.slug}`,
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Pomfret School',
      url: 'https://www.pomfret.org',
    },
    // `citation` names the archival source for each profile so search engines
    // can attribute the biographical claims to the original publication.
    citation: profile.source,
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <JsonLd data={personJsonLd} />
      {/* Breadcrumb strip */}
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
              { href: `/humans-of-pomfret/${profile.slug}`, label: profile.name },
            ]}
          />
        </div>
      </div>

      <section className="py-16 lg:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/humans-of-pomfret"
            className="inline-flex items-center gap-2 text-slate hover:text-navy text-sm font-body mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 4L6 8L10 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Back to Humans of Pomfret
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Portrait */}
            <div>
              <div className="aspect-[3/4] bg-cream rounded-2xl museum-frame overflow-hidden relative">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={`Portrait of ${profile.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-navy/10 flex items-center justify-center">
                      <span className="font-display text-4xl text-navy/40">
                        {profile.name
                          .replace(/^(The Honorable|Dr\.|Lt\. Col\.|Madame) /, '')
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-3">
                {profile.role}
                {profile.classYear && <> &middot; Class of {profile.classYear.replace(/^'/, '19').replace(/^'([0-9]{2})$/, (_, yy) => (parseInt(yy, 10) >= 30 ? '19' : '20') + yy)}</>}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-navy leading-[1.05] mb-6">
                <span className="font-bold">{profile.name.split(' ')[0]}</span>{' '}
                <span className="font-normal text-pomfret-gray">
                  {profile.name.split(' ').slice(1).join(' ')}
                </span>
              </h1>

              <blockquote className="border-l-2 border-maroon pl-6 py-2 mb-8">
                <p className="font-display text-xl lg:text-2xl text-navy italic leading-relaxed">
                  {profile.quote}
                </p>
              </blockquote>

              <div className="prose prose-slate font-body mb-8">
                <p className="text-base lg:text-lg text-slate leading-relaxed">
                  {profile.bio}
                </p>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-cream text-slate text-xs font-body"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-xs font-body text-slate/70 italic border-t border-mist pt-4">
                <span className="font-semibold not-italic">Years at Pomfret:</span>{' '}
                {profile.yearsAtPomfret}
                <br />
                <span className="font-semibold not-italic">Source:</span> {profile.source}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
