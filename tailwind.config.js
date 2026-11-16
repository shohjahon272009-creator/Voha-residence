const withAlpha = (name, fallback) => ({ opacityValue }) =>
  opacityValue === undefined || opacityValue === '1'
    ? `var(${name}, ${fallback})`
    : `color-mix(in srgb, var(${name}, ${fallback}) calc(${opacityValue} * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'var(--font-oswald)', 'sans-serif'],
      },
      colors: {
        // Ranglar runtime'da DB sozlamasidan (layout.tsx) keladi. Oddiy var() bilan Tailwind
        // `bg-primary/60` kabi shaffof variantlarni yarata olmasdi — color-mix bilan ishlaydi.
        primary: withAlpha('--color-primary', '#014242'),
        accent: withAlpha('--color-accent', '#D18E5B'),
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        // Design tokens (DESIGN.md) — globals.css'dagi --v-* o'zgaruvchilar
        canvas: 'var(--v-canvas)',
        surface: { DEFAULT: 'var(--v-surface)', sunken: 'var(--v-surface-sunken)' },
        inverse: { DEFAULT: 'var(--v-inverse)', 2: 'var(--v-inverse-2)' },
        ink: { DEFAULT: 'var(--v-text)', muted: 'var(--v-text-muted)', inverse: 'var(--v-text-inverse)', 'inverse-muted': 'var(--v-text-inverse-muted)' },
        cta: { DEFAULT: 'var(--v-accent)', ink: 'var(--v-accent-ink)' },
        'accent-text': 'var(--v-accent-text)',
        line: { DEFAULT: 'var(--v-border)', strong: 'var(--v-border-strong)', inverse: 'var(--v-border-inverse)' },
        st: {
          available: 'var(--v-available)', 'available-bg': 'var(--v-available-bg)',
          reserved: 'var(--v-reserved)', 'reserved-bg': 'var(--v-reserved-bg)',
          sold: 'var(--v-sold)', 'sold-bg': 'var(--v-sold-bg)',
          error: 'var(--v-error)', 'error-bg': 'var(--v-error-bg)',
        },
      },
      fontSize: {
        // Typography scale: fluid, ~1.25 nisbat
        display: ['clamp(2.5rem, 6vw, 5.5rem)', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        h1: ['clamp(2rem, 4.2vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['clamp(1.625rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      borderRadius: { 'v-sm': 'var(--v-radius-sm)', 'v-md': 'var(--v-radius-md)', 'v-lg': 'var(--v-radius-lg)', 'v-xl': 'var(--v-radius-xl)' },
      boxShadow: { 'v-sm': 'var(--v-shadow-sm)', 'v-md': 'var(--v-shadow-md)', 'v-lg': 'var(--v-shadow-lg)' },
      transitionTimingFunction: { v: 'var(--v-ease)' },
      transitionDuration: { 'v-fast': 'var(--v-dur-fast)', 'v-base': 'var(--v-dur-base)', 'v-slow': 'var(--v-dur-slow)' },
      maxWidth: { page: '1360px' },
    },
  },
  plugins: [],
};
