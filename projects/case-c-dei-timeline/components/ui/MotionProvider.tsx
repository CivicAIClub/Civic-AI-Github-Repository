'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

// Loads only Framer Motion's DOM-animation feature bundle (~4.6 kB gzipped)
// the first time any motion component renders. Prevents the full ~25 kB
// animation API from being pulled into every route's bundle.
//
// Usage: wrap the app root with <MotionProvider>...</MotionProvider>, and
// in route files use `m.div` / `m.svg` from framer-motion instead of
// `motion.div` / `motion.svg`. The `m` components accept the same props but
// depend on the feature bundle loaded here.
//
// See: https://motion.dev/docs/react-reduce-bundle-size
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict={false}>{children}</LazyMotion>;
}
