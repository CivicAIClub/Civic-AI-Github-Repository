// Root-level loading UI, shown while route segments are rendering.
// Kept minimal because most routes render fully static content.

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-warm-white flex items-center justify-center px-6"
      role="status"
      aria-label="Loading content"
    >
      <div className="flex items-center gap-3 text-[11px] font-body font-bold tracking-[0.3em] uppercase text-pomfret-gray">
        <div className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
        Loading…
      </div>
    </div>
  );
}
