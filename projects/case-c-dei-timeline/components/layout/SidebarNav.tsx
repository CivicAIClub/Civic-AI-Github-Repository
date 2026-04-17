'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarNavProps {
  heading?: string;
  items: { href: string; label: string }[];
}

// Matches pomfret.org's interior-page left sidebar:
// a small heading over a vertical stack of links,
// with the current page highlighted.
export default function SidebarNav({ heading = 'More to Explore', items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-28 self-start">
      <div className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-pomfret-gray mb-4">
        {heading}
      </div>
      <nav aria-label={heading}>
        <ul className="space-y-px border-l border-mist">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block pl-4 py-2.5 text-sm font-body transition-colors border-l-2 -ml-px ${
                    isActive
                      ? 'text-maroon border-maroon font-semibold'
                      : 'text-pomfret-navy border-transparent hover:text-maroon hover:border-maroon/40'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
