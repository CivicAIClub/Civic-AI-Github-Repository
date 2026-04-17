import Link from 'next/link';

interface BreadcrumbsProps {
  trail: { href?: string; label: string }[];
  className?: string;
}

// Matches pomfret.org's breadcrumb pattern: small uppercase text with `>` separators,
// shown below the main header on interior pages.
export default function Breadcrumbs({ trail, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-[11px] font-body tracking-[0.1em] uppercase text-pomfret-gray">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="hover:text-maroon transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-pomfret-navy font-semibold' : ''}>
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className="text-pomfret-gray/50" aria-hidden="true">
                  &gt;
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
