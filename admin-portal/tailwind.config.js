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
          DEFAULT: '#16181C',
          lighter: '#1D1F23',
          hover: '#1A1A1A',
          border: '#2F3336',
          elevated: '#202327',
        },
        xbrand: '#00f2fe',
        xcard: 'rgba(255, 255, 255, 0.03)',
        xtext: {
          DEFAULT: '#E7E9EA',
          secondary: '#71767B',
          tertiary: '#536471',
        },
        xblue: '#1D9BF0',
        xgreen: '#00BA7C',
        xred: '#F4212E',
        xyellow: '#FFD400',
      },
    },
  },
  plugins: [],
}
