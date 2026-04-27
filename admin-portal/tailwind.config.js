/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        bg:      '#0b0f1a',
        surface: '#111827',
        accent:  '#fca311',
        primary: '#f8fafc',
        muted:   '#94a3b8',

        // Backward compat aliases
        xblack:  '#000000',
        xcard:   '#111827',
        xbrand:  '#fca311',
        xdark: {
          DEFAULT:  '#0b0f1a',
          lighter:  '#111827',
          hover:    '#1e2a3a',
          border:   '#1e293b',
          elevated: '#1e293b',
        },
        xtext: {
          DEFAULT:   '#f8fafc',
          secondary: '#94a3b8',
          tertiary:  '#64748b',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'glow':  '0 0 24px rgba(252,163,17,0.12)',
      },
    },
  },
  plugins: [],
}
