/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nayamo: {
          bg: {
            primary: '#0A0A0A',
            secondary: '#0F0F0F',
            tertiary: '#141414',
            elevated: '#1A1A1C',
            card: '#1E1E22',
            hover: '#242428',
          },
          gold: {
            DEFAULT: '#D4A853',
            bright: '#E8C878',
            soft: 'rgba(212, 168, 83, 0.15)',
            glow: 'rgba(212, 168, 83, 0.3)',
          },
          rose: {
            DEFAULT: '#D4A5A5',
            bright: '#E8C4C4',
            soft: 'rgba(212, 165, 165, 0.15)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E8E8E8',
            muted: '#9CA3AF',
            tertiary: '#6B7280',
          },
          border: {
            subtle: 'rgba(255, 255, 255, 0.05)',
            light: 'rgba(255, 255, 255, 0.08)',
            medium: 'rgba(255, 255, 255, 0.12)',
            gold: 'rgba(212, 168, 83, 0.25)',
          }
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,168,83,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(212,168,83,0.3)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
