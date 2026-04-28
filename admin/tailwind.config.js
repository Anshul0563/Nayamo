/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf9f0",
          100: "#faf0db",
          200: "#f5e0b3",
          300: "#edcc80",
          400: "#e3b34d",
          500: "#d4962a",
          600: "#b87a1e",
          700: "#935d18",
          800: "#7a4c1a",
          900: "#66401b",
          950: "#3b200c",
        },
        luxury: {
          black: "#0a0a0a",
          dark: "#111111",
          card: "#141414",
          surface: "#1a1a1a",
          border: "rgba(255,255,255,0.06)",
          borderHover: "rgba(212,150,42,0.25)",
          text: "#e5e5e5",
          muted: "#a1a1aa",
          dim: "#71717a",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "shimmer": "shimmer 2s infinite linear",
        "float": "float 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "counter": "counter 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,150,42,0.4)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(212,150,42,0.1)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #d4962a 0%, #f5e0b3 50%, #d4962a 100%)",
        "gold-gradient-soft": "linear-gradient(135deg, rgba(212,150,42,0.15) 0%, rgba(245,224,179,0.08) 50%, rgba(212,150,42,0.15) 100%)",
        "dark-gradient": "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "gold-sm": "0 0 10px rgba(212,150,42,0.15)",
        "gold-md": "0 0 20px rgba(212,150,42,0.2)",
        "gold-lg": "0 0 40px rgba(212,150,42,0.15)",
        "glass": "0 8px 32px rgba(0,0,0,0.3)",
        "card": "0 4px 24px rgba(0,0,0,0.2)",
        "inner-gold": "inset 0 0 20px rgba(212,150,42,0.05)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};

