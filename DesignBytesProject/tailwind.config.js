/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kirloskar': {
          'bg-dark': '#0e1f23',
          'bg-card': '#131f22',
          'bg-panel': '#192b2f',
          'accent-cyan': '#22d3ee',
          'accent-orange': '#e8893a',
          'border': 'rgba(255,255,255,0.08)',
        }
      },
      backgroundImage: {
        'dashboard': 'linear-gradient(270deg, #122225 -4.4%, #203033 99.66%)',
        'card': 'linear-gradient(145deg, #131f22 0%, #192b2f 100%)',
        'fuel-cell-card': 'linear-gradient(145deg, #0f2e32 0%, #112a2e 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 8px rgba(74,222,128,0.7)',
        'glow-red': '0 0 6px 2px rgba(239,68,68,0.4)',
        'glow-cyan': '0 0 6px 2px rgba(52,211,153,0.5)',
        'dashboard': '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
}
