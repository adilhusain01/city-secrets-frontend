/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        pastel: {
          pink: "#FFD6E0",
          blue: "#C1E8FF",
          mint: "#C1FFD7",
          lavender: "#E5D4FF",
          yellow: "#FFF4BD",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.85)",
          lighter: "rgba(255, 255, 255, 0.6)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
