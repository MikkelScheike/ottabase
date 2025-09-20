module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbff",
          500: "#0ea5a5",
          700: "#0b7b7b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [
    // shared plugins for /apps/* to use
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
