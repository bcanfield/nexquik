/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
