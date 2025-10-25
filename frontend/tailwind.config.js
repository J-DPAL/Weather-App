/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan all React source files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // blue tone for consistency
        secondary: "#38bdf8",
        neutralBg: "#f8fafc",
      },
    },
  },
  plugins: [],
};
