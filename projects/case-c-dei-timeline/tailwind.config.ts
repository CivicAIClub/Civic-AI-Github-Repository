import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A',
          light: '#2A3D6B',
          dark: '#111D35',
        },
        maroon: {
          DEFAULT: '#7B2D3B',
          light: '#9E3A4C',
          dark: '#5C1F2B',
        },
        gold: {
          DEFAULT: '#C4993B',
          light: '#D4AD5A',
          dark: '#A67E2C',
        },
        amber: '#D4943A',
        cream: {
          DEFAULT: '#FAF6F0',
          dark: '#F0E8D8',
        },
        linen: '#F5F0E8',
        'warm-white': '#FDFCFA',
        charcoal: '#2C2C2C',
        slate: '#4A4A5A',
        mist: '#E8E4DC',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.1' }],
        'section': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15' }],
        'subtitle': ['clamp(1.125rem, 2vw, 1.5rem)', { lineHeight: '1.4' }],
      },
      spacing: {
        'section': 'clamp(3rem, 8vw, 8rem)',
      },
      maxWidth: {
        'content': '1280px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'waveform': 'waveform 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
