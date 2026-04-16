/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "error-container": "#ffdad6",
        outline: "#6c7a71",
        "inverse-surface": "#342f2b",

        primary: "#006c49",
        "primary-container": "#10b981",
        "primary-fixed": "#6ffbbe",
        "primary-fixed-dim": "#4edea3",
        "inverse-primary": "#4edea3",

        secondary: "#2b6954",
        "secondary-container": "#adedd3",
        "secondary-fixed": "#b0f0d6",
        "secondary-fixed-dim": "#95d3ba",

        tertiary: "#904d00",
        "tertiary-container": "#f08921",
        "tertiary-fixed": "#ffdcc3",
        "tertiary-fixed-dim": "#ffb77d",

        background: "#fff8f5",
        "header-footer": "#0F4D2E",

        surface: "#fff8f5",
        "surface-dim": "#e2d8d2",
        "surface-bright": "#fff8f5",
        "surface-container": "#f6ece6",
        "surface-container-low": "#fcf2eb",
        "surface-container-high": "#f0e6e0",
        "surface-container-highest": "#eae1da",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#eae1da",

        outline: "#6c7a71",
        "outline-variant": "#bbcabf",

        "on-primary": "#ffffff",
        "on-primary-container": "#00422b",
        "on-primary-fixed": "#002113",
        "on-primary-fixed-variant": "#005236",

        "on-secondary": "#ffffff",
        "on-secondary-container": "#306d58",
        "on-secondary-fixed": "#002117",
        "on-secondary-fixed-variant": "#0b513d",

        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#5a2e00",
        "on-tertiary-fixed": "#2f1500",
        "on-tertiary-fixed-variant": "#6e3900",

        "on-surface": "#1f1b17",
        "on-surface-variant": "#3c4a42",
        "on-background": "#1f1b17",

        "inverse-on-surface": "#f9efe8",
        "inverse-surface": "#342f2b",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        info: {
          DEFAULT: "#336052",     // chữ + icon
          bg: "rgba(183, 231, 213, 0.2)",          // nền
        }
      },

      borderRadius: {
        DEFAULT: "20px",
        lg: "24px",
        xl: "28px",
        full: "9999px",
      },

      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        label: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
