import type { Metadata } from 'next';

// Admin routes (e.g. /admin/qr-generator) are utilities for school staff and
// must not appear in search engines. Tell well-behaved crawlers to skip them.
// This does not replace authentication — production deployments should also
// gate /admin behind real auth at the hosting layer.

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
