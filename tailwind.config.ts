import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#dfcfa5',
          DEFAULT: '#bba35a',
          dark: '#937d3e',
        },
        luxury: {
          charcoal: '#0d0d0e',
          obsidian: '#050505',
          beige: '#fcfbfa',
          sand: '#f5f2eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
