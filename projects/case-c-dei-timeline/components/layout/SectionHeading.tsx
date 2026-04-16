// Matches pomfret.org's signature section-heading pattern:
// bold first word, regular remaining words, in the display serif.
// Example: <SectionHeading bold="Signature" rest="Exhibits" />
// renders: "Signature Exhibits" with the first word bolded visually.

interface SectionHeadingProps {
  bold: string;
  rest: string;
  align?: 'left' | 'center';
  kicker?: string;
  className?: string;
  as?: 'h1' | 'h2';
}

export default function SectionHeading({
  bold,
  rest,
  align = 'left',
  kicker,
  className = '',
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {kicker && (
        <div
          className={`text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-3 ${
            align === 'center' ? '' : ''
          }`}
        >
          {kicker}
        </div>
      )}
      <Tag
        className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy"
      >
        <span className="font-bold">{bold}</span>{' '}
        <span className="font-normal text-pomfret-gray">{rest}</span>
      </Tag>
    </div>
  );
}
