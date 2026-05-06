import withBundleAnalyzer from '@next/bundle-analyzer';

// Bundle analyzer — enable with ANALYZE=true npm run build (opens two HTMLs:
// server bundle + client bundle). Disabled by default so prod builds stay lean.
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remote image hosts allowed via next/image. Add new hosts here before
  // referencing them from <Image src=...>.
  images: {
    remotePatterns: [
      // Sanity CDN — production image delivery
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      // Pomfret.org Finalsite CDN — used for authenticated photo sourcing
      { protocol: 'https', hostname: 'resources.finalsite.net' },
      // YouTube thumbnails — for future embed previews
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Force HTTPS; 1 year; include subdomains; opt-in to preload list
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Prevent embedding in external iframes to block clickjacking
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Do not allow MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Conservative referrer policy: strict-origin on cross-origin
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Lock down powerful browser features we don't use
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)',
          },
          {
            // Content Security Policy — permissive for Next.js + YouTube embeds.
            // Adjust if integrating analytics (e.g., add Vercel Analytics).
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js runtime + Framer Motion need inline eval in dev; keep unsafe-inline/eval
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://cdn.sanity.io https://resources.finalsite.net https://i.ytimg.com https://img.youtube.com",
              "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://cdn.sanity.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
