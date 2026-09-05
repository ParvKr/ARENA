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
          bg: '#050507',
          'bg-s': '#0A0A0F',
          card: '#0A0A0F',
          surface: '#0A0A0F',
          'surface-h': '#101017',
          border: '#1C1C26',
          'border-l': '#2C2C3A',
          accent: '#7C5CFF',
          'accent-dim': 'rgba(124, 92, 255, 0.12)',
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
          offwhite: '#F5F5F7',
          gray: '#737380',
          'gray-l': '#A3A3B0',
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
        'pulse-accent': 'pulseAccent 2s ease-in-out infinite',
        'float-up': 'floatUp 0.4s ease-out forwards',
        shimmer: 'shimmer 1.5s linear infinite',
        'colon-blink': 'colonBlink 1s steps(1) infinite',
      },
      boxShadow: {
        accent: '0 0 20px rgba(124, 92, 255, 0.4)',
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
