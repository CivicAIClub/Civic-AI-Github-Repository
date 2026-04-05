'use client';

import { motion } from 'framer-motion';

interface WaveformBarsProps {
  count?: number;
  className?: string;
  active?: boolean;
  color?: string;
}

export default function WaveformBars({
  count = 5,
  className = '',
  active = false,
  color = 'bg-gold',
}: WaveformBarsProps) {
  return (
    <div
      className={`flex items-center gap-0.5 h-6 ${className}`}
      role="img"
      aria-label={active ? 'Audio playing' : 'Audio waveform'}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={
            active
              ? {
                  height: ['40%', '100%', '60%', '90%', '40%'],
                }
              : { height: '40%' }
          }
          transition={
            active
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }
              : {}
          }
          style={{ height: '40%' }}
        />
      ))}
    </div>
  );
}
