import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', hover: 'hsl(var(--primary-hover))' },
        accent: { DEFAULT: 'hsl(var(--accent))', hover: 'hsl(var(--accent-hover))' },
        surface: { DEFAULT: 'hsl(var(--surface))', hover: 'hsl(var(--surface-hover))' },
        muted: 'hsl(var(--muted))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--error))',
        info: 'hsl(var(--info))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
