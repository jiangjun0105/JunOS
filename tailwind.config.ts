import type { Config } from 'tailwindcss'

/**
 * Colors are mapped to CSS variables (defined in src/styles/theme.css) using the
 * `rgb(var(--token) / <alpha-value>)` pattern. That `<alpha-value>` placeholder is
 * what lets utilities like `bg-accent/10` produce a translucent version of a token.
 *
 * To reskin the app you edit the token VALUES in src/styles/theme.css — this file
 * just gives the tokens friendly Tailwind names.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        desktop: 'rgb(var(--desktop-bg) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--accent-2) / <alpha-value>)',
        'accent-3': 'rgb(var(--accent-3) / <alpha-value>)',
      },
      borderRadius: {
        window: 'var(--radius-window)',
        tile: 'var(--radius-tile)',
      },
      boxShadow: {
        window: 'var(--shadow-window)',
        soft: 'var(--shadow-soft)',
      },
      fontFamily: {
        // Families live as CSS vars in theme.css (--font-chrome / --font-body).
        chrome: ['var(--font-chrome)'],
        display: ['var(--font-chrome)'], // back-compat alias: font-display === chrome
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}

export default config
