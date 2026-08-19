/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        filza: {
          dark: '#0d0d0d',
          card: '#161616',
          border: '#282828',
          accent: '#33ff80',
          cyan: '#38bdf8',
          muted: '#8e8e93',
          yellow: '#facc15',
          purple: '#c084fc',
        }
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
