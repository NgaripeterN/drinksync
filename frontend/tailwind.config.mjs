/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class', // Enable dark mode based on the 'dark' class in the HTML
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
