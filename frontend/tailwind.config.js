// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00ffff',
          purple: '#bf00ff',
          pink: '#ff0080',
          green: '#00ff41',
          yellow: '#ffff00',
        },
        dark: {
          bg: '#0a0a0f',
          surface: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 1.5s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
