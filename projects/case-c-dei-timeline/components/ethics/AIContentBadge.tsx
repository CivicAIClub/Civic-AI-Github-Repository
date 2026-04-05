'use client';

import Link from 'next/link';

interface AIContentBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AIContentBadge({ className = '', size = 'md' }: AIContentBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  return (
    <Link
      href="/ai-bias"
      className={`
        inline-flex items-center rounded-full
        bg-amber/10 border border-amber/30
        text-amber-dark hover:bg-amber/20
        transition-colors duration-200
        font-body font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label="AI-Generated Content - Learn about AI bias"
    >
      <svg
        width={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
        height={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
      AI-Generated Content
    </Link>
  );
}
