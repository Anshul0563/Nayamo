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
            primary: '#070708',
            secondary: '#0A0A0C',
            tertiary: '#0E0E10',
            elevated: '#131316',
            card: '#18181C',
            hover: '#1E1E24',
          },
          gold: {
            DEFAULT: '#D4A853',
            bright: '#F0D78C',
            soft: 'rgba(212, 168, 83, 0.12)',
            glow: 'rgba(212, 168, 83, 0.35)',
            dim: 'rgba(212, 168, 83, 0.06)',
          },
          rose: {
            DEFAULT: '#D4A5A5',
            bright: '#ECC5C5',
            soft: 'rgba(212, 165, 165, 0.12)',
          },
          text: {
            primary: '#FAFAFA',
            secondary: '#E4E4E7',
            muted: '#A1A1AA',
            tertiary: '#71717A',
          },
          border: {
            subtle: 'rgba(255, 255, 255, 0.04)',
            light: 'rgba(255, 255, 255, 0.07)',
            medium: 'rgba(255, 255, 255, 0.11)',
            gold: 'rgba(212, 168, 83, 0.22)',
          }
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'slide-right': 'slideRight 0.4s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,168,83,0.12)' },
          '50%': { boxShadow: '0 0 40px rgba(212,168,83,0.25)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
