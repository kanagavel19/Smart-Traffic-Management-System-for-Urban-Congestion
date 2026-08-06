/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',      // Slate 900
          card: '#1E293B',    // Slate 800
          border: '#334155',  // Slate 700
          text: '#F8FAFC'     // Slate 50
        },
        traffic: {
          green: '#10B981',   // Emerald 500
          yellow: '#F59E0B',  // Amber 500
          orange: '#F97316',  // Orange 500
          red: '#EF4444'      // Red 500
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green': 'glowGreen 2s infinite',
        'glow-red': 'glowRed 2s infinite'
      },
      keyframes: {
        glowGreen: {
          '0%, 100%': { boxShadow: '0 0 5px #10B981, 0 0 10px #10B981' },
          '50%': { boxShadow: '0 0 15px #10B981, 0 0 25px #10B981' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 5px #EF4444, 0 0 10px #EF4444' },
          '50%': { boxShadow: '0 0 15px #EF4444, 0 0 25px #EF4444' },
        }
      }
    },
  },
  plugins: [],
}
