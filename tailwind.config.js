/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a27',
          600: '#22223a',
          500: '#2d2d4e',
          400: '#3d3d65',
        },
        accent: {
          DEFAULT: '#e8a020',
          hover: '#f0b030',
          muted: '#a06810',
        }
      }
    },
  },
  plugins: [],
}
