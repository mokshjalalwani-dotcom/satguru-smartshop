/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════
        // STRICT 5-COLOR DESIGN SYSTEM
        // ═══════════════════════════════════════
        // 1. #000000 — Background
        // 2. #14213d — Surface (cards, panels)
        // 3. #fca311 — Accent (primary action)
        // 4. #ffffff — Text primary
        // 5. #e5e5e5 — Text secondary
        // ═══════════════════════════════════════

        // Semantic Tokens
        bg:       '#000000',
        surface:  '#14213d',
        accent:   '#fca311',
        primary:  '#ffffff',
        muted:    '#e5e5e5',

        // Backward compat aliases
        xblack:   '#000000',
        xdark: {
          DEFAULT: '#000000',
          lighter: '#0a0f1e',
          hover:   '#14213d',
          border:  '#1b2a4a',
          elevated:'#14213d',
        },
        xbrand:   '#fca311',
        xcard:    '#14213d',
        xtext: {
          DEFAULT:   '#ffffff',
          secondary: '#e5e5e5',
          tertiary:  '#e5e5e5',
        },
      },
    },
  },
  plugins: [],
}
