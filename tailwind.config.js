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
      },
    },
  },
  plugins: [],
};
