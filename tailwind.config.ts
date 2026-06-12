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
          50: '#f6f7f4',
          100: '#eaece5',
          200: '#c5cbbe',
          300: '#a3ad98',
          400: '#7b876d',
          500: '#5e684f', // mid olive
          600: '#49503d', // deep olive
          700: '#383e30', // very deep olive
          800: '#23271d', // rich black olive
          900: '#11140c', // Darker base for containers (higher contrast)
          950: '#060804', // Near-black base (for background)
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
