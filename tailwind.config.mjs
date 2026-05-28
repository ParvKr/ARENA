/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#080810',
          'bg-s': '#0F0F1A',
          card: '#141420',
          surface: '#1C1C2E',
          'surface-h': '#242438',
          border: '#2A2A40',
          'border-l': '#3A3A55',
          red: '#FF2D55',
          'red-dim': 'rgba(255,45,85,0.12)',
          gold: '#FFD700',
          'gold-dim': 'rgba(255,215,0,0.08)',
          cyan: '#00F5FF',
          'cyan-dim': 'rgba(0,245,255,0.08)',
          purple: '#9B5DE5',
          'purple-dim': 'rgba(155,93,229,0.12)',
          green: '#00F08A',
          'green-dim': 'rgba(0,240,138,0.1)',
          white: '#FFFFFF',
          offwhite: '#E8E8F0',
          gray: '#8888AA',
          'gray-l': '#C0C0D8',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'rank-up': 'rankUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'gold-pulse': 'goldPulse 3s ease-in-out infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'float-up': 'floatUp 0.4s ease-out forwards',
        shimmer: 'shimmer 1.5s linear infinite',
        'colon-blink': 'colonBlink 1s steps(1) infinite',
      },
      boxShadow: {
        red: '0 0 20px rgba(255,45,85,0.4)',
        gold: '0 0 20px rgba(255,215,0,0.4)',
        cyan: '0 0 12px rgba(0,245,255,0.35)',
        purple: '0 0 12px rgba(155,93,229,0.35)',
        green: '0 0 10px rgba(0,240,138,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
