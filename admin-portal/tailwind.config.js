/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xblack: '#000000',
        xdark: {
          DEFAULT: '#000000',
          lighter: '#0a0f1e',
          hover: '#14213d',
          border: '#1b2a4a',
          elevated: '#14213d',
        },
        xbrand: '#fca311',
        xcard: '#14213d',
        xtext: {
          DEFAULT: '#ffffff',
          secondary: '#e5e5e5',
          tertiary: '#8a94a6',
        },
        xblue: '#14213d',
        xgreen: '#34d399',
        xred: '#ef4444',
        xyellow: '#fca311',
      },
    },
  },
  plugins: [],
}
