import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7', // bright accent text
          400: '#34d399', // main bright green
          500: '#10b981', // primary buttons
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#0c2e22', // card background
          950: '#061912', // page background
        },
        gold: {
          50: '#fbf9f0',
          100: '#f4ebd2',
          200: '#f1e2b5', // Lighter & brighter gold
          300: '#e5d194', // Lighter gold (high readability)
          400: '#d7bc6a', // standard gold
          500: '#b8903c', // deep gold
          600: '#9d762e', // dark gold
          700: '#7d5921',
          800: '#5e4016',
          900: '#3e280d',
          950: '#1f1305',
        }
      }
    },
  },
  plugins: [],
};

export default config;
