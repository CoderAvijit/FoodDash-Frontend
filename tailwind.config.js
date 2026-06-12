/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        // Warm, appetizing brand palette
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        ink: {
          900: "#1c1410",
          700: "#3f3530",
          500: "#6b5d54",
        },
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(234, 88, 12, 0.25)",
        soft: "0 8px 24px -10px rgba(28, 20, 16, 0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pop-in": "pop-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
