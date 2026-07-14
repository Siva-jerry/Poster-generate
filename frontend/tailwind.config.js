/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          purple: {
            light: '#9d4edd',
            DEFAULT: '#7b2cbf',
            dark: '#2d154f',
            black: '#080410',
          },
          blue: {
            light: '#00f0ff',
            DEFAULT: '#0f2459',
            dark: '#060f2b',
            black: '#02040b',
          },
          gold: {
            light: '#ffd700',
            DEFAULT: '#d4af37',
            dark: '#aa7c11',
            black: '#080808',
          },
          slate: {
            950: '#030712',
            900: '#0f172a',
            800: '#1e293b',
          }
        }
      },
      fontFamily: {
        serif: ['Georgia', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'drift': 'drift 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(100px, 80px) rotate(180deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
