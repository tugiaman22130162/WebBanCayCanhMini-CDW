/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",      // xanh lá logo
        secondary: "#A5D6A7",    // xanh nhạt
        surface: "#F6FFF7",      // nền web
        accent: "#2E7D32",       // xanh đậm
        text: {
          primary: "#1B5E20",
          secondary: "#4B5563",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
}

