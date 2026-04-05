'use client';

import { useState } from 'react';
import { generateQRCodeDataURL } from '@/lib/qr';

const demoLocations = [
  { slug: 'clark-memorial-chapel', name: 'Clark Memorial Chapel' },
  { slug: 'school-house', name: 'School House' },
  { slug: 'centennial-garden', name: 'Centennial Garden' },
  { slug: 'jahn-rink', name: 'Jahn Rink' },
  { slug: 'olmsted-observatory', name: 'Olmsted Observatory' },
  { slug: 'hard-auditorium', name: 'Hard Auditorium' },
];

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pomfretvoices.org';

export default function QRGeneratorPage() {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const generateAll = async () => {
    setGenerating(true);
    const codes: Record<string, string> = {};
    for (const loc of demoLocations) {
      const url = `${BASE_URL}/tour/${loc.slug}`;
      codes[loc.slug] = await generateQRCodeDataURL(url, { width: 400 });
    }
    setQrCodes(codes);
    setGenerating(false);
  };

  const generateSingle = async (slug: string) => {
    const url = `${BASE_URL}/tour/${slug}`;
    const dataUrl = await generateQRCodeDataURL(url, { width: 400 });
    setQrCodes((prev) => ({ ...prev, [slug]: dataUrl }));
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-body tracking-wider uppercase text-maroon mb-2">
                Admin Only
              </div>
              <h1 className="font-display text-3xl text-navy">QR Code Generator</h1>
              <p className="text-slate font-body mt-2">
                Generate printable QR codes for campus tour stops.
              </p>
            </div>
            <button
              onClick={generateAll}
              disabled={generating}
              className="px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors font-body font-semibold disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate All QR Codes'}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoLocations.map((loc) => (
              <div key={loc.slug} className="bg-cream rounded-2xl p-6 museum-frame">
                <h3 className="font-display text-lg text-navy mb-2">{loc.name}</h3>
                <p className="text-xs text-slate font-body mb-4 break-all">
                  {BASE_URL}/tour/{loc.slug}
                </p>

                {qrCodes[loc.slug] ? (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodes[loc.slug]}
                      alt={`QR code for ${loc.name}`}
                      className="mx-auto mb-4 rounded-lg"
                      width={200}
                      height={200}
                    />
                    <a
                      href={qrCodes[loc.slug]}
                      download={`qr-${loc.slug}.png`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-lg text-sm font-body hover:bg-navy-light transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M7 2V9M7 9L4 6M7 9L10 6M2 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download PNG
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => generateSingle(loc.slug)}
                    className="w-full py-3 bg-navy/5 text-navy rounded-xl hover:bg-navy/10 transition-colors text-sm font-body font-semibold"
                  >
                    Generate QR Code
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Print all */}
          {Object.keys(qrCodes).length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-gold text-navy-dark rounded-xl hover:bg-gold-light transition-colors font-body font-semibold"
              >
                Print All QR Codes
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
